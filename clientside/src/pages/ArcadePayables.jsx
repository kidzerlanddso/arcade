import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const currentMonth = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 7);
};

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

const emptyExpense = () => ({
  expense_type: "manual",
  description: "",
  amount: "",
  expense_date: today(),
  expense_year: Number(currentMonth().slice(0, 4)),
});

const formatMonth = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

function ArcadePayables() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [report, setReport] = useState({
    months: [currentMonth()],
    expenses: [],
    card_processing: [],
  });
  const [form, setForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState(null);
  const [completedQuery, setCompletedQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const queryKey = `${selectedMonth}:${reloadKey}`;
  const loading = completedQuery !== queryKey;

  useEffect(() => {
    let active = true;
    api
      .get("/arcade/payables", { params: { month: selectedMonth } })
      .then((response) => {
        if (active) {
          setReport(response.data);
          setError("");
          setCompletedQuery(queryKey);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load monthly payables.",
          );
          setCompletedQuery(queryKey);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedMonth, reloadKey, queryKey]);

  const annualAmount = form.expense_type === "annual";
  const manualExpenses = report.expenses.filter(
    (expense) => expense.expense_type === "manual",
  );
  const annualExpenses = report.expenses.filter(
    (expense) => expense.expense_type === "annual",
  );
  const manualTotal = manualExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const annualTotal = annualExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const cardTotal = report.card_processing.reduce(
    (total, payment) => total + Number(payment.expense_amount || 0),
    0,
  );
  const totalPayables = manualTotal + annualTotal + cardTotal;
  const availableMonths = useMemo(
    () =>
      report.months?.includes(selectedMonth)
        ? report.months
        : [selectedMonth, ...(report.months || [])],
    [report.months, selectedMonth],
  );

  const resetForm = () => {
    setForm(emptyExpense());
    setEditingId(null);
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        expense_year: annualAmount ? Number(form.expense_year) : null,
        expense_date: annualAmount ? null : form.expense_date,
      };
      if (editingId) {
        await api.put(`/arcade/payables/expenses/${editingId}`, payload);
      } else {
        await api.post("/arcade/payables/expenses", payload);
      }

      const nextMonth = annualAmount
        ? `${form.expense_year}-${selectedMonth.slice(5, 7)}`
        : form.expense_date.slice(0, 7);
      setSelectedMonth(nextMonth);
      setReloadKey((key) => key + 1);
      setNotice(editingId ? "Expense updated." : "Expense added.");
      resetForm();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save the expense.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editExpense = (expense) => {
    setEditingId(expense.id);
    setForm({
      expense_type: expense.expense_type,
      description: expense.description,
      amount:
        expense.expense_type === "annual"
          ? expense.annual_amount || expense.amount
          : expense.amount,
      expense_date: expense.expense_date
        ? String(expense.expense_date).slice(0, 10)
        : `${selectedMonth}-01`,
      expense_year: Number(expense.expense_year || selectedMonth.slice(0, 4)),
    });
    setError("");
    setNotice("");
    document
      .getElementById("payables-expense-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const deleteExpense = async (expense) => {
    if (!window.confirm(`Delete "${expense.description}" expense?`)) return;
    setError("");
    setNotice("");
    try {
      await api.delete(`/arcade/payables/expenses/${expense.id}`);
      if (String(editingId) === String(expense.id)) resetForm();
      setReloadKey((key) => key + 1);
      setNotice("Expense deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete the expense.",
      );
    }
  };

  return (
    <main className="arcade-management arcade-payables page-container">
      <header className="arcade-management-header">
        <div>
          <p className="arcade-eyebrow">KIDZERLAND · ARCADE</p>
          <h1>Payables</h1>
          <p>Track operating expenses and card processing costs by month.</p>
        </div>
        <label className="arcade-month-picker" htmlFor="payables-month">
          Reporting month
          <select
            id="payables-month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </label>
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

      <section className="arcade-summary-grid arcade-payables-summary">
        <article>
          <span>Total payables</span>
          <strong>{currency(totalPayables)}</strong>
        </article>
        <article>
          <span>Manual expenses</span>
          <strong>{currency(manualTotal)}</strong>
        </article>
        <article>
          <span>Annual expense average</span>
          <strong>{currency(annualTotal)}</strong>
        </article>
        <article>
          <span>Card processing (2.2%)</span>
          <strong>{currency(cardTotal)}</strong>
        </article>
      </section>

      <section className="arcade-section">
        <div className="arcade-section-heading">
          <div>
            <h2>{editingId ? "Edit expense" : "Add an expense"}</h2>
            <p>
              Annual amounts are allocated evenly across the 12 months of the
              selected year.
            </p>
          </div>
        </div>
        <form
          id="payables-expense-form"
          className="arcade-form arcade-payables-form"
          onSubmit={submitExpense}
        >
          <label>
            Expense type
            <select
              value={form.expense_type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  expense_type: event.target.value,
                }))
              }
            >
              <option value="manual">Manual expense</option>
              <option value="annual">Annual expense</option>
            </select>
          </label>
          <label>
            Description
            <input
              type="text"
              maxLength={255}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="e.g. Utilities, rent, supplies"
              required
            />
          </label>
          <label>
            {annualAmount ? "Annual amount (AED)" : "Amount (AED)"}
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              required
            />
          </label>
          {annualAmount ? (
            <label>
              Applies to year
              <input
                type="number"
                min="2000"
                max="2100"
                value={form.expense_year}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expense_year: event.target.value,
                  }))
                }
                required
              />
            </label>
          ) : (
            <label>
              Expense date
              <input
                type="date"
                value={form.expense_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expense_date: event.target.value,
                  }))
                }
                required
              />
            </label>
          )}
          <div className="arcade-payables-form-actions">
            {annualAmount && form.amount && (
              <p className="arcade-muted">
                Monthly average: {currency(Number(form.amount) / 12)}
              </p>
            )}
            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel edit
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Add expense"}
            </button>
          </div>
        </form>
      </section>

      <section className="arcade-section">
        <div className="arcade-section-heading">
          <div>
            <h2>{formatMonth(selectedMonth)} expenses</h2>
            <p>
              Card fees are calculated from recorded card receipts for KL
              Arcade and Sparkles.
            </p>
          </div>
        </div>
        {loading ? (
          <p className="arcade-muted" role="status">
            Loading payables…
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table arcade-payables-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Type</th>
                  <th>Calculation</th>
                  <th className="text-end">Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {manualExpenses.map((expense) => (
                  <tr key={`manual-${expense.id}`}>
                    <td>{expense.description}</td>
                    <td>Manual</td>
                    <td>{String(expense.expense_date).slice(0, 10)}</td>
                    <td className="text-end">{currency(expense.amount)}</td>
                    <td>
                      <div className="arcade-record-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => editExpense(expense)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteExpense(expense)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {annualExpenses.map((expense) => (
                  <tr key={`annual-${expense.id}`}>
                    <td>{expense.description}</td>
                    <td>Annual average</td>
                    <td>
                      {expense.expense_year}: {currency(expense.annual_amount)} /
                      12
                    </td>
                    <td className="text-end">{currency(expense.amount)}</td>
                    <td>
                      <div className="arcade-record-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => editExpense(expense)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteExpense(expense)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {report.card_processing.map((payment) => (
                  <tr key={`card-${payment.source}`}>
                    <td>{payment.description}</td>
                    <td>Card processing</td>
                    <td>
                      {currency(payment.card_amount)} card receipts × 2.2%
                    </td>
                    <td className="text-end">
                      {currency(payment.expense_amount)}
                    </td>
                    <td>
                      <span className="arcade-payables-automatic">Automatic</span>
                    </td>
                  </tr>
                ))}
                {!report.expenses.length &&
                  !report.card_processing.some(
                    (payment) => Number(payment.expense_amount) > 0,
                  ) && (
                    <tr>
                      <td colSpan={5} className="text-center arcade-muted">
                        No expenses recorded for {formatMonth(selectedMonth)}.
                      </td>
                    </tr>
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3}>Total payables</th>
                  <th className="text-end">{currency(totalPayables)}</th>
                  <th />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default ArcadePayables;
