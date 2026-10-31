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

CREATE INDEX IF NOT EXISTS arcade_fees_customer_idx ON arcade_fees (customer_id, issued_on);
CREATE INDEX IF NOT EXISTS arcade_payments_customer_idx ON arcade_payments (customer_id, paid_on);
CREATE INDEX IF NOT EXISTS arcade_customer_contacts_customer_idx ON arcade_customer_contacts (customer_id);

-- Example seed data
INSERT INTO arcade_customers (name, notes, is_active)
VALUES
    ('Sunset Arcade', 'Main arcade location', TRUE),
    ('Galaxy Gaming', 'VIP member account', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO arcade_customer_contacts (customer_id, contact_name, phone, email, contact_role, is_primary)
VALUES
    (1, 'Alice Brown', '+1234567890', 'alice@sunsetarcade.com', 'Manager', TRUE),
    (1, 'Sam Lee', '+1234567891', 'sam@sunsetarcade.com', 'Finance', FALSE),
    (2, 'Mia Stone', '+1234567892', 'mia@galaxygaming.com', 'Owner', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO arcade_fees (customer_id, description, amount, issued_on, due_on, notes)
VALUES
    (1, 'Monthly maintenance', 150.00, CURRENT_DATE - INTERVAL '10 day', CURRENT_DATE + INTERVAL '20 day', 'Standard monthly fee'),
    (1, 'Game rental upgrade', 250.00, CURRENT_DATE - INTERVAL '5 day', CURRENT_DATE + INTERVAL '25 day', 'Added cabinets'),
    (2, 'Membership fee', 300.00, CURRENT_DATE - INTERVAL '2 day', CURRENT_DATE + INTERVAL '15 day', 'Annual membership')
ON CONFLICT DO NOTHING;

INSERT INTO arcade_payments (customer_id, amount, payment_method, paid_on, reference, notes)
VALUES
    (1, 150.00, 'cash', CURRENT_DATE - INTERVAL '9 day', 'CASH-001', 'Paid in person'),
    (1, 200.00, 'bank_transfer', CURRENT_DATE - INTERVAL '4 day', 'BT-1045', 'Bank transfer'),
    (2, 300.00, 'card', CURRENT_DATE - INTERVAL '1 day', 'CARD-8854', 'Card payment via terminal')
ON CONFLICT DO NOTHING;

INSERT INTO arcade_payment_allocations (payment_id, fee_id, customer_id, allocated_amount)
VALUES
    (1, 1, 1, 150.00),
    (2, 2, 1, 200.00),
    (3, 3, 2, 300.00)
ON CONFLICT DO NOTHING;
