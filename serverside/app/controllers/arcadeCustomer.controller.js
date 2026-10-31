const db = require("../models/db");

const allowedPaymentMethods = ["cash", "bank_transfer", "card"];
const firstDayOfCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

const getCustomerSummary = async (customerId) => {
  const summary = await db.query(
    `
      SELECT
        c.id,
        c.name,
        c.is_active,
        totals.total_fees,
        totals.total_paid,
        totals.total_fees - totals.total_paid AS balance
      FROM arcade_customers c
      CROSS JOIN LATERAL (
        SELECT
          COALESCE((SELECT SUM(amount) FROM arcade_fees WHERE customer_id = c.id), 0) AS total_fees,
          COALESCE((SELECT SUM(allocated_amount) FROM arcade_payment_allocations WHERE customer_id = c.id), 0) AS total_paid
      ) totals
      WHERE c.id = $1
    `,
    [customerId],
  );

  return summary.rows[0] || null;
};

exports.getCustomers = async (req, res) => {
  try {
    const result = await db.query(
      `
        SELECT c.*,
               COALESCE(
                 json_agg(json_build_object(
                   'id', cc.id,
                   'contact_name', cc.contact_name,
                   'phone', cc.phone,
                   'email', cc.email,
                   'contact_role', cc.contact_role,
                   'is_primary', cc.is_primary
                 ) ORDER BY cc.is_primary DESC, cc.id) FILTER (WHERE cc.id IS NOT NULL),
                 '[]'::json
               ) AS contacts
        FROM arcade_customers c
        LEFT JOIN arcade_customer_contacts cc ON cc.customer_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
      `,
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to load customers." });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    const customerResult = await db.query(
      `
        SELECT c.*
        FROM arcade_customers c
        WHERE c.id = $1
      `,
      [customerId],
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const contactsResult = await db.query(
      `SELECT * FROM arcade_customer_contacts WHERE customer_id = $1 ORDER BY is_primary DESC, id ASC`,
      [customerId],
    );

    const feesResult = await db.query(
      `
        SELECT f.*
        FROM arcade_fees f
        WHERE f.customer_id = $1
        ORDER BY f.issued_on DESC, f.id DESC
      `,
      [customerId],
    );

    const paymentsResult = await db.query(
      `
        SELECT p.*,
               COALESCE(
                 json_agg(json_build_object(
                   'fee_id', f.id,
                   'allocated_amount', pa.allocated_amount
                 )) FILTER (WHERE pa.fee_id IS NOT NULL),
                 '[]'::json
               ) AS allocations
        FROM arcade_payments p
        LEFT JOIN arcade_payment_allocations pa ON pa.payment_id = p.id
        LEFT JOIN arcade_fees f ON f.id = pa.fee_id
        WHERE p.customer_id = $1
        GROUP BY p.id
        ORDER BY p.paid_on DESC, p.id DESC
      `,
      [customerId],
    );

    const summary = await getCustomerSummary(customerId);

    return res.status(200).json({
      customer: customerResult.rows[0],
      contacts: contactsResult.rows,
      fees: feesResult.rows,
      payments: paymentsResult.rows,
      summary,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to load customer details." });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Customer name is required." });
    }

    const result = await db.query(
      `
        INSERT INTO arcade_customers (name, notes, is_active)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [name, req.body?.notes || null, req.body?.is_active ?? true],
    );

    return res.status(201).json({ message: "Customer created successfully.", customer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create customer." });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    const name = String(req.body?.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Customer name is required." });
    }

    const result = await db.query(
      `
        UPDATE arcade_customers
        SET name = $2,
            notes = $3,
            is_active = $4
        WHERE id = $1
        RETURNING *
      `,
      [customerId, name, req.body?.notes || null, req.body?.is_active ?? true],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ message: "Customer updated successfully.", customer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to update customer." });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    const result = await db.query(
      `DELETE FROM arcade_customers WHERE id = $1 RETURNING *`,
      [customerId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to delete customer." });
  }
};

exports.createContact = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    const contactName = String(req.body?.contact_name || "").trim();

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    if (!contactName) {
      return res.status(400).json({ message: "Contact name is required." });
    }

    if (!req.body?.phone && !req.body?.email) {
      return res.status(400).json({ message: "At least one of phone or email is required." });
    }

    const result = await db.query(
      `
        INSERT INTO arcade_customer_contacts (customer_id, contact_name, phone, email, contact_role, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        customerId,
        contactName,
        req.body?.phone || null,
        req.body?.email || null,
        req.body?.contact_role || null,
        req.body?.is_primary ?? false,
      ],
    );

    return res.status(201).json({ message: "Contact added successfully.", contact: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to add contact." });
  }
};

exports.createFee = async (req, res) => {
  try {
    const customerId = Number(req.body?.customer_id);
    const amount = Number(req.body?.amount);
    const description = String(req.body?.description || "").trim() || "Monthly fee";

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Fee amount must be greater than zero." });
    }

    const customerExists = await db.query("SELECT id FROM arcade_customers WHERE id = $1", [customerId]);
    if (customerExists.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const result = await db.query(
      `
        INSERT INTO arcade_fees (customer_id, description, amount, issued_on, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        customerId,
        description,
        amount,
        req.body?.issued_on || firstDayOfCurrentMonth(),
        req.body?.notes || null,
      ],
    );

    return res.status(201).json({ message: "Fee created successfully.", fee: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create fee." });
  }
};

exports.generateMonthlyFees = async (req, res) => {
  let client;
  try {
    client = await db.connect();
    await client.query("BEGIN");
    await client.query(`
      SELECT pg_advisory_xact_lock(
        684321,
        EXTRACT(YEAR FROM CURRENT_DATE)::integer * 12
          + EXTRACT(MONTH FROM CURRENT_DATE)::integer
      )
    `);

    const result = await client.query(`
      WITH month_window AS (
        SELECT
          date_trunc('month', CURRENT_DATE)::date AS month_start,
          (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date AS previous_month_start
      )
      INSERT INTO arcade_fees (customer_id, description, amount, issued_on, notes)
      SELECT previous_fee.customer_id,
             previous_fee.description,
             previous_fee.amount,
             month_window.month_start,
             previous_fee.notes
      FROM arcade_fees previous_fee
      JOIN arcade_customers customer
        ON customer.id = previous_fee.customer_id
       AND customer.is_active = TRUE
      CROSS JOIN month_window
      WHERE previous_fee.issued_on >= month_window.previous_month_start
        AND previous_fee.issued_on < month_window.month_start
        AND NOT EXISTS (
          SELECT 1
          FROM arcade_fees current_fee
          WHERE current_fee.customer_id = previous_fee.customer_id
            AND current_fee.description = previous_fee.description
            AND current_fee.issued_on >= month_window.month_start
            AND current_fee.issued_on < month_window.month_start + INTERVAL '1 month'
        )
      RETURNING id
    `);

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Monthly fees generated successfully.",
      created_count: result.rowCount,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Unable to roll back monthly fee generation:", rollbackError);
      }
    }
    return res.status(500).json({ message: error.message || "Unable to generate monthly fees." });
  } finally {
    client?.release();
  }
};

exports.updateFee = async (req, res) => {
  const feeId = Number(req.params.id);
  const description = String(req.body?.description || "").trim() || "Monthly fee";
  const amount = Number(req.body?.amount);

  if (!Number.isInteger(feeId) || feeId <= 0) {
    return res.status(400).json({ message: "A valid fee ID is required." });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Fee amount must be greater than zero." });
  }

  try {
    const result = await db.query(
      `UPDATE arcade_fees
       SET description = $2, amount = $3, issued_on = $4, notes = $5
       WHERE id = $1
       RETURNING *`,
      [feeId, description, amount, req.body?.issued_on || firstDayOfCurrentMonth(), req.body?.notes || null],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Fee not found." });
    }
    return res.status(200).json({ message: "Fee updated successfully.", fee: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to update fee." });
  }
};

exports.deleteFee = async (req, res) => {
  const feeId = Number(req.params.id);
  if (!Number.isInteger(feeId) || feeId <= 0) {
    return res.status(400).json({ message: "A valid fee ID is required." });
  }

  try {
    const result = await db.query("DELETE FROM arcade_fees WHERE id = $1 RETURNING id", [feeId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Fee not found." });
    }
    return res.status(200).json({ message: "Fee deleted successfully." });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ message: "This fee has payment allocations and cannot be deleted." });
    }
    return res.status(500).json({ message: error.message || "Unable to delete fee." });
  }
};

exports.createPayment = async (req, res) => {
  let client;
  try {
    const customerId = Number(req.body?.customer_id);
    const amount = Number(req.body?.amount);
    const paymentMethod = String(req.body?.payment_method || "").trim();

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "A valid customer ID is required." });
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be one of: cash, bank_transfer, card." });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero." });
    }

    const allocations = Array.isArray(req.body?.allocations) ? req.body.allocations : [];
    let totalAllocated = 0;
    const validatedAllocations = [];

    client = await db.connect();
    await client.query("BEGIN");

    const customerExists = await client.query("SELECT id FROM arcade_customers WHERE id = $1", [customerId]);
    if (customerExists.rowCount === 0) {
      const error = new Error("Customer not found.");
      error.statusCode = 404;
      throw error;
    }

    if (allocations.length > 0) {
      for (const allocation of allocations) {
        const feeId = Number(allocation?.fee_id);
        const feeAmount = Number(allocation?.allocated_amount);

        if (!Number.isInteger(feeId) || feeId <= 0) {
          const error = new Error("Each allocation requires a valid fee_id.");
          error.statusCode = 400;
          throw error;
        }

        if (!Number.isFinite(feeAmount) || feeAmount <= 0) {
          const error = new Error("Each allocation requires a positive allocated_amount.");
          error.statusCode = 400;
          throw error;
        }

        const feeCheck = await client.query(
          `SELECT customer_id, amount FROM arcade_fees WHERE id = $1`,
          [feeId],
        );

        if (feeCheck.rowCount === 0) {
          const error = new Error(`Fee ${feeId} was not found.`);
          error.statusCode = 404;
          throw error;
        }

        // PostgreSQL returns BIGINT values as strings; normalize before comparing.
        if (Number(feeCheck.rows[0].customer_id) !== customerId) {
          const error = new Error(`Fee ${feeId} does not belong to this customer.`);
          error.statusCode = 400;
          throw error;
        }

        totalAllocated += feeAmount;
        validatedAllocations.push({ feeId, feeAmount });
      }

      if (totalAllocated > amount) {
        const error = new Error("Total allocated amount cannot exceed the payment amount.");
        error.statusCode = 400;
        throw error;
      }
    }

    const paymentResult = await client.query(
      `
        INSERT INTO arcade_payments (customer_id, amount, payment_method, paid_on, reference)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [customerId, amount, paymentMethod, req.body?.paid_on || new Date().toISOString().slice(0, 10), req.body?.reference || null],
    );

    for (const allocation of validatedAllocations) {
      await client.query(
        `
          INSERT INTO arcade_payment_allocations (payment_id, fee_id, customer_id, allocated_amount)
          VALUES ($1, $2, $3, $4)
        `,
        [paymentResult.rows[0].id, allocation.feeId, customerId, allocation.feeAmount],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Payment created successfully.",
      payment: paymentResult.rows[0],
      allocations,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to create payment." });
  } finally {
    client?.release();
  }
};

exports.updatePayment = async (req, res) => {
  let client;
  const paymentId = Number(req.params.id);
  const amount = Number(req.body?.amount);
  const paymentMethod = String(req.body?.payment_method || "").trim();
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return res.status(400).json({ message: "A valid payment ID is required." });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Payment amount must be greater than zero." });
  }
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: "Payment method must be one of: cash, bank_transfer, card." });
  }

  try {
    client = await db.connect();
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT customer_id, paid_on FROM arcade_payments WHERE id = $1 FOR UPDATE",
      [paymentId],
    );
    if (existing.rowCount === 0) {
      const error = new Error("Payment not found.");
      error.statusCode = 404;
      throw error;
    }
    const customerId = Number(existing.rows[0].customer_id);
    const allocations = Array.isArray(req.body?.allocations) ? req.body.allocations : [];
    const validatedAllocations = [];
    let totalAllocated = 0;

    for (const allocation of allocations) {
      const feeId = Number(allocation?.fee_id);
      const allocatedAmount = Number(allocation?.allocated_amount);
      if (!Number.isInteger(feeId) || feeId <= 0 || !Number.isFinite(allocatedAmount) || allocatedAmount <= 0) {
        const error = new Error("Each allocation requires a valid fee and positive amount.");
        error.statusCode = 400;
        throw error;
      }
      const fee = await client.query("SELECT customer_id FROM arcade_fees WHERE id = $1", [feeId]);
      if (fee.rowCount === 0 || Number(fee.rows[0].customer_id) !== customerId) {
        const error = new Error(`Fee ${feeId} does not belong to this customer.`);
        error.statusCode = 400;
        throw error;
      }
      totalAllocated += allocatedAmount;
      validatedAllocations.push({ feeId, allocatedAmount });
    }
    if (totalAllocated > amount) {
      const error = new Error("Total allocated amount cannot exceed the payment amount.");
      error.statusCode = 400;
      throw error;
    }

    const result = await client.query(
      `UPDATE arcade_payments
       SET amount = $2, payment_method = $3, paid_on = $4, reference = $5, notes = NULL
       WHERE id = $1
       RETURNING *`,
      [paymentId, amount, paymentMethod, req.body?.paid_on || existing.rows[0].paid_on, req.body?.reference || null],
    );
    await client.query("DELETE FROM arcade_payment_allocations WHERE payment_id = $1", [paymentId]);
    for (const allocation of validatedAllocations) {
      await client.query(
        `INSERT INTO arcade_payment_allocations (payment_id, fee_id, customer_id, allocated_amount)
         VALUES ($1, $2, $3, $4)`,
        [paymentId, allocation.feeId, customerId, allocation.allocatedAmount],
      );
    }
    await client.query("COMMIT");
    return res.status(200).json({ message: "Payment updated successfully.", payment: result.rows[0], allocations: validatedAllocations });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to update payment." });
  } finally {
    client?.release();
  }
};

