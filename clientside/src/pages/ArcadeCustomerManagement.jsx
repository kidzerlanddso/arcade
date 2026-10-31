import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import kl_logo from "../assets/logo.png";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};
const firstOfMonth = () => `${today().slice(0, 7)}-01`;
const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "AED",
  });

function ArcadeCustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [customerForm, setCustomerForm] = useState({
    name: "",
    notes: "",
    is_active: true,
  });
  const [contactForm, setContactForm] = useState({
    contact_name: "",
    phone: "",
    email: "",
    contact_role: "",
    is_primary: false,
  });
  const [feeForm, setFeeForm] = useState({
    description: "Monthly fee",
    amount: "",
    issued_on: firstOfMonth(),
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "cash",
    paid_on: today(),
    reference: today().slice(0, 7),
    allocations: {},
  });

  const loadCustomers = useCallback(
    async (preferredId = selectedId) => {
      const customerResponse = await api.get("/arcade/customers");
      const rows = customerResponse.data?.data || [];
      setCustomers(rows);
      const nextId = rows.some((row) => String(row.id) === String(preferredId))
        ? String(preferredId)
        : rows[0]
          ? String(rows[0].id)
          : "";
      setSelectedId(nextId);
      if (nextId) {
        const detailResponse = await api.get(`/arcade/customers/${nextId}`);
        setDetails(detailResponse.data);
      } else {
        setDetails(null);
      }
    },
    [selectedId],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const generationResponse = await api.post(
          "/arcade/fees/generate-monthly",
        );
        if (active && generationResponse.data.created_count > 0) {
          setNotice(
            `Generated ${generationResponse.data.created_count} monthly fee${generationResponse.data.created_count === 1 ? "" : "s"} based on last month.`,
          );
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to generate monthly fees.",
          );
        }
      }

      try {
        const customerResponse = await api.get("/arcade/customers");
        if (!active) return;
        const rows = customerResponse.data?.data || [];
        setCustomers(rows);
        if (rows[0]) {
          setSelectedId(String(rows[0].id));
          const detailResponse = await api.get(
            `/arcade/customers/${rows[0].id}`,
          );
          if (active) setDetails(detailResponse.data);
        }
      } catch (requestError) {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Unable to load customer records.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const selectCustomer = async (event) => {
    const id = event.target.value;
    setSelectedId(id);
    setSelectedPaymentIds([]);
    setPaymentForm((current) => ({ ...current, allocations: {} }));
    setError("");
    if (!id) {
      setDetails(null);
      return;
    }
    try {
      const response = await api.get(`/arcade/customers/${id}`);
      setDetails(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load this customer.",
      );
    }
  };

  const submit = async (event, kind) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      if (kind === "customer") {
        const response = editingCustomerId
          ? await api.put(
              `/arcade/customers/${editingCustomerId}`,
              customerForm,
            )
          : await api.post("/arcade/customers", customerForm);
        setCustomerForm({ name: "", notes: "", is_active: true });
        setEditingCustomerId(null);
        await loadCustomers(String(response.data.customer.id));
        setNotice(editingCustomerId ? "Customer updated." : "Customer added.");
      } else if (kind === "contact") {
        await api.post(`/arcade/customers/${selectedId}/contacts`, contactForm);
        setContactForm({
          contact_name: "",
          phone: "",
          email: "",
          contact_role: "",
          is_primary: false,
        });
        await loadCustomers(selectedId);
        setNotice("Contact added.");
      } else if (kind === "fee") {
        const feeRequest = {
          ...feeForm,
          customer_id: selectedId,
          amount: Number(feeForm.amount),
        };
        if (editingFeeId) {
          await api.put(`/arcade/fees/${editingFeeId}`, feeRequest);
        } else {
          await api.post("/arcade/fees", feeRequest);
        }
        const wasEditing = Boolean(editingFeeId);
        setEditingFeeId(null);
        setFeeForm({
          description: "Monthly fee",
          amount: "",
          issued_on: firstOfMonth(),
          notes: "",
        });
        await loadCustomers(selectedId);
        setNotice(wasEditing ? "Fee updated." : "Fee recorded.");
      } else {
        let remainingAmount = Number(paymentForm.amount);
        const allocations = [];
        for (const [feeId, amount] of Object.entries(paymentForm.allocations)) {
          const allocatedAmount = Math.min(Number(amount), remainingAmount);
          if (allocatedAmount > 0) {
            allocations.push({
              fee_id: Number(feeId),
              allocated_amount: allocatedAmount,
            });
            remainingAmount -= allocatedAmount;
          }
        }
        const paymentRequest = {
          customer_id: selectedId,
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          paid_on: paymentForm.paid_on,
          reference: paymentForm.reference,
          allocations,
        };
        const wasEditing = Boolean(editingPaymentId);
        if (editingPaymentId) {
          await api.put(`/arcade/payments/${editingPaymentId}`, paymentRequest);
        } else {
          await api.post("/arcade/payments", paymentRequest);
        }
        setEditingPaymentId(null);
        setPaymentForm({
          amount: "",
          payment_method: "cash",
          paid_on: today(),
          reference: today().slice(0, 7),
          allocations: {},
        });
        await loadCustomers(selectedId);
        setNotice(wasEditing ? "Payment updated." : "Payment recorded.");
      }
      setActiveModal(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || `Unable to save ${kind}.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const setField = (setter) => (event) => {
    const { name, value, type, checked } = event.target;
    setter((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const customerSummary = details?.summary || {};
  const selectedPayments = (details?.payments || []).filter((payment) =>
    selectedPaymentIds.includes(String(payment.id)),
  );
  const allPaymentsSelected =
    Boolean(details?.payments?.length) &&
    details.payments.every((payment) =>
      selectedPaymentIds.includes(String(payment.id)),
    );
  const togglePaymentSelection = (paymentId) => {
    const id = String(paymentId);
    setSelectedPaymentIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };
  const toggleAllPayments = () => {
    setSelectedPaymentIds(
      allPaymentsSelected
        ? []
        : (details?.payments || []).map((payment) => String(payment.id)),
    );
  };
  const generateInvoice = () => {
    if (!selectedPayments.length) return;
    const timestamp = new Date();
    const stamp = `${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, "0")}${String(timestamp.getDate()).padStart(2, "0")}-${String(timestamp.getHours()).padStart(2, "0")}${String(timestamp.getMinutes()).padStart(2, "0")}${String(timestamp.getSeconds()).padStart(2, "0")}`;
    setInvoiceNumber(`AR-${selectedId}-${stamp}`);
    setInvoiceOpen(true);
  };
  const openCustomerForm = (customer = null) => {
    setEditingCustomerId(customer?.id || null);
    setCustomerForm({
      name: customer?.name || "",
      notes: customer?.notes || "",
      is_active: customer?.is_active ?? true,
    });
    setActiveModal("customer");
    setError("");
  };
  const openModal = (name, record = null) => {
    if (name === "contact")
      setContactForm({
        contact_name: "",
        phone: "",
        email: "",
        contact_role: "",
        is_primary: false,
      });
    if (name === "fee") {
      setEditingFeeId(record?.id || null);
      setFeeForm({
        description:
          record?.description ||
          details?.fees?.[0]?.description ||
          "Monthly fee",
        amount: record?.amount ?? details?.fees?.[0]?.amount ?? "",
        issued_on: record?.issued_on || firstOfMonth(),
        notes: record?.notes || "",
      });
    }
    if (name === "payment") {
      setEditingPaymentId(record?.id || null);
      if (record) {
        setPaymentForm({
          amount: Number(record.amount).toFixed(2),
          payment_method: record.payment_method || "cash",
          paid_on: String(record.paid_on).slice(0, 10),
          reference: /^\d{4}-(0[1-9]|1[0-2])$/.test(record.reference || "")
            ? record.reference
            : String(record.paid_on).slice(0, 7),
          allocations: Object.fromEntries(
            (record.allocations || []).map((allocation) => [
              String(allocation.fee_id),
              Number(allocation.allocated_amount).toFixed(2),
            ]),
          ),
        });
        setActiveModal(name);
        setError("");
        return;
      }
      const allocatedByFee = new Map();
      (details?.payments || []).forEach((payment) => {
        (payment.allocations || []).forEach((allocation) => {
          const feeKey = String(allocation.fee_id);
          allocatedByFee.set(
            feeKey,
            (allocatedByFee.get(feeKey) || 0) +
              Number(allocation.allocated_amount || 0),
          );
        });
      });
      const allocations = Object.fromEntries(
        (details?.fees || [])
          .map((fee) => {
            const outstanding = Math.max(
              0,
              Number(fee.amount || 0) -
                (allocatedByFee.get(String(fee.id)) || 0),
            );
            return [
              String(fee.id),
              outstanding > 0 ? outstanding.toFixed(2) : "",
            ];
          })
          .filter(([, amount]) => amount),
      );
      const outstanding = Object.values(allocations).reduce(
        (sum, amount) => sum + Number(amount),
        0,
      );
      setPaymentForm({
        amount: outstanding > 0 ? outstanding.toFixed(2) : "",
        payment_method: "cash",
        paid_on: today(),
        reference: today().slice(0, 7),
        allocations,
      });
    }
    setActiveModal(name);
    setError("");
  };
  const deleteCustomer = async () => {
    if (
      !selectedId ||
      !window.confirm(`Delete ${details?.customer?.name || "this customer"}?`)
    )
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/arcade/customers/${selectedId}`);
      await loadCustomers("");
      setNotice("Customer deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete customer. Remove its fee and payment records first.",
      );
    } finally {
      setSaving(false);
    }
  };
  const deleteFee = async (fee) => {
    if (
      !window.confirm(`Delete the fee “${fee.description || "Monthly fee"}”?`)
    )
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/arcade/fees/${fee.id}`);
      await loadCustomers(selectedId);
      setNotice("Fee deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete fee.");
    } finally {
      setSaving(false);
    }
  };
  const deletePayment = async (payment) => {
    if (!window.confirm(`Delete this payment of ${currency(payment.amount)}?`))
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/arcade/payments/${payment.id}`);
      setSelectedPaymentIds((current) =>
        current.filter((id) => id !== String(payment.id)),
      );
      await loadCustomers(selectedId);
      setNotice("Payment deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="arcade-management page-container">
      <header className="arcade-management-header">
        <div>
          <p className="arcade-eyebrow">Kidzerland - ARCADE </p>
          <h1>Membership management</h1>
          <p>Keep contacts, fees, and payments together.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openCustomerForm()}
        >
          Add customer
        </button>
      </header>

      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="alert alert-success" role="status">
          {notice}
        </p>
      )}

      {loading && <p role="status">Loading customer records…</p>}

      {!loading && !customers.length && (
        <section className="arcade-empty-state">
          <h2>No customers yet</h2>
          <p>
            Add your first arcade customer to begin tracking contacts and
            payments.
          </p>
        </section>
      )}

      {details && !loading && (
        <>
            <section className="arcade-customer-picker">
              <label htmlFor="customer-select">Customer</label>
              <select
                id="customer-select"
                value={selectedId}
                onChange={selectCustomer}
                disabled={loading || customers.length === 0}
              >
                {customers.length === 0 && (
                  <option value="">No customers yet</option>
                )}
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <span>
                {customers.length} customer{customers.length === 1 ? "" : "s"}
              </span>
            </section>
            <section className="arcade-customer-overview">
              <div>
                <h2>{details.customer?.name}</h2>
                {details.customer?.created_at && (
                  <p>
                    Started from{" "}
                    <strong>
                      {" "}
                      {details.customer.created_at.split("T")[0]}
                    </strong>
                  </p>
                )}
              </div>
              <div className="arcade-customer-actions">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => openCustomerForm(details.customer)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={deleteCustomer}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </section>
            <section
              className="arcade-summary-grid"
              aria-label="Customer balance summary"
            >
              <article>
                <span>Fees</span>
                <strong>{currency(customerSummary.total_fees)}</strong>
              </article>
              <article>
                <span>Paid</span>
                <strong>{currency(customerSummary.total_paid)}</strong>
              </article>
              <article>
                <span>Balance</span>
                <strong>{currency(customerSummary.balance)}</strong>
              </article>
              <article>
                <span>Account</span>
                <strong>
                  {details.customer?.is_active ? "Active" : "Inactive"}
                </strong>
              </article>
            </section>

            <section className="arcade-section">
              <div className="arcade-section-heading">
                <div>
                  <h2>Contacts</h2>
                  <p>People to reach for this customer.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => openModal("contact")}
                >
                  Add contact
                </button>
              </div>
              {details.contacts?.length ? (
                <div className="arcade-record-list">
                  {details.contacts.map((contact) => (
                    <article key={contact.id}>
                      <div>
                        <strong>
                          {contact.contact_name}
                          {contact.is_primary ? " · Primary" : ""}
                        </strong>
                        <span>{contact.contact_role || "Contact"}</span>
                      </div>
                      <div>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`}>
                            {contact.email}
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="arcade-muted">No contacts recorded.</p>
              )}
            </section>

            <section className="arcade-section">
              <div className="arcade-section-heading">
                <div>
                  <h2>Monthly Fees</h2>
                  <p>Charges issued to this customer.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => openModal("fee")}
                >
                  Add fee
                </button>
              </div>
              {details.fees?.length ? (
                <div className="arcade-record-list">
                  {details.fees.map((fee) => (
                    <article key={fee.id}>
                      <div>
                        <strong>{fee.description || "Monthly fee"}</strong>
                        <span>Issued {fee.issued_on}</span>
                        <span>M: {fee.notes}</span>
                      </div>
                      <strong>{currency(fee.amount)}</strong>
                      <div className="arcade-record-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal("fee", fee)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteFee(fee)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="arcade-muted">No fees recorded.</p>
              )}
            </section>

            <section className="arcade-section">
              <div className="arcade-section-heading">
                <div>
                  <h2>Payments</h2>
                  <p>
                    Record cash, bank transfer, or card payments and allocate
                    them to a fee.
                  </p>
                </div>
                <div className="arcade-payment-toolbar">
                  {details.payments?.length > 0 && (
                    <label className="arcade-select-all">
                      <input
                        type="checkbox"
                        checked={allPaymentsSelected}
                        onChange={toggleAllPayments}
                      />
                      Select all
                    </label>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={generateInvoice}
                    disabled={selectedPayments.length === 0}
                  >
                    Generate invoice
                    {selectedPayments.length
                      ? ` (${selectedPayments.length})`
                      : ""}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => openModal("payment")}
                  >
                    Record payment
                  </button>
                </div>
              </div>
              {details.payments?.length ? (
                <div className="arcade-record-list">
                  {details.payments.map((payment) => (
                    <article key={payment.id}>
                      <label className="arcade-payment-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedPaymentIds.includes(
                            String(payment.id),
                          )}
                          onChange={() => togglePaymentSelection(payment.id)}
                          aria-label={`Select payment ${currency(payment.amount)} dated ${payment.paid_on}`}
                        />
                      </label>
                      <div>
                        <strong>
                          {currency(payment.amount)} ·{" "}
                          {payment.payment_method === "bank_transfer"
                            ? "Bank transfer"
                            : payment.payment_method === "card"
                              ? "Card"
                              : "Cash"}
                        </strong>
                        <span>
                          Paid {payment.paid_on}
                          {payment.reference
                            ? ` · Ref ${payment.reference}`
                            : ""}
                        </span>
                        {payment.allocations?.map((allocation) => (
                          <span key={allocation.fee_id}>
                            Allocated{" "}
                            {currency(allocation.allocated_amount)}{" "}
                          </span>
                        ))}
                      </div>
                      <div className="arcade-record-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal("payment", payment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deletePayment(payment)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="arcade-muted">No payments recorded.</p>
              )}
            </section>
        </>
      )}

      {activeModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveModal(null);
          }}
        >
          <section
            className="modal-card arcade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="arcade-modal-title"
          >
            <div className="modal-header">
              <h2 id="arcade-modal-title">
                {activeModal === "customer"
                  ? editingCustomerId
                    ? "Edit customer"
                    : "Add customer"
                  : activeModal === "contact"
                    ? "Add contact"
                    : activeModal === "fee"
                      ? editingFeeId
                        ? "Edit fee"
                        : "Add fee"
                      : editingPaymentId
                        ? "Edit payment"
                        : "Record payment"}
              </h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className="arcade-form arcade-form-grid"
              onSubmit={(event) => submit(event, activeModal)}
            >
              {activeModal === "customer" && (
                <>
                  <label>
                    Customer name
                    <input
                      name="name"
                      value={customerForm.name}
                      onChange={setField(setCustomerForm)}
                      required
                    />
                  </label>
                  <label className="arcade-form-wide">
                    Notes
                    <textarea
                      name="notes"
                      value={customerForm.notes}
                      onChange={setField(setCustomerForm)}
                    />
                  </label>
                  {editingCustomerId && (
                    <label className="arcade-checkbox">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={customerForm.is_active}
                        onChange={setField(setCustomerForm)}
                      />{" "}
                      Active customer
                    </label>
                  )}
                </>
              )}
              {activeModal === "contact" && (
                <>
                  <label>
                    Name
                    <input
                      name="contact_name"
                      value={contactForm.contact_name}
                      onChange={setField(setContactForm)}
                      required
                    />
                  </label>
                  <label>
                    Relationship
                    <input
                      name="contact_role"
                      value={contactForm.contact_role}
                      onChange={setField(setContactForm)}
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      name="phone"
                      value={contactForm.phone}
                      onChange={setField(setContactForm)}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={setField(setContactForm)}
                    />
                  </label>
                  <label className="arcade-checkbox">
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={contactForm.is_primary}
                      onChange={setField(setContactForm)}
                    />{" "}
                    Primary contact
                  </label>
                </>
              )}
              {activeModal === "fee" && (
                <>
                  <label className="arcade-form-wide">
                    Fee description
                    <input
                      name="description"
                      value={feeForm.description}
                      onChange={setField(setFeeForm)}
                      required
                    />
                  </label>
                  <label>
                    Amount (AED)
                    <input
                      type="number"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={feeForm.amount}
                      onChange={setField(setFeeForm)}
                      required
                    />
                  </label>
                  <label>
                    Issued date
                    <input
                      type="date"
                      name="issued_on"
                      value={feeForm.issued_on}
                      onChange={setField(setFeeForm)}
                      required
                    />
                  </label>
                  <label className="arcade-form-wide">
                    Notes
                    <textarea
                      name="notes"
                      value={feeForm.notes}
                      onChange={setField(setFeeForm)}
                    />
                  </label>
                </>
              )}
              {activeModal === "payment" && (
                <>
                  <label>
                    Amount (AED)
                    <input
                      type="number"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={setField(setPaymentForm)}
                      required
                    />
                  </label>
                  <label>
                    Method
                    <select
                      name="payment_method"
                      value={paymentForm.payment_method}
                      onChange={setField(setPaymentForm)}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="card">Card</option>
                    </select>
                  </label>
                  <label>
                    Payment date
                    <input
                      type="date"
                      name="paid_on"
                      value={paymentForm.paid_on}
                      onChange={setField(setPaymentForm)}
                      required
                    />
                  </label>
                  <label>
                    Reference month
                    <input
                      type="month"
                      name="reference"
                      value={paymentForm.reference}
                      onChange={setField(setPaymentForm)}
                      required
                    />
                  </label>
                </>
              )}
              {error && (
                <p className="alert alert-danger arcade-form-wide" role="alert">
                  {error}
                </p>
              )}
              <div className="arcade-modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : activeModal === "payment"
                      ? editingPaymentId
                        ? "Save payment changes"
                        : "Save payment"
                      : activeModal === "fee"
                        ? editingFeeId
                          ? "Save fee changes"
                          : "Save fee"
                        : activeModal === "contact"
                          ? "Save contact"
                          : editingCustomerId
                            ? "Save changes"
                            : "Save customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {invoiceOpen && selectedPayments.length > 0 && (
        <div className="arcade-invoice-overlay">
          <div className="arcade-invoice-toolbar">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setInvoiceOpen(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print / Save PDF
            </button>
          </div>
          <article className="arcade-invoice-sheet">
            <header className="arcade-invoice-header">
              <div>
                <p className="arcade-logo" aria-label="Kidzerland logo">
                  <img src={kl_logo} />
                </p>
                <h1>Payment invoice</h1>
                <p>
                  Payment record for {details?.customer?.name || "Customer"}
                </p>
              </div>
              <div className="arcade-invoice-meta">
                <span>
                  <strong>Invoice no.</strong> {invoiceNumber}
                </span>
                <span>
                  <strong>Issued</strong>{" "}
                  {new Date(`${today()}T00:00:00`).toLocaleDateString()}
                </span>
                <span>
                  <strong>Items</strong> {selectedPayments.length} payment
                  {selectedPayments.length === 1 ? "" : "s"}
                </span>
              </div>
            </header>

            <div className="table-responsive">
              <table className="table arcade-invoice-table">
                <thead>
                  <tr>
                    <th>Payment date</th>
                    <th>Method / reference</th>
                    <th>Month</th>
                    <th className="arcade-invoice-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {new Date(
                          `${String(payment.paid_on).slice(0, 10)}T00:00:00`,
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        {payment.payment_method === "bank_transfer"
                          ? "Bank transfer"
                          : payment.payment_method === "card"
                            ? "Card"
                            : "Cash"}
                      </td>
                      <td>
                        {payment.reference && (
                          <small className="arcade-invoice-subline">
                            {" "}
                            {payment.reference}
                          </small>
                        )}
                      </td>
                      <td className="arcade-invoice-amount">
                        {currency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3">Total selected payments</th>
                    <th className="arcade-invoice-amount">
                      {currency(
                        selectedPayments.reduce(
                          (sum, payment) => sum + Number(payment.amount || 0),
                          0,
                        ),
                      )}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="arcade-invoice-footnote">
              This invoice summarizes the selected payment records for the
              customer shown above.
            </p>
          </article>
        </div>
      )}
    </main>
  );
}

export default ArcadeCustomerManagement;
