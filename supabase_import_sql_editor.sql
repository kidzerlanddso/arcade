-- Supabase SQL Editor compatible conversion of the pg_dump plain SQL file.
-- COPY data blocks were converted to INSERT statements; psql meta-commands
-- and source ownership/schema setup statements were omitted.
-- Run only against a clean target project/schema.

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-10-08 13:19:24


--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--




--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';




--
-- TOC entry 235 (class 1259 OID 16977)
-- Name: arcade_customer_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arcade_customer_contacts (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    contact_name character varying(180) NOT NULL,
    phone character varying(50),
    email character varying(180),
    contact_role character varying(80),
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT arcade_customer_contacts_check CHECK (((phone IS NOT NULL) OR (email IS NOT NULL)))
);



--
-- TOC entry 234 (class 1259 OID 16976)
-- Name: arcade_customer_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arcade_customer_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 234
-- Name: arcade_customer_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arcade_customer_contacts_id_seq OWNED BY public.arcade_customer_contacts.id;


--
-- TOC entry 233 (class 1259 OID 16962)
-- Name: arcade_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arcade_customers (
    id bigint NOT NULL,
    name character varying(180) NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- TOC entry 232 (class 1259 OID 16961)
-- Name: arcade_customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arcade_customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 232
-- Name: arcade_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arcade_customers_id_seq OWNED BY public.arcade_customers.id;


--
-- TOC entry 237 (class 1259 OID 16998)
-- Name: arcade_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arcade_fees (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(12,2) NOT NULL,
    issued_on date DEFAULT CURRENT_DATE NOT NULL,
    due_on date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT arcade_fees_amount_check CHECK ((amount > (0)::numeric))
);



--
-- TOC entry 236 (class 1259 OID 16997)
-- Name: arcade_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arcade_fees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 236
-- Name: arcade_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arcade_fees_id_seq OWNED BY public.arcade_fees.id;


--
-- TOC entry 240 (class 1259 OID 17044)
-- Name: arcade_payment_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arcade_payment_allocations (
    payment_id bigint NOT NULL,
    fee_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    allocated_amount numeric(12,2) NOT NULL,
    CONSTRAINT arcade_payment_allocations_allocated_amount_check CHECK ((allocated_amount > (0)::numeric))
);



--
-- TOC entry 239 (class 1259 OID 17021)
-- Name: arcade_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arcade_payments (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(30) NOT NULL,
    paid_on date DEFAULT CURRENT_DATE NOT NULL,
    reference character varying(120),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT arcade_payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT arcade_payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'bank_transfer'::character varying, 'card'::character varying])::text[])))
);



--
-- TOC entry 238 (class 1259 OID 17020)
-- Name: arcade_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arcade_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 238
-- Name: arcade_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arcade_payments_id_seq OWNED BY public.arcade_payments.id;


--
-- TOC entry 222 (class 1259 OID 16820)
-- Name: customer_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_contacts (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    contact_name text NOT NULL,
    phone text,
    email text,
    contact_role text,
    is_primary boolean DEFAULT false NOT NULL,
    CONSTRAINT customer_contacts_check CHECK (((phone IS NOT NULL) OR (email IS NOT NULL)))
);



--
-- TOC entry 221 (class 1259 OID 16819)
-- Name: customer_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_contacts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customer_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16806)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    name text NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- TOC entry 219 (class 1259 OID 16805)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16840)
-- Name: fee_charges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_charges (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    issued_on date DEFAULT CURRENT_DATE NOT NULL,
    due_on date,
    notes text,
    CONSTRAINT fee_charges_amount_check CHECK ((amount > (0)::numeric))
);



--
-- TOC entry 223 (class 1259 OID 16839)
-- Name: fee_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.fee_charges ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.fee_charges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16884)
-- Name: payment_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_allocations (
    payment_id bigint NOT NULL,
    fee_charge_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    allocated_amount numeric(12,2) NOT NULL,
    CONSTRAINT payment_allocations_allocated_amount_check CHECK ((allocated_amount > (0)::numeric))
);



