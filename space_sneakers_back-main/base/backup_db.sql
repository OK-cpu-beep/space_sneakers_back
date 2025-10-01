--
-- PostgreSQL database dump
--

\restrict 3WuWkPcge2h28g6dl1NAEdxddHe5ESOPY5uhah1pJCcT6yGa3wa0Rk6a1jhsYtG

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-09-27 19:06:03

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
-- TOC entry 223 (class 1259 OID 16467)
-- Name: clientorders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientorders (
    id numeric(10,0) NOT NULL,
    client_id numeric(10,0) NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_sum numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.clientorders OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16457)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id numeric(10,0) NOT NULL,
    name character varying(100) NOT NULL,
    calculate_progressive_discount boolean DEFAULT false NOT NULL,
    default_discount_percent numeric(5,2) DEFAULT 0.00
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16419)
-- Name: discount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discount (
    discount_id numeric(10,0) NOT NULL,
    discount_name character varying(100),
    min_sum numeric(8,0),
    max_sum numeric(8,0),
    discount_num numeric(5,2),
    CONSTRAINT discount_discount_num_check CHECK ((discount_num >= (0)::numeric)),
    CONSTRAINT discount_min_sum_check CHECK ((min_sum >= (0)::numeric)),
    CONSTRAINT discount_name_nn CHECK ((discount_name IS NOT NULL))
);


ALTER TABLE public.discount OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16443)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id numeric(10,0) NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    surface_type character varying(50) NOT NULL,
    composition character varying(255),
    description text NOT NULL,
    gender character varying(10) NOT NULL,
    sizes character varying(255)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16429)
-- Name: recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recommendations (
    recommendation_id numeric(10,0) NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    source_product_id numeric(10,0),
    recommended_product_id numeric(10,0),
    CONSTRAINT recommended_product_fk CHECK ((recommended_product_id IS NOT NULL)),
    CONSTRAINT source_product_fk CHECK ((source_product_id IS NOT NULL))
);


ALTER TABLE public.recommendations OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 16467)
-- Dependencies: 223
-- Data for Name: clientorders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientorders (id, client_id, discount_percent, created_at, total_sum) FROM stdin;
1	1	5.00	2025-09-27 18:45:00.933487	15000.00
\.


--
-- TOC entry 5046 (class 0 OID 16457)
-- Dependencies: 222
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, calculate_progressive_discount, default_discount_percent) FROM stdin;
1	Клиент 1	t	5.00
\.


--
-- TOC entry 5043 (class 0 OID 16419)
-- Dependencies: 219
-- Data for Name: discount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discount (discount_id, discount_name, min_sum, max_sum, discount_num) FROM stdin;
1	Стандартная скидка	0	10000	5.00
2	VIP скидка	10000	20000	10.00
3	Премиум скидка	20000	\N	15.00
\.


