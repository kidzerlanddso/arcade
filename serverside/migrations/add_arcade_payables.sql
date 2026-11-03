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