--
-- TOC entry 226 (class 1259 OID 16862)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method text NOT NULL,
    paid_on date DEFAULT CURRENT_DATE NOT NULL,
    reference text,
    notes text,
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payments_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'bank_transfer'::text, 'card'::text])))
);



--
-- TOC entry 225 (class 1259 OID 16861)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16924)
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id integer NOT NULL,
    firstname character varying(80) NOT NULL,
    lastname character varying(80) NOT NULL,
    email character varying(60) NOT NULL,
    current_city character varying(60) DEFAULT 'Hamilton'::character varying NOT NULL,
    current_country character varying(60) DEFAULT 'New Zealand'::character varying NOT NULL,
    year integer NOT NULL,
    student_id integer NOT NULL,
    user_id integer NOT NULL,
    bio "char"
);



--
-- TOC entry 229 (class 1259 OID 16938)
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 229
-- Name: profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_id_seq OWNED BY public.profile.id;


--
-- TOC entry 230 (class 1259 OID 16942)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    approved_date date NOT NULL,
    admin integer DEFAULT 0 NOT NULL,
    connect integer DEFAULT 0 NOT NULL,
    active integer DEFAULT 2 NOT NULL
);



--
-- TOC entry 231 (class 1259 OID 16955)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4877 (class 2604 OID 16980)
-- Name: arcade_customer_contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_customer_contacts ALTER COLUMN id SET DEFAULT nextval('public.arcade_customer_contacts_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 16965)
-- Name: arcade_customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_customers ALTER COLUMN id SET DEFAULT nextval('public.arcade_customers_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 17001)
-- Name: arcade_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_fees ALTER COLUMN id SET DEFAULT nextval('public.arcade_fees_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 17024)
-- Name: arcade_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payments ALTER COLUMN id SET DEFAULT nextval('public.arcade_payments_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16939)
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 16956)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5107 (class 0 OID 16977)
-- Dependencies: 235
-- Data for Name: arcade_customer_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.arcade_customer_contacts (id, customer_id, contact_name, phone, email, contact_role, is_primary, created_at) VALUES
('1', '1', 'Alice Brown', '+1234567890', 'alice@sunsetarcade.com', 'Manager', 't', '2026-10-07 15:42:54.718969+13'),
('2', '1', 'Sam Lee', '+1234567891', 'sam@sunsetarcade.com', 'Finance', 'f', '2026-10-07 15:42:54.718969+13'),
('3', '2', 'Mia Stone', '+1234567892', 'mia@galaxygaming.com', 'Owner', 't', '2026-10-07 15:42:54.718969+13'),
('4', '3', 'Azar', '021 12 123', 'email@email.com', 'father', 't', '2026-10-07 21:00:18.068892+13'),
('6', '1', 'Sam Lee', '+1234567891', 'sam@sunsetarcade.com', 'Finance', 'f', '2026-10-07 21:03:23.674004+13'),
('8', '6', 'azar', '23525', 'rfr@gmil.om', 'Father', 't', '2026-10-07 21:55:25.749352+13');




--
-- TOC entry 5105 (class 0 OID 16962)
-- Dependencies: 233
-- Data for Name: arcade_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.arcade_customers (id, name, notes, is_active, created_at) VALUES
('1', 'Sunset Arcade', 'Main arcade location', 't', '2026-10-07 15:42:54.718969+13'),
('2', 'Galaxy Gaming', 'VIP member account', 't', '2026-10-07 15:42:54.718969+13'),
('6', 'Rayan', 'Binhatti res', 't', '2026-10-07 21:55:01.667103+13'),
('3', 'Ahyan', 'test note', 't', '2026-10-07 20:59:36.231285+13');




--
-- TOC entry 5109 (class 0 OID 16998)
-- Dependencies: 237
-- Data for Name: arcade_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.arcade_fees (id, customer_id, description, amount, issued_on, due_on, notes, created_at) VALUES
('1', '1', 'Monthly maintenance', '150.00', '2026-09-27', '2026-10-27', 'Standard monthly fee', '2026-10-07 15:42:54.718969+13'),
('2', '1', 'Game rental upgrade', '250.00', '2026-10-02', '2026-11-01', 'Added cabinets', '2026-10-07 15:42:54.718969+13'),
('3', '2', 'Membership fee', '300.00', '2026-10-05', '2026-10-22', 'Annual membership', '2026-10-07 15:42:54.718969+13'),
('4', '2', 'Spe fee', '1500.00', '2026-10-07', NULL, 'paid in full', '2026-10-07 17:46:00.859188+13'),
('5', '1', 'Monthly maintenance', '150.00', '2026-09-27', '2026-10-27', 'Standard monthly fee', '2026-10-07 21:03:23.674004+13'),
('6', '1', 'Game rental upgrade', '250.00', '2026-10-02', '2026-11-01', 'Added cabinets', '2026-10-07 21:03:23.674004+13'),
('7', '2', 'Membership fee', '300.00', '2026-10-05', '2026-10-22', 'Annual membership', '2026-10-07 21:03:23.674004+13'),
('13', '3', 'Monthly fee', '765.00', '2026-10-07', NULL, NULL, '2026-10-07 21:28:37.748225+13'),
('14', '6', 'Monthly fee', '1500.00', '2026-10-07', NULL, NULL, '2026-10-07 21:55:33.302597+13');




--
-- TOC entry 5112 (class 0 OID 17044)
-- Dependencies: 240
-- Data for Name: arcade_payment_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.arcade_payment_allocations (payment_id, fee_id, customer_id, allocated_amount) VALUES
('1', '1', '1', '150.00'),
('2', '2', '1', '200.00'),
('3', '3', '2', '300.00'),
('4', '13', '3', '750.00'),
('14', '14', '6', '1400.00'),
('15', '14', '6', '100.00'),
('16', '14', '6', '1500.00'),
('17', '13', '3', '150.00'),
('18', '13', '3', '300.00');




--
-- TOC entry 5111 (class 0 OID 17021)
-- Dependencies: 239
-- Data for Name: arcade_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.arcade_payments (id, customer_id, amount, payment_method, paid_on, reference, notes, created_at) VALUES
('1', '1', '150.00', 'cash', '2026-09-28', 'CASH-001', 'Paid in person', '2026-10-07 15:42:54.718969+13'),
('2', '1', '200.00', 'bank_transfer', '2026-10-03', 'BT-1045', 'Bank transfer', '2026-10-07 15:42:54.718969+13'),
('3', '2', '300.00', 'card', '2026-10-06', 'CARD-8854', 'Card payment via terminal', '2026-10-07 15:42:54.718969+13'),
('4', '2', '1500.00', 'cash', '2026-10-07', 'Sep fee', NULL, '2026-10-07 17:47:09.745276+13'),
('5', '2', '1500.00', 'cash', '2026-10-07', 'Sep fee', NULL, '2026-10-07 17:47:13.019172+13'),
('6', '2', '1500.00', 'cash', '2026-10-07', 'Sep fee', NULL, '2026-10-07 17:47:22.167907+13'),
('7', '2', '1500.00', 'cash', '2026-10-07', 'Sep fee', NULL, '2026-10-07 17:47:24.165262+13'),
('8', '1', '1500.00', 'cash', '2026-10-07', 'Sep fee', NULL, '2026-10-07 17:48:08.84399+13'),
('9', '1', '1000.00', 'cash', '2026-10-07', 'Sep fees', 'test text', '2026-10-07 17:49:15.244901+13'),
('10', '1', '150.00', 'cash', '2026-09-28', 'CASH-001', 'Paid in person', '2026-10-07 21:03:23.674004+13'),
('11', '1', '200.00', 'bank_transfer', '2026-10-03', 'BT-1045', 'Bank transfer', '2026-10-07 21:03:23.674004+13'),
('12', '2', '300.00', 'card', '2026-10-06', 'CARD-8854', 'Card payment via terminal', '2026-10-07 21:03:23.674004+13'),
('14', '6', '1400.00', 'bank_transfer', '2026-10-07', NULL, 'Pro-rata', '2026-10-07 21:56:20.154658+13'),
('15', '6', '100.00', 'cash', '2026-10-07', 'Prorata discount', NULL, '2026-10-07 21:57:14.030201+13'),
('16', '6', '1500.00', 'cash', '2026-10-07', '1500', NULL, '2026-10-07 21:57:32.827413+13'),
('17', '3', '200.00', 'card', '2026-10-05', NULL, NULL, '2026-10-07 22:06:18.591397+13'),
('18', '3', '500.00', 'cash', '2026-10-06', NULL, NULL, '2026-10-07 22:06:44.503814+13'),
('13', '3', '750.00', 'cash', '2026-10-06', 'Spetember', NULL, '2026-10-07 21:29:59.825936+13');




--
-- TOC entry 5094 (class 0 OID 16820)
-- Dependencies: 222
-- Data for Name: customer_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--




--
-- TOC entry 5092 (class 0 OID 16806)
-- Dependencies: 220
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--




--
-- TOC entry 5096 (class 0 OID 16840)
-- Dependencies: 224
-- Data for Name: fee_charges; Type: TABLE DATA; Schema: public; Owner: postgres
--




--
-- TOC entry 5099 (class 0 OID 16884)
-- Dependencies: 227
-- Data for Name: payment_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--




--
-- TOC entry 5098 (class 0 OID 16862)
-- Dependencies: 226
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--




--
-- TOC entry 5100 (class 0 OID 16924)
-- Dependencies: 228
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profile (id, firstname, lastname, email, current_city, current_country, year, student_id, user_id, bio) VALUES
('2', 'Mike B', 'Allister', 'mike.b@rshs.ac.nz', 'Hamilton', 'New Zealand', '2024', '200145', '14', NULL);




--
-- TOC entry 5102 (class 0 OID 16942)
-- Dependencies: 230
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, password, approved_date, admin, connect, active) VALUES
('14', 'Tim', '$2b$10$aXkOoyzAzK7w5f/sjsfNh.H5c7LwpgdpptrmWoY4LStwfcBkHX/HO', '2026-08-10', '1', '0', '1');




--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 234
-- Name: arcade_customer_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arcade_customer_contacts_id_seq', 8, true);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 232
-- Name: arcade_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arcade_customers_id_seq', 6, true);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 236
-- Name: arcade_fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arcade_fees_id_seq', 14, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 238
-- Name: arcade_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arcade_payments_id_seq', 19, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 221
-- Name: customer_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_contacts_id_seq', 1, false);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 219
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 223
-- Name: fee_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fee_charges_id_seq', 1, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 225
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 229
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 18, true);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 43, true);


