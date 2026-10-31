CREATE TABLE IF NOT EXISTS sparkles_daily_payments (
    id BIGSERIAL PRIMARY KEY,
    payment_date DATE NOT NULL UNIQUE,
    amount_cash NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_cash >= 0),
    amount_card NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_card >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount_cash > 0 OR amount_card > 0)
);
