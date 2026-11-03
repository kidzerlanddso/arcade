import { useEffect, useState } from "react";
import api from "../api/axios";

const currentMonth = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 7);
};

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "AED",
  });

const paymentMethodLabel = (method) =>
  ({
    bank_transfer: "Bank transfer",
    card: "Card",
    cash: "Cash",
  })[method] || method;

function ArcadeReceivables() {
  const [source, setSource] = useState("arcade");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [months, setMonths] = useState([currentMonth()]);
  const [payments, setPayments] = useState([]);
  const [feeComparison, setFeeComparison] = useState([]);
  const [completedQuery, setCompletedQuery] = useState("");
  const [error, setError] = useState("");
  const queryKey = `${source}:${selectedMonth}:${paymentMethod}`;
  const loading = completedQuery !== queryKey;

  useEffect(() => {
    let active = true;
    api
      .get("/arcade/payments/report", {
        params: {
          month: selectedMonth,
          payment_method: paymentMethod,
          source,
        },
      })
      .then((response) => {
        if (!active) return;
        const availableMonths = response.data.months || [];
        setMonths(availableMonths);
        setPayments(response.data.data || []);
        setFeeComparison(response.data.comparison || []);
        setError("");
        setCompletedQuery(queryKey);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load the monthly payment report.",
          );
          setCompletedQuery(queryKey);
        }
      });

    return () => {
      active = false;
    };
  }, [source, selectedMonth, paymentMethod, queryKey]);

  const totalReceived = payments.reduce(
    (total, payment) =>
      total +
      Number(
        source === "sparkles" ? payment.amount_total || 0 : payment.amount || 0,
      ),
    0,
  );
  const expectedFees = feeComparison.reduce(
    (total, customer) => total + Number(customer.expected_fees || 0),
    0,
  );
  const receivablesGap = expectedFees - totalReceived;
  const formattedMonth = (month) =>
    new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });

  return (
    <main className="arcade-management arcade-receivables page-container">
      <header className="arcade-management-header">
        <div>
          <p className="arcade-eyebrow">Kidzerland - ARCADE</p>
          <h1>Receivables</h1>
          <p>Review daily receipts by business, month, and payment method.</p>
        </div>
      </header>

      {error && !loading && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}

      <section className="arcade-section">
        <div className="arcade-section-heading arcade-received-heading">
          <div>
            <h2>Payment report</h2>
            <p>Choose a month and payment method to update the report.</p>
          </div>
          <div className="arcade-report-filters">
            <label className="arcade-month-picker" htmlFor="receivables-source">
              Business
              <select
                id="receivables-source"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setPaymentMethod("all");
                }}
              >
                <option value="arcade">KL Arcade</option>
                <option value="sparkles">Sparkles</option>
              </select>
            </label>
            <label className="arcade-month-picker" htmlFor="payment-month">
              Month
              <select
                id="payment-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                {!months.includes(selectedMonth) && (
                  <option value={selectedMonth}>
                    {formattedMonth(selectedMonth)}
                  </option>
                )}
                {months.map((month) => (
                  <option key={month} value={month}>
                    {formattedMonth(month)}
                  </option>
                ))}
              </select>
            </label>
            <label className="arcade-month-picker" htmlFor="payment-method">
              Payment method
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="all">All methods</option>
                <option value="cash">Cash</option>
                {source === "arcade" && (
                  <option value="bank_transfer">Bank transfer</option>
                )}
                <option value="card">Card</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <p className="arcade-muted" role="status">
            Loading payment report…
          </p>
        ) : (
          <>
            {source === "arcade" ? (
              <>
                <div className="arcade-summary-grid arcade-receivables-comparison-summary">
                  <article>
                    <span>Expected fees</span>
                    <strong>{currency(expectedFees)}</strong>
                  </article>
                  <article>
                    <span>Actual received</span>
                    <strong>{currency(totalReceived)}</strong>
                  </article>
                  <article
                    className={
                      receivablesGap > 0
                        ? "arcade-comparison-shortfall"
                        : "arcade-comparison-covered"
                    }
                  >
                    <span>
                      {receivablesGap > 0
                        ? "Still outstanding"
                        : receivablesGap < 0
                          ? "Overpaid"
                          : "Fully received"}
                    </span>
                    <strong>{currency(Math.abs(receivablesGap))}</strong>
                  </article>
                  <article>
                    <span>Payments</span>
                    <strong>{payments.length}</strong>
                  </article>
                </div>

                <h3 className="arcade-report-subheading">
                  Expected fees vs actual received by customer
                </h3>
                {feeComparison.length ? (
                  <div className="table-responsive">
                    <table className="table arcade-received-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th className="text-end">Expected fees</th>
                          <th className="text-end">Actual received</th>
                          <th className="text-end">Outstanding / overpaid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeComparison.map((customer) => {
                          const difference = Number(customer.difference || 0);
                          return (
                            <tr key={customer.customer_id}>
                              <td>{customer.customer_name}</td>
                              <td className="text-end">
                                {currency(customer.expected_fees)}
                              </td>
                              <td className="text-end">
                                {currency(customer.received)}
                              </td>
                              <td
                                className={`text-end ${difference > 0 ? "arcade-comparison-shortfall-text" : "arcade-comparison-covered-text"}`}
                              >
                                {difference < 0
                                  ? `Overpaid ${currency(Math.abs(difference))}`
                                  : currency(difference)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>Total</th>
                          <th className="text-end">{currency(expectedFees)}</th>
                          <th className="text-end">{currency(totalReceived)}</th>
                          <th className="text-end">
                            {receivablesGap < 0
                              ? `Overpaid ${currency(Math.abs(receivablesGap))}`
                              : currency(receivablesGap)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="arcade-muted">
                    No fees or payments were recorded for {formattedMonth(selectedMonth)}.
                  </p>
                )}

                <h3 className="arcade-report-subheading">Payment details</h3>
                {payments.length ? (
                  <div className="table-responsive">
                    <table className="table arcade-received-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Payment date</th>
                          <th>Method / reference month</th>
                          <th>Fees covered</th>
                          <th className="text-end">Amount received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.customer_name}</td>
                            <td>{String(payment.paid_on).slice(0, 10)}</td>
                            <td>
                              {paymentMethodLabel(payment.payment_method)}
                              {payment.reference ? ` · ${payment.reference}` : ""}
                            </td>
                            <td>
                              {payment.allocations?.length
                                ? payment.allocations
                                    .map(
                                      (allocation) =>
                                        `${allocation.description || "Fee"} (${currency(allocation.allocated_amount)})`,
                                    )
                                    .join(", ")
                                : "Unallocated payment"}
                            </td>
                            <td className="text-end">
                              {currency(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="arcade-muted">
                    No payments were received for {formattedMonth(selectedMonth)}
                    {paymentMethod !== "all"
                      ? ` by ${paymentMethodLabel(paymentMethod).toLowerCase()}`
                      : ""}
                    .
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="arcade-summary-grid arcade-received-summary">
                  <article>
                    <span>Total received</span>
                    <strong>{currency(totalReceived)}</strong>
                  </article>
                  <article>
                    <span>Daily records</span>
                    <strong>{payments.length}</strong>
                  </article>
                </div>
                {payments.length ? (
                  <div className="table-responsive">
                    <table className="table arcade-received-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th className="text-end">Cash received</th>
                          <th className="text-end">Card received</th>
                          <th className="text-end">Total received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{String(payment.payment_date).slice(0, 10)}</td>
                            <td className="text-end">
                              {currency(payment.amount_cash)}
                            </td>
                            <td className="text-end">
                              {currency(payment.amount_card)}
                            </td>
                            <td className="text-end">
                              {currency(payment.amount_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="arcade-muted">
                    No payments were received for {formattedMonth(selectedMonth)}
                    {paymentMethod !== "all"
                      ? ` by ${paymentMethodLabel(paymentMethod).toLowerCase()}`
                      : ""}
                    .
                  </p>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default ArcadeReceivables;