--
-- TOC entry 4923 (class 2606 OID 16990)
-- Name: arcade_customer_contacts arcade_customer_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_customer_contacts
    ADD CONSTRAINT arcade_customer_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 16975)
-- Name: arcade_customers arcade_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_customers
    ADD CONSTRAINT arcade_customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 17014)
-- Name: arcade_fees arcade_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_fees
    ADD CONSTRAINT arcade_fees_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 17053)
-- Name: arcade_payment_allocations arcade_payment_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payment_allocations
    ADD CONSTRAINT arcade_payment_allocations_pkey PRIMARY KEY (payment_id, fee_id);


--
-- TOC entry 4930 (class 2606 OID 17038)
-- Name: arcade_payments arcade_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payments
    ADD CONSTRAINT arcade_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 16832)
-- Name: customer_contacts customer_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_contacts
    ADD CONSTRAINT customer_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 2606 OID 16818)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 16855)
-- Name: fee_charges fee_charges_id_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_charges
    ADD CONSTRAINT fee_charges_id_customer_id_key UNIQUE (id, customer_id);


--
-- TOC entry 4905 (class 2606 OID 16853)
-- Name: fee_charges fee_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_charges
    ADD CONSTRAINT fee_charges_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 16893)
-- Name: payment_allocations payment_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_allocations
    ADD CONSTRAINT payment_allocations_pkey PRIMARY KEY (payment_id, fee_charge_id);


