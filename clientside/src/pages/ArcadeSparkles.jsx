import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "AED",
  });

const emptyForm = () => ({
  payment_date: today(),
  amount_cash: "",
  amount_card: "",
});

function ArcadeSparkles() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPayments = useCallback(async () => {
    const response = await api.get("/arcade/sparkles/daily-payments");
    setPayments(response.data.data || []);
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get("/arcade/sparkles/daily-payments")
      .then((response) => {
        if (active) setPayments(response.data.data || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load Sparkles daily payments.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const savePayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const request = {
      ...form,
      amount_cash: Number(form.amount_cash || 0),
      amount_card: Number(form.amount_card || 0),
    };

    try {
      if (editingId) {
        await api.put(`/arcade/sparkles/daily-payments/${editingId}`, request);
      } else {
        await api.post("/arcade/sparkles/daily-payments", request);
      }
      await loadPayments();
      setForm(emptyForm());
      setEditingId(null);
      setNotice(editingId ? "Daily payment updated." : "Daily payment recorded.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save Sparkles daily payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editPayment = (payment) => {
    setEditingId(payment.id);
    setForm({
      payment_date: String(payment.payment_date).slice(0, 10),
      amount_cash: String(payment.amount_cash),
      amount_card: String(payment.amount_card),
    });
    setError("");
    setNotice("");
  };

  const deletePayment = async (payment) => {
    if (
      !window.confirm(
        `Delete the Sparkles payment for ${String(payment.payment_date).slice(0, 10)}?`,
      )
    ) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api.delete(`/arcade/sparkles/daily-payments/${payment.id}`);
      await loadPayments();
      if (String(editingId) === String(payment.id)) {
        setEditingId(null);
        setForm(emptyForm());
      }
      setNotice("Daily payment deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete Sparkles daily payment.",
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  };

  return (
    <main className="arcade-management arcade-sparkles page-container">
      <header className="arcade-management-header">
        <div>
          <p className="arcade-eyebrow">KIDZERLAND</p>
          <h1>Sparkles daily payments</h1>
          <p>Record each day’s cash and card takings.</p>
        </div>
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

      <section className="arcade-section">
        <div className="arcade-section-heading">
          <div>
            <h2>{editingId ? "Edit daily payment" : "Add daily payment"}</h2>
            <p>Only one daily total can be entered for each date.</p>
          </div>
        </div>
        <form className="arcade-form arcade-sparkles-form" onSubmit={savePayment}>
          <label>
            Date
            <input
              type="date"
              name="payment_date"
              value={form.payment_date}
              onChange={updateForm}
              required
            />
          </label>
          <label>
            Amount cash (AED)
            <input
              type="number"
              name="amount_cash"
              min="0"
              step="0.01"
              value={form.amount_cash}
              onChange={updateForm}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Amount card (AED)
            <input
              type="number"
              name="amount_card"
              min="0"
              step="0.01"
              value={form.amount_card}
              onChange={updateForm}
              placeholder="0.00"
              required
            />
          </label>
          <div className="arcade-sparkles-form-actions">
            {editingId && (
              <button
                type="button"
                className="btn btn-light"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Add daily payment"}
            </button>
          </div>
        </form>
      </section>

      <section className="arcade-section">
        <div className="arcade-section-heading">
          <div>
            <h2>Payment history</h2>
            <p>{payments.length} daily record{payments.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        {loading ? (
          <p className="arcade-muted" role="status">
            Loading Sparkles payments…
          </p>
        ) : payments.length ? (
          <div className="table-responsive">
            <table className="table arcade-sparkles-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-end">Cash</th>
                  <th className="text-end">Card</th>
                  <th className="text-end">Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{String(payment.payment_date).slice(0, 10)}</td>
                    <td className="text-end">{currency(payment.amount_cash)}</td>
                    <td className="text-end">{currency(payment.amount_card)}</td>
                    <td className="text-end">
                      {currency(
                        Number(payment.amount_cash) + Number(payment.amount_card),
                      )}
                    </td>
                    <td>
                      <div className="arcade-record-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => editPayment(payment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deletePayment(payment)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="arcade-muted">No Sparkles daily payments recorded.</p>
        )}
      </section>
    </main>
  );
}

export default ArcadeSparkles;
