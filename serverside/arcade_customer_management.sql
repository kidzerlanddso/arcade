CREATE TABLE IF NOT EXISTS arcade_customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcade_customer_contacts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES arcade_customers(id) ON DELETE CASCADE,
    contact_name VARCHAR(180) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(180),
    contact_role VARCHAR(80),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS arcade_customer_primary_contact_idx
    ON arcade_customer_contacts (customer_id)
    WHERE is_primary;

CREATE TABLE IF NOT EXISTS arcade_fees (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES arcade_customers(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
    due_on DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS arcade_payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES arcade_customers(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card')),
    paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
    reference VARCHAR(120),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcade_payment_allocations (
    payment_id BIGINT NOT NULL REFERENCES arcade_payments(id) ON DELETE CASCADE,
    fee_id BIGINT NOT NULL REFERENCES arcade_fees(id) ON DELETE RESTRICT,
    customer_id BIGINT NOT NULL REFERENCES arcade_customers(id) ON DELETE RESTRICT,
    allocated_amount NUMERIC(12,2) NOT NULL CHECK (allocated_amount > 0),
    PRIMARY KEY (payment_id, fee_id)
);

CREATE TABLE IF NOT EXISTS sparkles_daily_payments (
    id BIGSERIAL PRIMARY KEY,
    payment_date DATE NOT NULL UNIQUE,
    amount_cash NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_cash >= 0),
    amount_card NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_card >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount_cash > 0 OR amount_card > 0)
);

CREATE TABLE IF NOT EXISTS arcade_payable_expenses (
    id BIGSERIAL PRIMARY KEY,
    expense_type VARCHAR(20) NOT NULL
        CHECK (expense_type IN ('manual', 'annual')),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE,
    expense_year SMALLINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (expense_type = 'manual' AND expense_date IS NOT NULL AND expense_year IS NULL)
        OR
        (expense_type = 'annual' AND expense_date IS NULL AND expense_year IS NOT NULL)
    ),
    CHECK (expense_year IS NULL OR expense_year BETWEEN 2000 AND 2100)
);

CREATE INDEX IF NOT EXISTS arcade_payable_expenses_date_idx
    ON arcade_payable_expenses (expense_date)
    WHERE expense_type = 'manual';

CREATE INDEX IF NOT EXISTS arcade_payable_expenses_year_idx
    ON arcade_payable_expenses (expense_year)
    WHERE expense_type = 'annual';

CREATE INDEX IF NOT EXISTS arcade_fees_customer_idx ON arcade_fees (customer_id, issued_on);
CREATE INDEX IF NOT EXISTS arcade_payments_customer_idx ON arcade_payments (customer_id, paid_on);
CREATE INDEX IF NOT EXISTS arcade_customer_contacts_customer_idx ON arcade_customer_contacts (customer_id);