exports.deletePayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return res.status(400).json({ message: "A valid payment ID is required." });
  }
  try {
    const result = await db.query("DELETE FROM arcade_payments WHERE id = $1 RETURNING id", [paymentId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Payment not found." });
    }
    return res.status(200).json({ message: "Payment deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to delete payment." });
  }
};

const isValidPaymentDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const validateSparklesPayment = (body) => {
  const paymentDate = String(body?.payment_date || "");
  const amountCash = Number(body?.amount_cash);
  const amountCard = Number(body?.amount_card);
  if (!isValidPaymentDate(paymentDate)) {
    return { error: "Enter a valid payment date." };
  }
  if (
    !Number.isFinite(amountCash) ||
    amountCash < 0 ||
    !Number.isFinite(amountCard) ||
    amountCard < 0 ||
    amountCash + amountCard <= 0
  ) {
    return { error: "Enter a positive cash or card amount; neither amount can be negative." };
  }
  return { paymentDate, amountCash, amountCard };
};

exports.getSparklesDailyPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, payment_date, amount_cash, amount_card
       FROM sparkles_daily_payments
       ORDER BY payment_date DESC, id DESC`,
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to load Sparkles payments." });
  }
};

exports.createSparklesDailyPayment = async (req, res) => {
  const payment = validateSparklesPayment(req.body);
  if (payment.error) {
    return res.status(400).json({ message: payment.error });
  }
  try {
    const result = await db.query(
      `INSERT INTO sparkles_daily_payments (payment_date, amount_cash, amount_card)
       VALUES ($1, $2, $3)
       RETURNING id, payment_date, amount_cash, amount_card`,
      [payment.paymentDate, payment.amountCash, payment.amountCard],
    );
    return res.status(201).json({ message: "Sparkles daily payment recorded.", payment: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A Sparkles payment for this date already exists. Edit that record instead." });
    }
    return res.status(500).json({ message: error.message || "Unable to record Sparkles payment." });
  }
};

exports.updateSparklesDailyPayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return res.status(400).json({ message: "A valid payment ID is required." });
  }
  const payment = validateSparklesPayment(req.body);
  if (payment.error) {
    return res.status(400).json({ message: payment.error });
  }
  try {
    const result = await db.query(
      `UPDATE sparkles_daily_payments
       SET payment_date = $2, amount_cash = $3, amount_card = $4
       WHERE id = $1
       RETURNING id, payment_date, amount_cash, amount_card`,
      [paymentId, payment.paymentDate, payment.amountCash, payment.amountCard],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Sparkles payment not found." });
    }
    return res.status(200).json({ message: "Sparkles daily payment updated.", payment: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A Sparkles payment for this date already exists." });
    }
    return res.status(500).json({ message: error.message || "Unable to update Sparkles payment." });
  }
};

exports.deleteSparklesDailyPayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return res.status(400).json({ message: "A valid payment ID is required." });
  }
  try {
    const result = await db.query(
      "DELETE FROM sparkles_daily_payments WHERE id = $1 RETURNING id",
      [paymentId],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Sparkles payment not found." });
    }
    return res.status(200).json({ message: "Sparkles daily payment deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to delete Sparkles payment." });
  }
};

exports.getPaymentReport = async (req, res) => {
  const month = String(req.query.month || "");
  const paymentMethod = String(req.query.payment_method || "all");
  const source = String(req.query.source || "arcade");
  if (source !== "arcade" && source !== "sparkles") {
    return res.status(400).json({ message: "Choose a valid receivables source." });
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: "Choose a valid reporting month." });
  }
  const validMethods = source === "sparkles" ? ["cash", "card"] : allowedPaymentMethods;
  if (paymentMethod !== "all" && !validMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: "Choose a valid payment method." });
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  const nextMonthYear = monthNumber === 12 ? year + 1 : year;
  const nextMonthNumber = monthNumber === 12 ? 1 : monthNumber + 1;
  const nextMonthStart = `${nextMonthYear}-${String(nextMonthNumber).padStart(2, "0")}-01`;

  try {
    if (source === "sparkles") {
      const [payments, months] = await Promise.all([
        db.query(
          `SELECT id, payment_date, amount_cash, amount_card,
                  CASE
                    WHEN $3 = 'cash' THEN amount_cash
                    WHEN $3 = 'card' THEN amount_card
                    ELSE amount_cash + amount_card
                  END AS amount_total
           FROM sparkles_daily_payments
           WHERE payment_date >= $1
             AND payment_date < $2
             AND ($3 = 'all'
               OR ($3 = 'cash' AND amount_cash > 0)
               OR ($3 = 'card' AND amount_card > 0))
           ORDER BY payment_date DESC, id DESC`,
          [monthStart, nextMonthStart, paymentMethod],
        ),
        db.query(`
          SELECT DISTINCT TO_CHAR(payment_date, 'YYYY-MM') AS month
          FROM sparkles_daily_payments
          UNION
          SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM') AS month
          ORDER BY month DESC
        `),
      ]);
      return res.status(200).json({
        source,
        data: payments.rows,
        months: months.rows.map((row) => row.month),
      });
    }

    const [payments, months] = await Promise.all([
      db.query(
      `
        SELECT
          p.id,
          p.amount,
          p.payment_method,
          p.paid_on,
          p.reference,
          c.id AS customer_id,
          c.name AS customer_name,
          COALESCE(
            json_agg(json_build_object(
              'description', f.description,
              'allocated_amount', pa.allocated_amount
            )) FILTER (WHERE pa.fee_id IS NOT NULL),
            '[]'::json
          ) AS allocations
        FROM arcade_payments p
        JOIN arcade_customers c ON c.id = p.customer_id
        LEFT JOIN arcade_payment_allocations pa ON pa.payment_id = p.id
        LEFT JOIN arcade_fees f ON f.id = pa.fee_id
        WHERE p.paid_on >= $1
          AND p.paid_on < $2
          AND ($3 = 'all' OR p.payment_method = $3)
        GROUP BY p.id, c.id, c.name
        ORDER BY p.paid_on DESC, p.id DESC
      `,
      [monthStart, nextMonthStart, paymentMethod],
      ),
      db.query(`
        SELECT DISTINCT TO_CHAR(paid_on, 'YYYY-MM') AS month
        FROM arcade_payments
        UNION
        SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM') AS month
        ORDER BY month DESC
      `),
    ]);

    return res.status(200).json({
      source,
      data: payments.rows,
      months: months.rows.map((row) => row.month),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to generate payment report." });
  }
};

exports.getDashboardStats = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const year = Number(req.query.year || currentYear);

  if (!Number.isInteger(year) || year < 2000 || year > currentYear + 1) {
    return res.status(400).json({ message: "Choose a valid reporting year." });
  }

  try {
    const [customerStats, totals, monthly] = await Promise.all([
      db.query(
        `
          SELECT
            COUNT(*)::int AS customer_count,
            COUNT(*) FILTER (WHERE is_active)::int AS active_customers,
            COUNT(*) FILTER (
              WHERE created_at >= make_date($1, 1, 1)
                AND created_at < make_date($1 + 1, 1, 1)
            )::int AS new_customers
          FROM arcade_customers
        `,
        [year],
      ),
      db.query(
        `
          SELECT
            COALESCE((SELECT SUM(amount) FROM arcade_fees
              WHERE issued_on >= make_date($1, 1, 1)
                AND issued_on < make_date($1 + 1, 1, 1)), 0) AS fees_total,
            COALESCE((SELECT SUM(amount) FROM arcade_payments
              WHERE paid_on >= make_date($1, 1, 1)
                AND paid_on < make_date($1 + 1, 1, 1)), 0) AS payments_total,
            COALESCE((SELECT SUM(amount) FROM arcade_fees), 0)
              - COALESCE((SELECT SUM(allocated_amount) FROM arcade_payment_allocations), 0)
              AS outstanding_balance
        `,
        [year],
      ),
      db.query(
        `
          WITH months AS (
            SELECT generate_series(1, 12)::int AS month
          ), fee_totals AS (
            SELECT EXTRACT(MONTH FROM issued_on)::int AS month, SUM(amount) AS total
            FROM arcade_fees
            WHERE issued_on >= make_date($1, 1, 1)
              AND issued_on < make_date($1 + 1, 1, 1)
            GROUP BY 1
          ), payment_totals AS (
            SELECT EXTRACT(MONTH FROM paid_on)::int AS month, SUM(amount) AS total
            FROM arcade_payments
            WHERE paid_on >= make_date($1, 1, 1)
              AND paid_on < make_date($1 + 1, 1, 1)
            GROUP BY 1
          )
          SELECT months.month,
                 COALESCE(fee_totals.total, 0) AS fees,
                 COALESCE(payment_totals.total, 0) AS payments
          FROM months
          LEFT JOIN fee_totals USING (month)
          LEFT JOIN payment_totals USING (month)
          ORDER BY months.month
        `,
        [year],
      ),
    ]);

    return res.status(200).json({
      year,
      summary: { ...customerStats.rows[0], ...totals.rows[0] },
      months: monthly.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to load dashboard statistics." });
  }
};
