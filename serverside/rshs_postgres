--
-- PostgreSQL database dump
--

\restrict HcsiqGZjIIxhwyhEBEDW3s9jW9KfceSYodi0r16SpOdSH3gSD1DBBCc4EAfxdeH

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-08-14 11:28:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16789)
-- Name: country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country (
    "Code" character(3) DEFAULT ''::bpchar NOT NULL,
    "Name" character(52) DEFAULT ''::bpchar NOT NULL,
    "Continent" character varying DEFAULT 'Asia'::character varying NOT NULL,
    CONSTRAINT "country_Continent_check" CHECK ((("Continent")::text = ANY ((ARRAY['Asia'::character varying, 'Europe'::character varying, 'North America'::character varying, 'Africa'::character varying, 'Oceania'::character varying, 'Antarctica'::character varying, 'South America'::character varying])::text[])))
);


ALTER TABLE public.country OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16772)
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
    user_id integer NOT NULL
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16771)
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_id_seq OWNER TO postgres;

--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 221
-- Name: profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_id_seq OWNED BY public.profile.id;


--
-- TOC entry 220 (class 1259 OID 16753)
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


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16752)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4822 (class 2604 OID 16775)
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 16756)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4988 (class 0 OID 16789)
-- Dependencies: 223
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.country ("Code", "Name", "Continent") FROM stdin;
ABW	Aruba                                               	North America
AFG	Afghanistan                                         	Asia
AGO	Angola                                              	Africa
AIA	Anguilla                                            	North America
ALB	Albania                                             	Europe
AND	Andorra                                             	Europe
ANT	Netherlands Antilles                                	North America
ARE	United Arab Emirates                                	Asia
ARG	Argentina                                           	South America
ARM	Armenia                                             	Asia
ASM	American Samoa                                      	Oceania
ATA	Antarctica                                          	Antarctica
ATF	French Southern territories                         	Antarctica
ATG	Antigua and Barbuda                                 	North America
AUS	Australia                                           	Oceania
AUT	Austria                                             	Europe
AZE	Azerbaijan                                          	Asia
BDI	Burundi                                             	Africa
BEL	Belgium                                             	Europe
BEN	Benin                                               	Africa
BFA	Burkina Faso                                        	Africa
BGD	Bangladesh                                          	Asia
BGR	Bulgaria                                            	Europe
BHR	Bahrain                                             	Asia
BHS	Bahamas                                             	North America
BIH	Bosnia and Herzegovina                              	Europe
BLR	Belarus                                             	Europe
BLZ	Belize                                              	North America
BMU	Bermuda                                             	North America
BOL	Bolivia                                             	South America
BRA	Brazil                                              	South America
BRB	Barbados                                            	North America
BRN	Brunei                                              	Asia
BTN	Bhutan                                              	Asia
BVT	Bouvet Island                                       	Antarctica
BWA	Botswana                                            	Africa
CAF	Central African Republic                            	Africa
CAN	Canada                                              	North America
CCK	Cocos (Keeling) Islands                             	Oceania
CHE	Switzerland                                         	Europe
CHL	Chile                                               	South America
CHN	China                                               	Asia
CIV	Côte d’Ivoire                                       	Africa
CMR	Cameroon                                            	Africa
COD	Congo, The Democratic Republic of the               	Africa
COG	Congo                                               	Africa
COK	Cook Islands                                        	Oceania
COL	Colombia                                            	South America
COM	Comoros                                             	Africa
CPV	Cape Verde                                          	Africa
CRI	Costa Rica                                          	North America
CUB	Cuba                                                	North America
CXR	Christmas Island                                    	Oceania
CYM	Cayman Islands                                      	North America
CYP	Cyprus                                              	Asia
CZE	Czech Republic                                      	Europe
DEU	Germany                                             	Europe
DJI	Djibouti                                            	Africa
DMA	Dominica                                            	North America
DNK	Denmark                                             	Europe
DOM	Dominican Republic                                  	North America
DZA	Algeria                                             	Africa
ECU	Ecuador                                             	South America
EGY	Egypt                                               	Africa
ERI	Eritrea                                             	Africa
ESH	Western Sahara                                      	Africa
ESP	Spain                                               	Europe
EST	Estonia                                             	Europe
ETH	Ethiopia                                            	Africa
FIN	Finland                                             	Europe
FJI	Fiji Islands                                        	Oceania
FLK	Falkland Islands                                    	South America
FRA	France                                              	Europe
FRO	Faroe Islands                                       	Europe
FSM	Micronesia, Federated States of                     	Oceania
GAB	Gabon                                               	Africa
GBR	United Kingdom                                      	Europe
GEO	Georgia                                             	Asia
GHA	Ghana                                               	Africa
GIB	Gibraltar                                           	Europe
GIN	Guinea                                              	Africa
GLP	Guadeloupe                                          	North America
GMB	Gambia                                              	Africa
GNB	Guinea-Bissau                                       	Africa
GNQ	Equatorial Guinea                                   	Africa
GRC	Greece                                              	Europe
GRD	Grenada                                             	North America
GRL	Greenland                                           	North America
GTM	Guatemala                                           	North America
GUF	French Guiana                                       	South America
GUM	Guam                                                	Oceania
GUY	Guyana                                              	South America
HKG	Hong Kong                                           	Asia
HMD	Heard Island and McDonald Islands                   	Antarctica
HND	Honduras                                            	North America
HRV	Croatia                                             	Europe
HTI	Haiti                                               	North America
HUN	Hungary                                             	Europe
IDN	Indonesia                                           	Asia
IND	India                                               	Asia
IOT	British Indian Ocean Territory                      	Africa
IRL	Ireland                                             	Europe
IRN	Iran                                                	Asia
IRQ	Iraq                                                	Asia
ISL	Iceland                                             	Europe
ISR	Israel                                              	Asia
ITA	Italy                                               	Europe
JAM	Jamaica                                             	North America
JOR	Jordan                                              	Asia
JPN	Japan                                               	Asia
KAZ	Kazakstan                                           	Asia
KEN	Kenya                                               	Africa
KGZ	Kyrgyzstan                                          	Asia
KHM	Cambodia                                            	Asia
KIR	Kiribati                                            	Oceania
KNA	Saint Kitts and Nevis                               	North America
KOR	South Korea                                         	Asia
KWT	Kuwait                                              	Asia
LAO	Laos                                                	Asia
LBN	Lebanon                                             	Asia
LBR	Liberia                                             	Africa
LBY	Libyan Arab Jamahiriya                              	Africa
LCA	Saint Lucia                                         	North America
LIE	Liechtenstein                                       	Europe
LKA	Sri Lanka                                           	Asia
LSO	Lesotho                                             	Africa
LTU	Lithuania                                           	Europe
LUX	Luxembourg                                          	Europe
LVA	Latvia                                              	Europe
MAC	Macao                                               	Asia
MAR	Morocco                                             	Africa
MCO	Monaco                                              	Europe
MDA	Moldova                                             	Europe
MDG	Madagascar                                          	Africa
MDV	Maldives                                            	Asia
MEX	Mexico                                              	North America
MHL	Marshall Islands                                    	Oceania
MKD	Macedonia                                           	Europe
MLI	Mali                                                	Africa
MLT	Malta                                               	Europe
MMR	Myanmar                                             	Asia
MNG	Mongolia                                            	Asia
MNP	Northern Mariana Islands                            	Oceania
MOZ	Mozambique                                          	Africa
MRT	Mauritania                                          	Africa
MSR	Montserrat                                          	North America
MTQ	Martinique                                          	North America
MUS	Mauritius                                           	Africa
MWI	Malawi                                              	Africa
MYS	Malaysia                                            	Asia
MYT	Mayotte                                             	Africa
NAM	Namibia                                             	Africa
NCL	New Caledonia                                       	Oceania
NER	Niger                                               	Africa
NFK	Norfolk Island                                      	Oceania
NGA	Nigeria                                             	Africa
NIC	Nicaragua                                           	North America
NIU	Niue                                                	Oceania
NLD	Netherlands                                         	Europe
NOR	Norway                                              	Europe
NPL	Nepal                                               	Asia
NRU	Nauru                                               	Oceania
NZL	New Zealand                                         	Oceania
OMN	Oman                                                	Asia
PAK	Pakistan                                            	Asia
PAN	Panama                                              	North America
PCN	Pitcairn                                            	Oceania
PER	Peru                                                	South America
PHL	Philippines                                         	Asia
PLW	Palau                                               	Oceania
PNG	Papua New Guinea                                    	Oceania
POL	Poland                                              	Europe
PRI	Puerto Rico                                         	North America
PRK	North Korea                                         	Asia
PRT	Portugal                                            	Europe
PRY	Paraguay                                            	South America
PSE	Palestine                                           	Asia
PYF	French Polynesia                                    	Oceania
QAT	Qatar                                               	Asia
REU	Réunion                                             	Africa
ROM	Romania                                             	Europe
RUS	Russian Federation                                  	Europe
RWA	Rwanda                                              	Africa
SAU	Saudi Arabia                                        	Asia
SDN	Sudan                                               	Africa
SEN	Senegal                                             	Africa
SGP	Singapore                                           	Asia
SGS	South Georgia and the South Sandwich Islands        	Antarctica
SHN	Saint Helena                                        	Africa
SJM	Svalbard and Jan Mayen                              	Europe
SLB	Solomon Islands                                     	Oceania
SLE	Sierra Leone                                        	Africa
SLV	El Salvador                                         	North America
SMR	San Marino                                          	Europe
SOM	Somalia                                             	Africa
SPM	Saint Pierre and Miquelon                           	North America
STP	Sao Tome and Principe                               	Africa
SUR	Suriname                                            	South America
SVK	Slovakia                                            	Europe
SVN	Slovenia                                            	Europe
SWE	Sweden                                              	Europe
SWZ	Swaziland                                           	Africa
SYC	Seychelles                                          	Africa
SYR	Syria                                               	Asia
TCA	Turks and Caicos Islands                            	North America
TCD	Chad                                                	Africa
TGO	Togo                                                	Africa
THA	Thailand                                            	Asia
TJK	Tajikistan                                          	Asia
TKL	Tokelau                                             	Oceania
TKM	Turkmenistan                                        	Asia
TMP	East Timor                                          	Asia
TON	Tonga                                               	Oceania
TTO	Trinidad and Tobago                                 	North America
TUN	Tunisia                                             	Africa
TUR	Turkey                                              	Asia
TUV	Tuvalu                                              	Oceania
TWN	Taiwan                                              	Asia
TZA	Tanzania                                            	Africa
UGA	Uganda                                              	Africa
UKR	Ukraine                                             	Europe
UMI	United States Minor Outlying Islands                	Oceania
URY	Uruguay                                             	South America
USA	United States                                       	North America
UZB	Uzbekistan                                          	Asia
VAT	Holy See (Vatican City State)                       	Europe
VCT	Saint Vincent and the Grenadines                    	North America
VEN	Venezuela                                           	South America
VGB	Virgin Islands, British                             	North America
VIR	Virgin Islands, U.S.                                	North America
VNM	Vietnam                                             	Asia
VUT	Vanuatu                                             	Oceania
WLF	Wallis and Futuna                                   	Oceania
WSM	Samoa                                               	Oceania
YEM	Yemen                                               	Asia
YUG	Yugoslavia                                          	Europe
ZAF	South Africa                                        	Africa
ZAR	Zaire                                               	Africa
ZMB	Zambia                                              	Africa
ZWE	Zimbabwe                                            	Africa
\.