--
-- TOC entry 5045 (class 0 OID 16443)
-- Dependencies: 221
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, price, category, surface_type, composition, description, gender, sizes) FROM stdin;
1	Nike Blazer Mid Suede Green	10499.00	casual	urban	замша, резиновая подошва, текстильная подкладка	Классические высокие кеды Nike Blazer Mid с замшевым верхом в насыщенном зелёном цвете и прочной резиновой подошвой.	male	37, 38, 39, 40
2	Nike Air Max 270	14990.00	sport	road	сетчатый верх, пластиковая вставка в пятке, пена в подошве	Инновационная модель с 270˚ Air в пятке для максимальной амортизации и дышащим сетчатым верхом.	unisex	38, 39, 40, 41, 42
3	Nike Blazer Mid Suede White	10499.00	casual	urban	замша, резиновая подошва, синтетическая подкладка	Белые высокие кеды Blazer Mid из мягкого замша с классическим Swoosh и ретро-силуэтом.	female	36, 37, 38
4	Puma X Aka Boku Future Rider	8490.00	sport	road	нейлоновая сетка, замшевые накладки, резиновая подошва	Коллаборация Puma × Aka Boku: облегчённая подошва Rider Foam и замшево-нейлоновый верх.	unisex	37, 38, 39, 40, 41
5	Under Armour Curry 8	10990.00	sport	court	лёгкий вязаный материал, микрофибровые накладки, резиновая подошва	Stephen Curry 8 с технологией UA Flow для отзывчивой амортизации на корте.	male	40, 41, 42
6	Nike Kyrie 7	9990.00	sport	court	сетка, синтетические ремешки, резиновый протектор	Kyrie 7 с Air Zoom Turbo и асимметричной шнуровкой для резких разворотов.	male	37, 38, 39, 40, 41, 42
7	Jordan Air Jordan 11	21990.00	casual	urban	лакированная кожа, баллистическая сетка, карбоновая пружинная пластина	Легендарная AJ11 с глянцевой кожей, прозрачной подошвой и карбоновой пластиной.	unisex	38, 39, 40
8	Nike LeBron XVIII	18990.00	sport	court	четырёхосная сетка, Max Air, Zoom Air	LeBron XVIII — гибрид амортизации Max Air и Zoom Air для мягкой отдачи.	male	40, 41, 42, 43
9	Nike LeBron XVIII Low	17490.00	sport	court	сетчатый верх, синтетические накладки, пена в подошве	Низкопрофильная версия LeBron XVIII с облегченным верхом и сохранёнными Air-технологиями.	male	38, 39, 40, 41
10	Nike Blazer Mid Suede	10499.00	casual	urban	замша, резиновая подошва, текстильная подкладка	Классические Blazer Mid из замши с винтажным силуэтом и прочной подошвой.	unisex	37, 38, 39, 40, 41
11	BAPE STA OS #3 M2 Black	21990.00	casual	urban	кожаный верх, резиновая подошва, синтетическая подкладка	Уличный стиль Токио: кожаный верх и фирменная звезда STA на боковой панели.	unisex	38, 39, 40
12	Nike Dunk Low GS 'Laser Fuchsia' FB9109-102	10490.00	casual	urban	кожа, резиновая подошва, текстильная стелька	Детская версия Dunk Low в белом с яркими фуксия-акцентами.	female	36, 37, 38, 39
13	Nike V2K Run FD0736-003	7990.00	sport	road	сетчатый верх, TPU накладки, пена Phylon в подошве	Ретро-дизайн с амортизацией Phylon и дышащим сетчатым верхом.	unisex	39, 40, 41
14	Asics Gel-Venture 6 trainers in off white	7490.00	sport	trail	синтетическая кожа, сетка, амортизация GEL	Трейловая модель с GEL-амортизацией и протектором AHAR+ для надёжного сцепления.	unisex	37, 38, 39, 40
15	SOFTRIDE Astro Slip MetaCamo Running Shoes	6990.00	sport	road	неопрен, EVA в подошве, резиновая подошва	Slip-on Astro с эластичной неопреновой вставкой и стелькой из EVA.	unisex	38, 39, 40, 41
16	New Balance 2002R Marblehead	12990.00	casual	urban	замша из телячьей кожи, сетка, амортизация ABZORB	Реинкарнация 2002R с премиальной замшей и технологией ABZORB.	unisex	37, 38, 39
17	Salomon Khaki ACS Pro	15990.00	sport	trail	сетчатая система SensiFit, шнуровка Quicklace, подошва Contragrip	Классика трейл-бега с Quicklace и надёжным протектором Contragrip.	unisex	39, 40, 41, 42
18	Nike Lahar Canvas Low Grain	7490.00	casual	urban	холст, кожаные накладки, резиновая подошва	Текстильный верх с кожаными накладками и традиционной резиновой подошвой.	unisex	37, 38, 39, 40
19	Ben & Jerry's x Dunk Low SB Chunky Dunky Colorido - Verde	11990.00	casual	urban	кожа, синтетические накладки, резиновая подошва	Яркая коллаборация с Ben & Jerry's: волнистые вставки и молочные оттенки.	unisex	38, 39, 40, 41
20	Nike Cortez Shoes Baroque Brown DZ2795-200	7490.00	casual	urban	нейлон, замша на пятке, резиновая подошва с узором вафли	Классический Cortez с нейлоновым верхом, замшей на пятке и вафельной подошвой.	unisex	37, 38, 39
21	CHANEL Knit Suede Fabric CC Green Dark	89990.00	casual	urban	трикотаж, замша, резиновая подошва	Люксовый кроссовок Chanel: трикотажный верх, замшевые детали и логотип CC.	female	36, 37, 38
22	Nike Dunk Low Parris Goebel Pink FN2721-600	11490.00	casual	urban	кожа, резиновая подошва, текстильная подкладка	Коллаборация с Parris Goebel: розовый кожаный верх и усиленная подошва.	female	38, 39, 40, 41
23	Lacoste L-Spin Deluxe 3.0 2232SFA	8990.00	casual	urban	синтетическая кожа, EVA в подошве, резиновая подошва	Чистые линии Lacoste, лёгкая стелька EVA и обновлённый узор подошвы.	unisex	37, 38, 39, 40
24	Air Jordan 1 Zoom CMFT 2 Dresses Up In Orange And Blue	15490.00	casual	urban	кожа, Zoom Air, резиновая подошва с чашкой	Jordan 1 с Zoom Air внутри и яркими оранжево-синими акцентами.	unisex	38, 39, 40, 41
25	Off-White Be Right Back Track Runner Blue	18990.00	casual	urban	сетка, замша, резиновая подошва	Вирджил Абло×Nike: дышащая сетка, замшевые вставки и фирменные швы.	unisex	37, 38, 39
26	Puma Softride Sway Running Shoe	7990.00	sport	road	сетка, TPU накладки, пена Softride	Ежедневный бег с амортизацией Softride и лёгким верхом.	unisex	40, 41, 42, 43
27	Balenciaga Runner Marathon	69990.00	casual	urban	сетка, неопрен, резиновый протектор	Дизайнерская многослойная модель с массивным протектором и logomania.	unisex	38, 39, 40
28	Nike LeBron Witness	10490.00	sport	court	сетка, синтетическая кожа, резиновая подошва	Witness — надёжная баскетбольная модель с усиленным протектором.	male	37, 38, 39, 40, 41
29	Nike KD 15 'All-star'	13990.00	sport	court	сетка, вязаный материал, Zoom Air	All-Star-версия KD15 с выразительным дизайном и поддержкой Zoom Air.	male	38, 39, 40
30	Asics GEL-Kayano sport style	15990.00	sport	road	инженерная сетка, GEL, FlyteFoam	Kayano для бега и стритстайла: стабильность и комфорт от GEL+FlyteFoam.	unisex	37, 38, 39, 40
31	ASICS SportStyle GEL-Preleus	9990.00	casual	urban	сетка, синтетическая кожа, амортизация GEL	Ретро-силуэт Preleus: сетка, синтетика и амортизирующий GEL.	unisex	39, 40, 41
32	ASICS Gel-NYC Cecilie Bahnsen	10990.00	casual	urban	сетка, синтетические накладки, резиновая подошва	Коллаборация с Cecilie Bahnsen: пастельный верх и архитектурный дизайн.	female	37, 38, 39, 40, 41
33	Off-White x Nike Air Rubber Dunk men	17990.00	casual	urban	кожа, резиновые накладки, пена в подошве	Грубая версия Dunk: массивные резиновые накладки и открытая пена.	male	38, 39, 40
34	Nike Air Zoom Structure 21 women	12990.00	sport	road	сетка, Zoom Air, Dynamic Support	Женская Structure 21 с Dynamic Support и Zoom Air в носке.	female	36, 37, 38, 39
35	ASICS Sportstyle Run Style	8490.00	casual	urban	синтетическая кожа, сетка, EVA в подошве	Универсальная улица-модель с мягкой EVA и чистым дизайном.	unisex	37, 38, 39, 40
36	Nike Zoom Vomero 5 FN8361-100	11990.00	sport	road	сетка, Zoom Air, React пена	Vomero 5 с React-пеной и Zoom Air для плавного хода.	unisex	38, 39, 40, 41
37	Nike Zoom Air Fire W DV1129-101	13990.00	sport	court	синтетическая кожа, Zoom Air, резиновая подошва	Женская модель Zoom Air Fire с устойчивой подошвой и амортизацией Zoom.	female	37, 38, 39, 40
38	Nike Dunk Low Retro White	10490.00	casual	urban	кожа, резиновая подошва, текстильная подкладка	Ретро-версия Dunk Low с классическим белым кожаным верхом.	unisex	37, 38, 39, 40
\.