--
-- TOC entry 4908 (class 2606 OID 16878)
-- Name: payments payments_id_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_id_customer_id_key UNIQUE (id, customer_id);


--
-- TOC entry 4910 (class 2606 OID 16876)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 16941)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 16958)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4918 (class 2606 OID 16960)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4921 (class 1259 OID 17071)
-- Name: arcade_customer_contacts_customer_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX arcade_customer_contacts_customer_idx ON public.arcade_customer_contacts USING btree (customer_id);


--
-- TOC entry 4924 (class 1259 OID 16996)
-- Name: arcade_customer_primary_contact_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX arcade_customer_primary_contact_idx ON public.arcade_customer_contacts USING btree (customer_id) WHERE is_primary;


--
-- TOC entry 4925 (class 1259 OID 17069)
-- Name: arcade_fees_customer_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX arcade_fees_customer_idx ON public.arcade_fees USING btree (customer_id, issued_on);


--
-- TOC entry 4928 (class 1259 OID 17070)
-- Name: arcade_payments_customer_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX arcade_payments_customer_idx ON public.arcade_payments USING btree (customer_id, paid_on);


--
-- TOC entry 4901 (class 1259 OID 16904)
-- Name: fee_charges_customer_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fee_charges_customer_date_idx ON public.fee_charges USING btree (customer_id, issued_on);