--
-- TOC entry 4987 (class 0 OID 16772)
-- Dependencies: 222
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, firstname, lastname, email, current_city, current_country, year, student_id, user_id) FROM stdin;
8	Lamine	Yamal		Hamilton	New Zealand	2015	876498897	22
2	Mike B	Allister	mike.b@rshs.ac.nz	Hamilton	New Zealand	2024	200145	14
3	David	Cameron	dave.b@rshs.ac.nz	Hamilton	New Zealand	2023	240145	12
4	jimmy	carter	dave.b@rshs.ac.nz	Hamilton	New Zealand	2022	240165	17
5	Batista	Dave	dave.b@rshs.ac.nz	Hamilton	New Zealand	2019	240877	18
6	Ferran	Torres	f.torres@rshs.ac.nz	Hamilton	New Zealand	2018	98768	20
7	John	Terry	j.terry@rshs.ac.nz	Hamilton	New Zealand	2010	1221232	21
\.


--
-- TOC entry 4985 (class 0 OID 16753)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, approved_date, admin, connect, active) FROM stdin;
5	testuser	$2b$10$/0.KdnKJCNqsszGlu3vnD.b0mmIgmYOMYEfWeq3mnI5iUFd7qUMzO	2026-08-10	0	0	0
12	User	$2b$10$q0BGj72K9EnzJtwgTI62Qe16aI8sSnKC7nWpJATDhVFht.5xtYxNq	2026-08-10	0	0	0
13	azar	$2b$10$4q.U/6wGFocMUru0OVOSp.Ho3DojSJrNmL4r1MnE95v7yZ1NACmfy	2026-08-10	1	0	1
14	Tim	$2b$10$aXkOoyzAzK7w5f/sjsfNh.H5c7LwpgdpptrmWoY4LStwfcBkHX/HO	2026-08-10	1	0	1
15	john	$2b$10$yVs2.sLIIt8/rrR/LZCtbeJCD6flNIFAFiGSBKOzflzCRdJuA8y8C	2026-08-10	0	0	0
16	timbok	$2b$10$VT9KlsGy0zENKt8/nrVSM.b8SRuNDw7hZROPhcm7ebXMXWrscw1Um	2026-08-10	0	0	0
17	jimmy	$2b$10$80ovHu9nxtsJRnkTZosrOOq.kuKz4VL7mEq2O/Y7lPL90xVnCkeiy	2026-08-10	0	0	1
18	batista	$2b$10$jJUuUhSM4NFGP0OxrKviue2OQoTv0DWOBxcp.20jKWH/FnX/du322	2026-08-10	0	0	0
19	testing	$2b$10$B0I4OowBDA9lK2BmX465ve4l7f8ADvLq800uCMMAlVsrnQKoWcoZa	2026-08-10	0	0	0
20	Ferran	$2b$10$/uO5e02cjaa8EAwjhmBX9eBDgV3rJKY6OlxFQPsrx.NE28v6xR9f.	2026-08-10	0	0	2
21	terry	$2b$10$UPnO9wS1cibHJM3Ng76N7eztSHuFngg.OJOUOF2iH1fMVvk/4.OEi	2026-08-10	0	0	1
22	bob	$2b$10$vI1/uDKy.SHXidjZMWI6fu.bOy0T1RsVLIxm2dCvK0.kWwqTBM9Vy	2026-08-10	0	0	1
\.


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 221
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 1, false);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4836 (class 2606 OID 16802)
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY ("Code");


--
-- TOC entry 4834 (class 2606 OID 16788)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 16768)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 16770)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


-- Completed on 2026-08-14 11:28:34

--
-- PostgreSQL database dump complete
--

\unrestrict HcsiqGZjIIxhwyhEBEDW3s9jW9KfceSYodi0r16SpOdSH3gSD1DBBCc4EAfxdeH