--
-- TOC entry 5044 (class 0 OID 16429)
-- Dependencies: 220
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recommendations (recommendation_id, name, is_active, source_product_id, recommended_product_id) FROM stdin;
1	Кроссовки -> Шнурки	t	1	2
\.


--
-- TOC entry 4895 (class 2606 OID 16476)
-- Name: clientorders clientorders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientorders
    ADD CONSTRAINT clientorders_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 16466)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 16427)
-- Name: discount discount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount
    ADD CONSTRAINT discount_pkey PRIMARY KEY (discount_id);


--
-- TOC entry 4891 (class 2606 OID 16456)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 16439)
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- TOC entry 4882 (class 1259 OID 16428)
-- Name: discount_id_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX discount_id_pk ON public.discount USING btree (discount_id);


--
-- TOC entry 4885 (class 1259 OID 16440)
-- Name: recommendation_id_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommendation_id_pk ON public.recommendations USING btree (recommendation_id);


--
-- TOC entry 4888 (class 1259 OID 16442)
-- Name: recommended_product_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recommended_product_idx ON public.recommendations USING btree (recommended_product_id);


--
-- TOC entry 4889 (class 1259 OID 16441)
-- Name: source_product_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX source_product_idx ON public.recommendations USING btree (source_product_id);


-- Completed on 2025-09-27 19:06:04

--
-- PostgreSQL database dump complete
--

\unrestrict 3WuWkPcge2h28g6dl1NAEdxddHe5ESOPY5uhah1pJCcT6yGa3wa0Rk6a1jhsYtG