--
-- TOC entry 4900 (class 1259 OID 16838)
-- Name: one_primary_contact_per_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX one_primary_contact_per_customer ON public.customer_contacts USING btree (customer_id) WHERE is_primary;


--
-- TOC entry 4906 (class 1259 OID 16905)
-- Name: payments_customer_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_customer_date_idx ON public.payments USING btree (customer_id, paid_on);


--
-- TOC entry 4938 (class 2606 OID 16991)
-- Name: arcade_customer_contacts arcade_customer_contacts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_customer_contacts
    ADD CONSTRAINT arcade_customer_contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.arcade_customers(id) ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 17015)
-- Name: arcade_fees arcade_fees_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_fees
    ADD CONSTRAINT arcade_fees_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.arcade_customers(id) ON DELETE RESTRICT;


--
-- TOC entry 4941 (class 2606 OID 17064)
-- Name: arcade_payment_allocations arcade_payment_allocations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payment_allocations
    ADD CONSTRAINT arcade_payment_allocations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.arcade_customers(id) ON DELETE RESTRICT;


--
-- TOC entry 4942 (class 2606 OID 17059)
-- Name: arcade_payment_allocations arcade_payment_allocations_fee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payment_allocations
    ADD CONSTRAINT arcade_payment_allocations_fee_id_fkey FOREIGN KEY (fee_id) REFERENCES public.arcade_fees(id) ON DELETE RESTRICT;


--
-- TOC entry 4943 (class 2606 OID 17054)
-- Name: arcade_payment_allocations arcade_payment_allocations_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payment_allocations
    ADD CONSTRAINT arcade_payment_allocations_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.arcade_payments(id) ON DELETE CASCADE;


--
-- TOC entry 4940 (class 2606 OID 17039)
-- Name: arcade_payments arcade_payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arcade_payments
    ADD CONSTRAINT arcade_payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.arcade_customers(id) ON DELETE RESTRICT;


--
-- TOC entry 4933 (class 2606 OID 16833)
-- Name: customer_contacts customer_contacts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_contacts
    ADD CONSTRAINT customer_contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 16856)
-- Name: fee_charges fee_charges_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_charges
    ADD CONSTRAINT fee_charges_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- TOC entry 4936 (class 2606 OID 16899)
-- Name: payment_allocations payment_allocations_fee_charge_id_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_allocations
    ADD CONSTRAINT payment_allocations_fee_charge_id_customer_id_fkey FOREIGN KEY (fee_charge_id, customer_id) REFERENCES public.fee_charges(id, customer_id) ON DELETE RESTRICT;


--
-- TOC entry 4937 (class 2606 OID 16894)
-- Name: payment_allocations payment_allocations_payment_id_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_allocations
    ADD CONSTRAINT payment_allocations_payment_id_customer_id_fkey FOREIGN KEY (payment_id, customer_id) REFERENCES public.payments(id, customer_id) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 16879)
-- Name: payments payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


-- Completed on 2026-10-08 13:19:24

--
-- PostgreSQL database dump complete
--
