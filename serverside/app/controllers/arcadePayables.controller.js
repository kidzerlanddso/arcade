const db = require("../models/db");

const isValidMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const validateExpense = (body) => {
  const type = String(body?.expense_type || "");
  const description = String(body?.description || "").trim();
  const amount = Number(body?.amount);

  if (!["manual", "annual"].includes(type)) {
    return { error: "Choose a valid expense type." };
  }
  if (!description || description.length > 255) {
    return { error: "Enter a description up to 255 characters." };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
    return { error: "Enter an expense amount greater than zero." };
  }

  if (type === "manual") {
    const expenseDate = String(body?.expense_date || "");
    if (!isValidDate(expenseDate)) {
      return { error: "Enter a valid expense date." };
    }
    return { type, description, amount, expenseDate, expenseYear: null };
  }

  const expenseYear = Number(body?.expense_year);
  if (!Number.isInteger(expenseYear) || expenseYear < 2000 || expenseYear > 2100) {
    return { error: "Enter a valid year between 2000 and 2100." };
  }
  return { type, description, amount, expenseDate: null, expenseYear };
};

const getNextMonth = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
};

exports.getMonthlyPayables = async (req, res) => {
  const month = String(req.query.month || "");
  if (!isValidMonth(month)) {
    return res.status(400).json({ message: "Choose a valid reporting month." });
  }

  const monthStart = `${month}-01`;
  const nextMonthStart = getNextMonth(month);
  const expenseYear = Number(month.slice(0, 4));

  try {
    const [expenses, arcadeCards, sparklesCards, months] = await Promise.all([
      db.query(
        `SELECT id, expense_type, description, amount, expense_date, expense_year
         FROM arcade_payable_expenses
         WHERE (expense_type = 'manual'
                AND expense_date >= $1 AND expense_date < $2)
            OR (expense_type = 'annual' AND expense_year = $3)
         ORDER BY expense_type, description, id`,
        [monthStart, nextMonthStart, expenseYear],
      ),
      db.query(
        `SELECT COALESCE(SUM(amount), 0) AS card_amount
         FROM arcade_payments
         WHERE payment_method = 'card' AND paid_on >= $1 AND paid_on < $2`,
        [monthStart, nextMonthStart],
      ),
      db.query(
        `SELECT COALESCE(SUM(amount_card), 0) AS card_amount
         FROM sparkles_daily_payments
         WHERE payment_date >= $1 AND payment_date < $2`,
        [monthStart, nextMonthStart],
      ),
      db.query(
        `SELECT TO_CHAR(expense_date, 'YYYY-MM') AS month
         FROM arcade_payable_expenses
         WHERE expense_type = 'manual'
         UNION
         SELECT expense_year::text || '-' || LPAD(month_number::text, 2, '0')
         FROM arcade_payable_expenses
         CROSS JOIN generate_series(1, 12) AS months(month_number)
         WHERE expense_type = 'annual'
         UNION
         SELECT TO_CHAR(paid_on, 'YYYY-MM')
         FROM arcade_payments
         WHERE payment_method = 'card'
         UNION
         SELECT TO_CHAR(payment_date, 'YYYY-MM')
         FROM sparkles_daily_payments
         WHERE amount_card > 0
         UNION
         SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM')
         ORDER BY month DESC`,
      ),
    ]);

    const annualExpenses = expenses.rows
      .filter((expense) => expense.expense_type === "annual")
      .map((expense) => ({
        ...expense,
        annual_amount: expense.amount,
        amount: (Number(expense.amount) / 12).toFixed(2),
      }));
    const manualExpenses = expenses.rows.filter(
      (expense) => expense.expense_type === "manual",
    );
    const cardAmounts = [
      {
        source: "arcade",
        description: "KL Arcade card processing fee (2.2%)",
        card_amount: Number(arcadeCards.rows[0].card_amount),
      },
      {
        source: "sparkles",
        description: "Sparkles card processing fee (2.2%)",
        card_amount: Number(sparklesCards.rows[0].card_amount),
      },
    ].map((item) => ({
      ...item,
      expense_amount: Math.round(item.card_amount * 0.022 * 100) / 100,
    }));

    return res.status(200).json({
      month,
      months: months.rows.map((row) => row.month),
      expenses: [...manualExpenses, ...annualExpenses],
      card_processing: cardAmounts,
    });
  } catch (error) {
    console.error("Unable to load monthly payables:", error);
    return res.status(500).json({ message: "Unable to load monthly payables." });
  }
};

exports.createExpense = async (req, res) => {
  const expense = validateExpense(req.body);
  if (expense.error) {
    return res.status(400).json({ message: expense.error });
  }
  try {
    const result = await db.query(
      `INSERT INTO arcade_payable_expenses
         (expense_type, description, amount, expense_date, expense_year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, expense_type, description, amount, expense_date, expense_year`,
      [
        expense.type,
        expense.description,
        expense.amount,
        expense.expenseDate,
        expense.expenseYear,
      ],
    );
    return res.status(201).json({ expense: result.rows[0] });
  } catch (error) {
    console.error("Unable to create payable expense:", error);
    return res.status(500).json({ message: "Unable to create the expense." });
  }
};

exports.updateExpense = async (req, res) => {
  const expenseId = Number(req.params.id);
  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    return res.status(400).json({ message: "A valid expense ID is required." });
  }
  const expense = validateExpense(req.body);
  if (expense.error) {
    return res.status(400).json({ message: expense.error });
  }
  try {
    const result = await db.query(
      `UPDATE arcade_payable_expenses
       SET expense_type = $2, description = $3, amount = $4,
           expense_date = $5, expense_year = $6
       WHERE id = $1
       RETURNING id, expense_type, description, amount, expense_date, expense_year`,
      [
        expenseId,
        expense.type,
        expense.description,
        expense.amount,
        expense.expenseDate,
        expense.expenseYear,
      ],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Expense not found." });
    }
    return res.status(200).json({ expense: result.rows[0] });
  } catch (error) {
    console.error("Unable to update payable expense:", error);
    return res.status(500).json({ message: "Unable to update the expense." });
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = Number(req.params.id);
  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    return res.status(400).json({ message: "A valid expense ID is required." });
  }
  try {
    const result = await db.query(
      "DELETE FROM arcade_payable_expenses WHERE id = $1 RETURNING id",
      [expenseId],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Expense not found." });
    }
    return res.status(200).json({ message: "Expense deleted." });
  } catch (error) {
    console.error("Unable to delete payable expense:", error);
    return res.status(500).json({ message: "Unable to delete the expense." });
  }
};
