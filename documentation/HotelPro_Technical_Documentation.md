# HotelPro — Complete Hotel Booking and Management System
## Comprehensive Technical Architecture, Database Design, System Security, and Stripe EUR Payment Workflow Specification

---

**Document Version:** 2.5.0  
**Project:** HotelPro Hospitality Management System  
**Prepared For:** Technical Evaluation, Capstone Submission & Architectural Audit  
**Author:** Senior Software Architect, Technical Writer & Full-Stack Engineering Team  
**Date:** October 2026  
**Status:** Approved & Verified Against Active Codebase  

---

## Executive Summary

**HotelPro** is an enterprise-grade, full-stack hospitality management platform designed for luxury resorts, boutique heritage properties, and modern hotel chains. The platform delivers an end-to-end guest journey—from date-range suite discovery, real-time conflict-free reservation holds, and international currency conversions, to verified payment fulfillment, encrypted digital keycard issuance, and automated housekeeping turnovers.

The application is engineered on a modern decoupled architecture:
- **Client Presentation Tier:** React 19 single-page application built with Vite 8, React Router 7, Axios, and bespoke luxury Vanilla CSS with responsive glassmorphism and gold/ivory aesthetics.
- **Application Logic Tier:** Node.js 24 runtime executing Express 5, featuring stateless JWT authentication with strict Role-Based Access Control (RBAC), an in-process serialized Promise mutex lock for double-booking prevention, configurable 15-minute pending hold expirations, an automated digital tax invoice engine, and a dual-path Stripe payment verification pipeline.
- **Data Persistence Tier:** MongoDB document database managed via Mongoose 9 schemas with compound indexing for sub-millisecond overlap lookups, supplemented by a rich in-memory catalog for Indian heritage properties.
- **External Integration Tier:** Stripe Payment Gateway operating in Euros (€, EUR), utilizing cryptographic HMAC-SHA256 webhook signatures and client session reconciliation.

---

## Table of Contents

1. [Chapter 1: Introduction](#chapter-1-introduction)
2. [Chapter 2: Technology Stack and Tools](#chapter-2-technology-stack-and-tools)
3. [Chapter 3: System Architecture](#chapter-3-system-architecture)
4. [Chapter 4: ER Diagram and Database Design](#chapter-4-er-diagram-and-database-design)
5. [Chapter 5: MVC Pattern and Request Lifecycle](#chapter-5-mvc-pattern-and-request-lifecycle)
6. [Chapter 6: Features and Modules](#chapter-6-features-and-modules)
7. [Chapter 7: Roles and Responsibilities](#chapter-7-roles-and-responsibilities)
8. [Chapter 8: Complete User Flows](#chapter-8-complete-user-flows)
9. [Chapter 9: Payment Gateway and Currency Conversion](#chapter-9-payment-gateway-and-currency-conversion)
10. [Chapter 10: API Documentation](#chapter-10-api-documentation)
11. [Chapter 11: Security and Validation](#chapter-11-security-and-validation)
12. [Chapter 12: Testing and Verification](#chapter-12-testing-and-verification)
13. [Chapter 13: Installation and Execution](#chapter-13-installation-and-execution)
14. [Chapter 14: Limitations and Future Enhancements](#chapter-14-limitations-and-future-enhancements)
15. [Chapter 15: Conclusion](#chapter-15-conclusion)
16. [Appendices](#appendices)

---

## Chapter 1: Introduction

### 1.1 Project Title
**HotelPro — Complete Hotel Booking and Management System**

### 1.2 Abstract
In the modern luxury hospitality industry, guest satisfaction depends on seamless digital interactions, transparent cross-border billing, and prompt concierge service. Simultaneously, hotel operations require real-time synchronization between front desk clerks, housekeeping staff, and general managers. Traditional monolithic hotel systems frequently suffer from concurrency bottlenecks, race conditions during peak reservation windows, client-side pricing vulnerabilities, and rigid currency models that create discrepancies between quoted tariffs and final credit card charges.

HotelPro resolves these challenges through a modular, decoupled full-stack architecture. The platform combines a responsive React single-page frontend with an Express and MongoDB backend. Core capabilities include server-enforced tariff calculations (ignoring client-side overrides), in-process mutex locking to serialize room reservations, automated 15-minute reservation hold timeouts, international payment processing via Stripe in Euros (€, EUR) with mathematical currency conversion, digital tax invoice reconciliation, operational staff dashboards with digital keycard generation, and executive administrative KPI analytics.

### 1.3 Problem Statement
Hospitality management software faces several critical technical and operational challenges:
1. **Concurrent Overlapping Reservations:** During high-demand travel seasons, multiple guests may simultaneously attempt to book the same luxury suite for identical or overlapping dates. Without strict concurrency controls, database race conditions produce double bookings, resulting in guest displacement, brand damage, and financial reconciliation penalties.
2. **Client-Side Pricing Tampering:** In poorly architected web applications, room rates and totals are transmitted directly from frontend forms. Malicious clients can alter HTTP request bodies to book high-end suites at fractions of their intended price.
3. **Cross-Border Currency Mismatch:** Heritage hotels catering to international travelers often quote prices in domestic currencies (such as Indian Rupees, INR) while international guests settle payments using European or US credit cards. Inaccurate rounding, unverified exchange rates, or failure to capture the exact currency and amount charged by payment gateways lead to invoice mismatches and accounting discrepancies.
4. **Uncontrolled Reservation Holds:** Guests who initiate an online booking but abandon checkout can indefinitely lock room inventory if the system marks reservations as held without an automated expiry mechanism.
5. **Operational Disconnect:** Front desk check-ins, guest service tickets, and housekeeping room sanitation statuses are often managed across disparate spreadsheets or legacy desktop applications, leading to delays in room turnover.

### 1.4 Project Objectives
HotelPro was engineered to achieve the following specific architectural and business objectives:
- **Deterministic Concurrency Control:** Enforce an exclusive in-process mutex lock per room ID during checkout to eliminate double-booking race conditions.
- **Server-Authoritative Pricing & Availability:** Calculate nights, base tariffs, 12% luxury taxes, and total prices strictly on the server by querying authoritative database records.
- **Automated Hold Expiration Engine:** Implement a configurable 15-minute pending hold window (`holdExpiresAt`) for online checkouts, ensuring abandoned bookings automatically return to available inventory while allowing guests to retry within the window without "Already Reserved" errors.
- **Verified Cross-Border Payment Pipeline:** Provide seamless online credit card checkout via Stripe in Euros (€, EUR) converted from the canonical INR equivalent at a configured rate (€1 ≈ ₹110), complete with smallest-currency-unit (cents) conversion, HMAC-SHA256 signature verification, and automated invoice line-item reconciliation.
- **Alternative In-Person Settlement:** Support a verified "Pay at Hotel Desk" workflow that holds the suite without an expiration timeout, clearly flagged as pending in-person collection.
- **Unified Role-Based Operations:** Deliver dedicated, secure workflows for Guests (booking history, printable tax invoices, service requests, reviews), Staff (operational overview stats, digital keycard check-in, checkout with automated housekeeping queuing, room status grid), and Administrators (revenue metrics, occupancy KPIs, user role management, system audit logs).

### 1.5 Scope of the Project
The scope of HotelPro encompasses all implemented modules verified in the repository:
- **Verified Implemented:**
  - Stateless JWT authentication, secure password hashing (bcryptjs), and public registration locked to the 'Guest' role.
  - Multi-parameter hotel and suite browsing (search by city, location, room type, guest capacity, price range, and amenities).
  - Date-range room availability filtering using half-open interval overlap algorithms (`checkInDate < reqCheckOut && checkOutDate > reqCheckIn`).
  - Server-side reservation creation, room mutex locking, and 15-minute hold management.
  - Stripe Checkout Session creation in EUR, URL redirection, webhook processing, and client polling verification.
  - Pay at Hotel Desk payment option.
  - Automated printable digital tax invoice generation with 12% occupancy tax, subtotal, and rounding adjustment.
  - Staff Desk: Real-time operational stats, guest check-in with digital keycard issuance, guest check-out with automatic housekeeping ticket creation, and room status grid management (`Available`, `Occupied`, `Cleaning`, `Maintenance`).
  - Concierge & Guest Services: Ticket creation, priority management, and status updates.
  - Guest Reviews: 1–5 star ratings, feedback submission, staff reply capability, and room rating aggregation.
  - Admin Center: Real-time revenue aggregation, occupancy rate KPIs, registered user list with role/tier assignment, and security audit log tracking.
  - Self-Help Support: Curated FAQs and 24/7 concierge contact directory.
  - Hybrid Data Model: Live MongoDB rooms integrated seamlessly with an in-memory catalog of Indian heritage suites (`heritageHotelsData.js`) that automatically upsert to MongoDB when their housekeeping status is updated.

### 1.6 Proposed Solution
HotelPro delivers an integrated full-stack architecture that resolves each operational challenge:
- Decouples the presentation layer (React SPA) from business logic (Express API), ensuring high responsiveness and cross-device compatibility.
- Centralizes all pricing, tax calculation, and date validation in backend services.
- Employs compound indexes and half-open date range filtering in MongoDB for rapid inventory queries.
- Utilizes Stripe's hosted checkout sessions for PCI-DSS compliant payment processing, eliminating the risk of handling raw credit card data on application servers.
- Automatically synchronizes payment confirmations through webhooks and frontend fallback verifications to guarantee eventual consistency.

### 1.7 Intended Users
The system serves three primary user personas:
1. **Guests (Travelers):** Browse luxury suites, check real-time availability, make reservations, pay online via Stripe in EUR or choose to pay at the desk, view booking history, download digital tax invoices, submit room service tickets, and publish suite reviews.
2. **Staff (Front Desk Clerks, Concierges & Housekeeping Supervisors):** Monitor operational statistics (today's check-ins, check-outs, room statuses, pending service requests), execute guest check-ins with digital keycard issuance, process check-outs, update housekeeping statuses across the room grid, and fulfill guest service tickets.
3. **Administrators (General Managers & IT Officers):** Access executive KPI analytics (total revenue, occupancy rate, booking volume, guest counts), manage user roles and loyalty tiers, oversee room inventory, and inspect the chronological audit log of all system actions.

### 1.8 Functional and Non-Functional Requirements

#### Functional Requirements (FR)
- **FR1 (Authentication):** Users must register with valid credentials and log in to receive a signed JWT token valid for 7 days.
- **FR2 (Role Assignment):** Public registrations must be unconditionally assigned the `Guest` role; role escalation in client payloads must be stripped.
- **FR3 (Inventory Discovery):** Guests must be able to search and filter rooms by destination city, hotel brand, suite type, guest capacity, price range, and amenities.
- **FR4 (Availability Filtering):** When check-in and check-out dates are supplied, the system must exclude any room with an active overlapping reservation or valid hold.
- **FR5 (Server Pricing):** The backend must compute nights (`ceil(diffTime / 86400000)`), base subtotal, and 12% tax from authoritative room rates, discarding client-submitted prices.
- **FR6 (Reservation Hold):** Online bookings must create a pending record with `holdExpiresAt` set to 15 minutes in the future.
- **FR7 (Stripe EUR Checkout):** Online payments must convert the booking's INR total to EUR (`INR / 110`), convert to cents (`EUR * 100`), and generate a hosted Stripe Checkout Session.
- **FR8 (Pay at Hotel Desk):** Guests selecting desk payment must receive a confirmed reservation with `paymentStatus: 'Pending'`, `holdExpiresAt: null`, and clear check-in collection notices.
- **FR9 (Payment Verification):** The system must support dual-path verification: Stripe webhooks (`checkout.session.completed`) and authenticated client callbacks (`POST /api/payments/stripe/verify`).
- **FR10 (Digital Tax Invoice):** Guests and authorized staff must be able to retrieve an invoice containing line-item tariff breakdowns, 12% tax, rounding adjustment, and transaction currency.
- **FR11 (Check-In & Keycard):** Staff must be able to check in guests, transition room status to `Occupied`, and generate an alphanumeric digital keycard code.
- **FR12 (Check-Out & Turnover):** Staff must be able to check out guests, transition room status to `Cleaning`, and automatically generate an urgent Housekeeping ticket.
- **FR13 (Service Ticketing):** Guests must be able to submit service requests (Food, Housekeeping, Maintenance, Concierge), and staff must be able to update their statuses.
- **FR14 (Review Aggregation):** Authenticated guests must be able to submit 1–5 star reviews, and the backend must recalculate the room's average rating.
- **FR15 (Executive Analytics):** Administrators must be able to view aggregated revenue, occupancy rates, room distributions, user lists, and audit logs.

#### Non-Functional Requirements (NFR)
- **NFR1 (Security):** Passwords must be hashed using bcrypt (10 salt rounds). All protected endpoints must validate JWT signatures. Strict OWASP headers (`nosniff`, `DENY` frame options, XSS protection, Referrer Policy) and CORS whitelisting must be enforced.
- **NFR2 (Concurrency Integrity):** Concurrent reservations for the same room must be serialized using an in-process Promise mutex lock to guarantee zero double bookings.
- **NFR3 (Data Consistency):** Cancelled, failed, or expired holds must immediately release room inventory. Line items on invoices must mathematically reconcile to the charged amount down to the exact euro cent.
- **NFR4 (Performance):** MongoDB collections must use compound indexes on frequently queried fields (`{ userEmail: 1, createdAt: -1 }`, `{ roomId: 1, checkInDate: 1, checkOutDate: 1, status: 1 }`).
- **NFR5 (Resilience & Usability):** The API must handle missing third-party credentials gracefully (e.g., returning HTTP 503 with user-friendly notices rather than crashing). The frontend must provide clear notifications and modal state handling.

---

## Chapter 2: Technology Stack and Tools

### 2.1 Technology Overview
HotelPro utilizes a modern JavaScript/Node.js technology stack across both frontend and backend. Every component and library was selected for reliability, developer ergonomics, security, and performance.

### 2.2 Client-Side Technologies
- **React (v19.3.1):** Core UI library utilizing modern hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) for reactive state management, modal handling, and dynamic component rendering.
- **Vite (v8.3.4):** Next-generation frontend build tool providing lightning-fast Hot Module Replacement (HMR) and optimized ES module production bundles.
- **React Router DOM (v7.18.4):** Declarative client-side routing library managing navigation, route parameters (`/booking-confirmation/:bookingId`), and authentication route guards.
- **Axios (v1.20.0):** Promise-based HTTP client configured with a centralized instance (`axiosClient.js`) that automatically attaches JWT Bearer tokens from `localStorage` to all outgoing API requests and normalizes server error responses.
- **Vanilla CSS (`index.css`):** Comprehensive custom styling architecture (over 20KB of curated CSS) implementing a luxury Indian hospitality design language ("Aatithya"). Features CSS custom properties, glassmorphism modal overlays, custom scrollbars, gold foil badges, responsive grid systems, and subtle micro-animations without external UI framework bloat.

### 2.3 Server-Side Technologies
- **Node.js (v24.14.0):** Modern asynchronous, event-driven JavaScript runtime executing the backend server.
- **Express (v5.3.0):** Next-generation web framework managing HTTP routing, request/response lifecycles, and middleware pipelines. Express 5 provides robust path matching and native promise handling in route handlers.
- **MongoDB & Mongoose (v9.11.2):** High-performance NoSQL document database paired with the Mongoose Object Data Modeling (ODM) library. Mongoose manages schema validation, type casting, pre-save hooks, custom model methods (`isHoldActive()`), and compound indexes.
- **JSON Web Tokens (`jsonwebtoken` v9.0.3):** Cryptographic authentication mechanism generating signed, tamper-evident tokens containing user identifiers and assigned roles, configured with a 7-day expiration window.
- **Bcrypt.js (`bcryptjs` v3.0.3):** Pure JavaScript implementation of the Blowfish-based adaptive hashing algorithm, used to hash passwords with 10 salt rounds prior to database persistence.
- **Stripe Node SDK (`stripe` v17.7.0):** Official Stripe API client managing the creation of Checkout Sessions in Euros, session retrieval, customer email binding, metadata attachment, and cryptographic webhook signature validation (`stripe.webhooks.constructEvent`).
- **CORS (`cors` v2.8.6):** Middleware controlling Cross-Origin Resource Sharing, strictly validating incoming `Origin` headers against approved development origins (`localhost:5173`, `localhost:3000`) and configured production domains.
- **Dotenv (`dotenv` v18.0.8):** Environment variable management loading configuration from `.env` files into `process.env`.
- **Supertest (`supertest` v7.2.2):** Automated HTTP testing library used in the backend test suite (`Backend/test/api.test.js`) to execute end-to-end integration tests against Express route handlers.

### 2.4 Technology Summary Table

| Layer / Component | Technology | Version | Purpose in HotelPro | Interaction / Connection Point |
|---|---|---|---|---|
| **Frontend Framework** | React | 19.3.1 | Component-based UI rendering, state management | Renders SPA views, modals, forms, and tables |
| **Frontend Build Tool** | Vite | 8.3.4 | Development server, HMR, production bundling | Compiles React code into optimized browser assets |
| **Client Routing** | React Router DOM | 7.18.4 | Declarative client routing and navigation guards | Handles `/rooms`, `/my-bookings`, `/staff`, `/admin` |
| **HTTP Client** | Axios | 1.20.0 | REST API communication with backend | Injects Bearer token into `Authorization` headers |
| **Styling Engine** | Vanilla CSS | Custom | Bespoke luxury aesthetic, gold/ivory color tokens | Defined in `index.css`; styled without Tailwind bloat |
| **Backend Runtime** | Node.js | 24.14.0 | Asynchronous server execution runtime | Powers Express application and async I/O operations |
| **Backend Framework** | Express | 5.3.0 | API routing, middleware pipeline, error handling | Serves `/api/*` endpoints and handles raw webhook payloads |
| **Database Engine** | MongoDB | Active | Document-based data persistence | Stores users, rooms, bookings, payments, and logs |
| **Object Data Modeling** | Mongoose | 9.11.2 | Schema validation, compound indexing, queries | Connects to `MONGO_URI`, enforces data integrity |
| **Authentication** | JSON Web Tokens | 9.0.3 | Stateless token generation and verification | Signed with `JWT_SECRET`; verified in `auth.js` |
| **Password Security** | Bcrypt.js | 3.0.3 | One-way cryptographic password hashing | Hashes passwords with 10 rounds on registration/login |
| **Payment Gateway** | Stripe SDK | 17.7.0 | Hosted Checkout sessions in EUR, webhooks | Communicates with Stripe API and verifies signatures |
| **Integration Testing** | Supertest | 7.2.2 | Automated integration and regression testing | Executes 66 automated tests against Express API |

---

## Chapter 3: System Architecture

### 3.1 Architectural Overview
HotelPro is structured as a decoupled multi-tier web application. It enforces strict separation of concerns across the presentation, security, business logic, persistence, and external integration layers.

```
+-------------------------------------------------------------------------------+
|                       Presentation Tier (React 19 + Vite)                     |
|  Guest Portal  |  Staff Desk  |  Admin Center  |  Axios Client (Bearer Auth)  |
+---------------------------------------+---------------------------------------+
                                        | HTTP / REST (JSON)
+---------------------------------------v---------------------------------------+
|                       Security Perimeter & Middlewares                         |
|  Security Headers (nosniff, DENY)  |  CORS Origin Whitelist  |  JWT & RBAC    |
+---------------------------------------+---------------------------------------+
                                        | Dispatched Requests
+---------------------------------------v---------------------------------------+
|                    Application Tier (Node.js 24 + Express 5)                  |
|  /api/auth  |  /api/rooms  |  /api/bookings  |  /api/payments  |  /api/staff  |
|  /api/reviews  |  /api/admin  |  /api/support  |  Raw Webhook Handler         |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
+-------------------v---+   +-----------v-----------+   +---v-------------------+
| Business Services     |   | External Gateways     |   | Persistence Tier      |
| - Mutex Lock Engine   |   | - Stripe API (EUR)    |   | - MongoDB Collections |
| - Availability Math   |   | - Stripe Webhooks     |   | - Mongoose ODM        |
| - INR->EUR Converter  |   +-----------------------+   | - In-Memory Heritage  |
| - Invoice Generator   |                               |   Suites Catalog      |
+-----------------------+                               +-----------------------+
```

### 3.2 Frontend Architecture
The frontend is structured as a modular React application located in `FrontEnd/src/`:
- **Pages (`src/pages/`):** Contains high-level view containers:
  - `Home.jsx`: Landing page featuring hero banners, destination showcases (Jaipur, Udaipur, Shimla, Kerala, Varanasi, Goa), curated stay categories, and brand philosophy.
  - `Rooms.jsx`: Interactive suite catalog featuring multi-parameter filters (city, type, price slider, capacity, amenities), live check-in/out date availability filtering, and room cards.
  - `UnifiedDashboard.jsx`: Comprehensive operations portal serving Guests (bookings, service requests, digital keycard display), Staff (daily check-in/out stats, housekeeping grid, service ticketing), and Admins (revenue analytics, user role editor, system audit trail).
  - `MyBookings.jsx`: Dedicated guest reservation center with Stripe payment outcome detection (`?stripe=success`), manual verification triggers, printable tax invoice modals, and self-service cancellations.
  - `BookingConfirmation.jsx`: Post-reservation confirmation page displaying reservation numbers, dates, room imagery, and payment collection notices.
  - `Login.jsx` & `Register.jsx`: Authentication forms with real-time validation, password toggle, and automated post-auth redirection.
- **Components (`src/components/`):** Reusable UI components including `Navbar.jsx`, `Footer.jsx`, `BookingPaymentModal.jsx`, `RoomDetailsModal.jsx`, `InvoiceModal.jsx`, `SupportModal.jsx`, `ProtectedRoute.jsx`, and `Icons.jsx`.
- **API Client (`src/api/axiosClient.js`):** Configures Axios with a base URL pointing to `http://localhost:5000` (or `VITE_API_BASE_URL`), automatically extracting the JWT token from `localStorage` and appending `Authorization: Bearer <token>`.
- **Context (`src/context/SupportContext.jsx`):** Provides global modal state for the floating 24/7 concierge and self-service support desk.

### 3.3 Backend Architecture
The backend is located in `Backend/` and follows a structured Express service pattern:
- **Server Entrypoint (`server.js`):** Initializes Express, attaches security headers, configures the CORS origin whitelist, registers raw body parsers for Stripe webhooks, connects to MongoDB via Mongoose, triggers automatic database seeding if room/hotel counts are below threshold, registers API routers, and binds centralized 404 and global error handlers.
- **Middleware (`middleware/auth.js`):**
  - `protect`: Extracts the Bearer token, verifies its signature using `JWT_SECRET`, retrieves the user from MongoDB (excluding password), and attaches `req.user`.
  - `authorize(...roles)`: Enforces role boundaries, returning HTTP 403 Forbidden if `req.user.role` is not in the permitted list.
- **Routes (`routes/`):** 10 modular Express routers handling authentication, hotels, rooms, bookings, payments, staff operations, reviews, notifications, admin analytics, and support.
- **Controllers (`controllers/stripeWebhook.js`):** Dedicated handler for Stripe webhook events (`checkout.session.completed`, `payment_intent.succeeded`) with HMAC signature verification.
- **Utilities (`utils/`):** Business logic modules including `bookingAvailability.js` (mutex locks, date math, hold filtering), `currencyConverter.js` (INR to EUR and euro cent conversions), `stripeCheckout.js` (session creation), `stripeClient.js` (Stripe instance initialization), and `emailService.js` (transactional confirmation emails).

### 3.4 Database Layer
The database layer uses MongoDB connected via Mongoose. All schema definitions reside in `Backend/models/`. Data access is performed via Mongoose query methods (`find`, `findOne`, `create`, `findOneAndUpdate`, `aggregate`) with typed schemas, field-level constraints, default values, and compound indexes. In addition, an in-memory catalog (`utils/heritageHotelsData.js`) contains 24 authentic heritage suites mapped to 6 Indian hotel properties, which are dynamically merged with MongoDB rooms and automatically upserted into MongoDB when their status is updated by staff.

### 3.5 API Communication
All client-server communication occurs over HTTP/HTTPS using REST conventions:
- Standard requests use `Content-Type: application/json`.
- Stripe webhook endpoints (`/api/payments/stripe-webhook` and `/api/stripe`) use `express.raw({ type: 'application/json' })` to preserve the unaltered byte payload required for cryptographic signature construction.
- Authenticated requests transmit JWT credentials via the `Authorization: Bearer <token>` header.
- Cross-origin requests are strictly validated against approved origins.

---

## Chapter 4: ER Diagram and Database Design

### 4.1 Database Entities Overview
HotelPro defines 10 core Mongoose schemas. Each entity serves a distinct role in the hospitality lifecycle:

```
+-----------------------------------------------------------------------------------+
|                                 HOTELPRO ER MODEL                                 |
+-----------------------------------------------------------------------------------+

     +------------------+                    +------------------+
     |       User       |                    |      Hotel       |
     +------------------+                    +------------------+
     | _id (PK)         |                    | _id (PK)         |
     | name             |                    | name             |
     | email (Unique)   |                    | city, country    |
     | password (Hash)  |                    | location         |
     | role (Enum)      |                    | starRating       |
     | phone            |                    | image, images    |
     | membershipTier   |                    | startingPrice    |
     +--------+---------+                    +--------+---------+
              |                                       |
              | 1:N (userEmail)                       | 1:N (hotelId)
              |                                       |
     +--------v---------+                    +--------v---------+
     |     Booking      | >----------------- |       Room       |
     +------------------+   N:1 (roomId)     +------------------+
     | _id (PK)         |                    | _id (PK)         |
     | bookingNumber    |                    | roomNumber (UQ)  |
     | userEmail        |                    | name             |
     | roomId (FK)      |                    | type (Enum)      |
     | checkInDate      |                    | pricePerNight    |
     | checkOutDate     |                    | capacity         |
     | nights, guests   |                    | isAvailable      |
     | pricePerNight    |                    | status (Enum)    |
     | taxAmount, total |                    | seasonalPricing  |
     | status (Enum)    |                    +--------+---------+
     | paymentStatus    |                             |
     | holdExpiresAt    |                             | 1:N (roomId)
     | paymentMethod    |                             |
     | stripeSessionId  |                    +--------v---------+
     | chargedAmount    |                    |      Review      |
     | chargedCurrency  |                    +------------------+
     +--------+---------+                    | _id (PK)         |
              |                              | roomId (FK)      |
              | 1:1 (bookingId)              | userEmail        |
              |                              | rating (1-5)     |
     +--------v---------+                    | comment          |
     |     Payment      |                    | staffReply       |
     +------------------+                    +------------------+
     | _id (PK)         |
     | bookingId (FK)   |
     | bookingNumber    |                    +------------------+
     | userEmail        |                    |   CheckInOut     |
     | amount           |                    +------------------+
     | currency (EUR)   |                    | _id (PK)         |
     | paymentMethod    |                    | bookingId (FK)   |
     | transactionId    |                    | keyCardCode      |
     | status (Enum)    |                    | checkInTime      |
     | invoiceNumber    |                    | checkOutTime     |
     | paidAt           |                    | inspectionNotes  |
     +------------------+                    +------------------+

     +------------------+   +------------------+   +------------------+
     |   Notification   |   |  ServiceRequest  |   |     AdminLog     |
     +------------------+   +------------------+   +------------------+
     | recipientEmail   |   | guestName, email |   | action           |
     | role (Enum)      |   | roomNumber       |   | performedBy      |
     | title, message   |   | serviceType      |   | targetEntity     |
     | type, isRead     |   | priority, status |   | details          |
     +------------------+   +------------------+   +------------------+
```

### 4.2 Entity Specifications

#### 1. User (`models/User.js`)
- **Purpose:** Represents all human actors (Guests, Front Desk Staff, Administrators).
- **Primary Identifier:** `_id` (MongoDB ObjectId).
- **Fields:**
  - `name` (String, required): Full legal name of user.
  - `email` (String, required, unique, lowercase, trim): Unique login identifier. Indexed for rapid lookup.
  - `password` (String, required): One-way bcrypt hash of the user's password.
  - `role` (String, enum: `['Guest', 'Staff', 'Admin']`, default: `'Guest'`): Authorization role.
  - `phone` (String, default: `'+1 (555) 019-2834'`): Contact telephone number.
  - `avatar` (String, default: `''`): URL to profile image.
  - `membershipTier` (String, enum: `['Silver', 'Gold Elite', 'Platinum VIP']`, default: `'Gold Elite'`): Guest loyalty level.
  - `createdAt` (Date, default: `Date.now`): Timestamp of account creation.

#### 2. Hotel (`models/Hotel.js`)
- **Purpose:** Represents physical resort and palace properties in the hospitality portfolio.
- **Primary Identifier:** `_id` (ObjectId).
- **Fields:**
  - `name` (String, required): Commercial name of property (e.g., "The Amer Fort Haveli").
  - `city` (String, required): City location (e.g., "Jaipur").
  - `country` (String, required): Country location (e.g., "India").
  - `location` (String, required): Geographic address/landmark.
  - `address` (String, required): Full postal street address.
  - `starRating` (Number, default: 5): Official hotel star category.
  - `rating` (Number, default: 4.9): Aggregate guest rating score.
  - `reviewCount` (Number, default: 120): Total review volume.
  - `image` (String, required): Primary hero image URL.
  - `images` ([String]): Array of secondary gallery image URLs.
  - `description` (String, required): Overview text highlighting property history and architecture.
  - `amenities` ([String]): Array of property-level amenities (e.g., "Ayurvedic Spa", "Pool").
  - `startingPrice` (Number, default: 250): Base starting room rate for discovery cards.
  - `phone` (String), `email` (String): Direct contact information.
  - `featured` (Boolean, default: true): Priority flag for homepage placement.
  - `createdAt` (Date, default: `Date.now`).

#### 3. Room (`models/Room.js`)
- **Purpose:** Represents individual luxury suites and rooms available for booking.
- **Primary Identifier:** `_id` (ObjectId).
- **Fields:**
  - `roomNumber` (String, required, unique): Unique door/inventory number (e.g., "AMR-101").
  - `name` (String, required): Descriptive suite name (e.g., "Pink City Deluxe Heritage Chamber").
  - `hotelId` (ObjectId, ref: `'Hotel'`, optional): Reference to parent hotel property.
  - `hotelName` (String, default: `'The Grand Azure Resort & Spa'`): Denormalized hotel brand name.
  - `city` (String), `location` (String): Denormalized location attributes for rapid querying.
  - `type` (String, enum: `['Deluxe', 'Executive Suite', 'Presidential Villa', 'Penthouse', 'Standard Double', 'Ocean Villa', 'Alpine Chalet', 'Heritage Suite']`, required): Suite category.
  - `pricePerNight` (Number, required): Authoritative nightly base tariff (in USD equivalent).
  - `capacity` (Number, required): Maximum allowed guest occupancy.
  - `bedType` (String, default: `'King Size Plush'`), `sizeSqFt` (Number, default: 550), `floor` (Number, default: 3).
  - `image` (String, required), `images` ([String]): Gallery photo URLs.
  - `description` (String, required), `amenities` ([String]): Suite-specific features.
  - `isAvailable` (Boolean, default: true): Overall availability flag.
  - `status` (String, enum: `['Available', 'Occupied', 'Cleaning', 'Maintenance']`, default: `'Available'`): Real-time housekeeping status.
  - `seasonalPricing` ([seasonalPricingSchema]): Embedded subdocuments with `seasonName`, `multiplier`, `startDate`, `endDate`.
  - `rating` (Number, default: 4.8), `reviewCount` (Number, default: 12), `featured` (Boolean, default: false).
  - `createdAt` (Date, default: `Date.now`).
- **Compound Indexes:**
  - `{ hotelName: 1, status: 1 }`
  - `{ city: 1, type: 1 }`
  - `{ pricePerNight: 1, capacity: 1 }`
  - `{ featured: -1, pricePerNight: 1 }`

#### 4. Booking (`models/Booking.js`)
- **Purpose:** Core reservation transaction entity tracking date ranges, guests, pricing, payment statuses, and holds.
- **Primary Identifier:** `_id` (ObjectId).
- **Fields:**
  - `bookingNumber` (String, required, unique): Human-readable reference code (e.g., "HP-2026-4821").
  - `userEmail` (String, required, indexed): Email of the guest who placed the booking.
  - `userName` (String, required), `userPhone` (String).
  - `roomId` (ObjectId, ref: `'Room'`, indexed): Reference to reserved room.
  - `roomName` (String, required), `roomNumber` (String), `roomImage` (String).
  - `hotelName` (String), `hotelImage` (String).
  - `checkInDate` (Date, required, indexed), `checkOutDate` (Date, required, indexed).
  - `nights` (Number, default: 1), `guestsCount` (Number, default: 2).
  - `pricePerNight` (Number, required): Server-enforced base nightly rate at time of booking.
  - `taxAmount` (Number, default: 0): Computed 12% luxury hospitality tax.
  - `totalPrice` (Number, required): Server-computed total in base currency (`nights * rate + tax`).
  - `status` (String, enum: `['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled']`, default: `'Confirmed'`).
  - `paymentStatus` (String, enum: `['Paid', 'Pending', 'Failed', 'Refunded']`, default: `'Pending'`).
  - `holdExpiresAt` (Date, default: null, sparse index): Future timestamp when unverified online holds expire (15 minutes).
  - `paymentMethod` (String, default: `'Credit Card'`): `'Stripe'` or `'Pay at Hotel Desk'`.
  - `transactionId` (String, default: `''`): Payment gateway transaction identifier.
  - `stripeSessionId` (String, default: `''`): Stripe Checkout Session ID (`cs_...`).
  - `stripePaymentIntentId` (String, default: `''`): Stripe PaymentIntent ID (`pi_...`).
  - `specialRequests` (String), `cancellationReason` (String).
  - `currency` (String, default: `'USD'`): Denominated currency.
  - `chargedAmount` (Number), `chargedCurrency` (String): Exact currency and amount settled on Stripe (e.g., `1571.72`, `'EUR'`).
  - `refundStatus` (String, default: `'None'`): `'Refund Processed'` or `'Stripe Refund Processed'`.
  - `createdAt` (Date, default: `Date.now`).
- **Compound Indexes:**
  - `{ userEmail: 1, createdAt: -1 }`
  - `{ roomId: 1, checkInDate: 1, checkOutDate: 1, status: 1 }`
  - `{ status: 1, checkInDate: 1 }`
  - `{ holdExpiresAt: 1 }` (sparse)
- **Model Method `isHoldActive()`:** Evaluates whether a reservation currently blocks room dates. Returns `false` if status is `Cancelled` or `Checked-Out`. Returns `true` if `paymentStatus === 'Paid'` or `paymentMethod === 'Pay at Hotel Desk'`. For pending online payments, evaluates if `holdExpiresAt > new Date()`.

#### 5. Payment (`models/Payment.js`)
- **Purpose:** Immutable financial audit record corresponding to booking transactions.
- **Primary Identifier:** `_id` (ObjectId).
- **Fields:**
  - `bookingId` (ObjectId, ref: `'Booking'`, indexed): One-to-one link to reservation.
  - `bookingNumber` (String, required): Reservation code.
  - `userEmail` (String, required, indexed), `userName` (String, required).
  - `amount` (Number, required): Settled monetary amount.
  - `currency` (String, default: `'USD'`): Currency code (`'EUR'`, `'USD'`, `'INR'`).
  - `paymentMethod` (String, enum: `['Credit Card', 'Credit Card (Simulated)', 'Stripe', 'Stripe / UPI', 'Pay at Hotel Desk']`, default: `'Credit Card'`).
  - `transactionId` (String, required, indexed): Gateway transaction ID or pending placeholder.
  - `status` (String, enum: `['Completed', 'Pending', 'Refunded', 'Failed']`, default: `'Pending'`).
  - `invoiceNumber` (String, required): Formal tax invoice number (e.g., "INV-2026-4821").
  - `cardLast4` (String, default: `'4242'`).
  - `failureReason` (String, default: `''`).
  - `paidAt` (Date, default: `Date.now`).
- **Compound Indexes:** `{ bookingId: 1 }`, `{ userEmail: 1, paidAt: -1 }`, `{ transactionId: 1 }`.

#### 6. Review (`models/Review.js`)
- **Fields:** `roomId` (ObjectId, ref: `'Room'`, required), `roomName` (String), `userEmail` (String, required), `userName` (String, required), `rating` (Number, 1–5 stars, required), `comment` (String, required), `staffReply` (String, default: `''`), `createdAt` (Date).

#### 7. Notification (`models/Notification.js`)
- **Fields:** `recipientEmail` (String), `role` (String, enum: `['Guest', 'Staff', 'Admin', 'All']`), `title` (String), `message` (String), `type` (String, enum: `['booking', 'payment', 'service', 'checkin', 'system']`), `isRead` (Boolean, default: false), `createdAt` (Date).

#### 8. ServiceRequest (`models/ServiceRequest.js`)
- **Fields:** `guestName` (String), `guestEmail` (String), `roomNumber` (String), `serviceType` (String, enum: `['Housekeeping', 'Room Service Food', 'Maintenance', 'Luggage Assistance', 'Concierge & Transport', 'Extra Amenities']`), `details` (String), `priority` (String, enum: `['Low', 'Medium', 'Urgent']`, default: `'Medium'`), `status` (String, enum: `['Requested', 'In Progress', 'Completed', 'Cancelled']`, default: `'Requested'`), `assignedStaff` (String, default: `'Unassigned'`), `requestedAt` (Date), `completedAt` (Date).

#### 9. CheckInOut (`models/CheckInOut.js`)
- **Fields:** `bookingId` (ObjectId, ref: `'Booking'`, required), `bookingNumber` (String), `guestName` (String), `guestEmail` (String), `roomNumber` (String), `checkInTime` (Date), `checkOutTime` (Date), `keyCardCode` (String, e.g., "AZ-101-4921"), `staffName` (String), `inspectionNotes` (String), `extraCharges` (Number, default: 0), `status` (String, enum: `['Active', 'Completed']`, default: `'Active'`), `createdAt` (Date).

#### 10. AdminLog (`models/AdminLog.js`)
- **Fields:** `action` (String, required), `performedBy` (String, required email), `targetEntity` (String), `details` (String), `timestamp` (Date, default: `Date.now`).

### 4.3 Catalog Data vs Database Entities
HotelPro implements a hybrid catalog model:
- **MongoDB Room Documents:** Dynamically managed rooms stored in the database. When staff or administrators update pricing, availability, or status via API endpoints, the changes persist directly to the MongoDB `rooms` collection.
- **In-Memory Heritage Catalog (`Backend/utils/heritageHotelsData.js`):** A pre-configured collection of 24 palace and heritage suites mapped to 6 authentic Indian hotel records. These suites provide rich 5-image galleries (bedroom, courtyard, view, bath, salon) for browsing.
- **Catalog Synchronization:** When `GET /api/rooms` is queried, database rooms take precedence; heritage suites not already present in MongoDB are seamlessly appended. When a staff member updates the housekeeping status of an in-memory heritage suite (e.g., via `PUT /api/staff/rooms/:id/status`), the system immediately executes an upsert (`findOneAndUpdate` with `upsert: true`) into MongoDB, promoting the catalog entry to a fully persistent database document without data loss.

---

## Chapter 5: MVC Pattern and Request Lifecycle

### 5.1 Adapted MVC Architecture
HotelPro adapts the classic Model-View-Controller pattern for a decoupled Single Page Application (SPA) communicating with a stateless REST API:

- **Model Layer (`Backend/models/`):** Encapsulates data schema definitions, validation constraints, default values, compound indexes, and custom business logic helpers (e.g., `Booking.methods.isHoldActive`). Models interact directly with MongoDB via Mongoose.
- **View Layer (`FrontEnd/src/`):** React components, pages, forms, and modals. The View is completely decoupled from the database and interacts with the Controller solely through JSON over HTTP. Components manage local interactive states (spinners, form inputs, modal visibility) and render responsive UI based on data received from API responses.
- **Controller Layer (`Backend/routes/` and `Backend/controllers/`):** Express route handlers and controller modules that receive HTTP requests, extract parameters, perform role authorization checks, coordinate business logic utilities, query models, and return formatted HTTP JSON responses.
- **Routes Layer (`Backend/routes/`):** Endpoint route definitions mapping HTTP verbs and URL paths to middleware functions and controller handlers.
- **Service/Utility Layer (`Backend/utils/`):** Domain-specific business logic extracted from controllers to maintain high modularity:
  - `bookingAvailability.js`: Serialized room mutex locking, date overlap filtering, and hold expiry checks.
  - `currencyConverter.js`: Arithmetic conversion between USD, INR, and EUR with rounding to euro cents.
  - `stripeCheckout.js`: Stripe session assembly and parameter injection.
  - `emailService.js`: Transactional guest notifications.

### 5.2 Implementation File Mapping

| MVC Component | Layer | Repository Path | Example Implementation Details |
|---|---|---|---|
| **User Model** | Model | `Backend/models/User.js` | Schema with email uniqueness, role enum, loyalty tier |
| **Booking Model** | Model | `Backend/models/Booking.js` | Schema with date indexes, compound indexes, `isHoldActive()` |
| **Room Model** | Model | `Backend/models/Room.js` | Schema with pricing, capacity, seasonal pricing subdocs |
| **Payment Model** | Model | `Backend/models/Payment.js` | Audit schema with invoice numbers, gateway transaction IDs |
| **Rooms View** | View | `FrontEnd/src/pages/Rooms.jsx` | Dynamic catalog view with multi-parameter filter controls |
| **Booking View** | View | `FrontEnd/src/components/BookingPaymentModal.jsx` | Reservation modal with night/tax calculations and Stripe redirect |
| **Operations View** | View | `FrontEnd/src/pages/UnifiedDashboard.jsx` | Multi-tab operational portal for Guest, Staff, and Admin |
| **Invoice View** | View | `FrontEnd/src/components/InvoiceModal.jsx` | Printable tax invoice with breakdown and QR verification code |
| **Auth Controller** | Controller | `Backend/routes/authRoutes.js` | User registration, bcrypt hashing, JWT issuance, `/me` profile |
| **Booking Controller** | Controller | `Backend/routes/bookingRoutes.js` | Room locking, date conflict detection, booking creation |
| **Payment Controller** | Controller | `Backend/routes/paymentRoutes.js` | Stripe checkout session creation, invoice generation |
| **Webhook Controller** | Controller | `Backend/controllers/stripeWebhook.js` | Cryptographic signature validation, booking payment updates |
| **Staff Controller** | Controller | `Backend/routes/staffRoutes.js` | Check-in with keycard generation, checkout with turnover ticket |
| **Availability Service** | Utility | `Backend/utils/bookingAvailability.js` | `withRoomLock` Promise mutex, `findOverlappingBooking` |
| **Currency Service** | Utility | `Backend/utils/currencyConverter.js` | `convertInrToEur`, `getEurToInrRate`, cent rounding |

### 5.3 Request Lifecycle Walkthrough
The diagram below illustrates the complete lifecycle of a reservation request:

```
[React View] ---1. POST /api/bookings + Bearer Token---> [Axios Client]
                                                                |
[CORS Guard] <-------------------2. HTTP POST------------------+
      |
      v (Origin Whitelisted)
[Auth Middleware] ---3. Verify JWT & Query User DB---> [req.user Attached]
                                                                |
[Booking Router] <----------------------------------------------+
      |
      +---4. withRoomLock(roomId) Mutex Lock Acquired
      |
      +---5. Query Room & Run Overlap Check (findOverlappingBooking)
      |
      +---6. Calculate Nights, 12% Tax, Total Price Server-Side
      |
      +---7. Call Stripe API: checkout.sessions.create in EUR
      |
      +---8. Save Booking (paymentStatus: 'Pending', holdExpiresAt: +15m)
      |
      +---9. Release Mutex Lock
      |
[HTTP 201 Response] ---> [Axios Client] ---> [React View: Redirect to Stripe URL]
```

1. **User Action:** The guest selects suite dates in `BookingPaymentModal.jsx` and clicks "Reserve Suite".
2. **Client Dispatch:** Axios dispatches `POST /api/bookings` with the booking payload and `Authorization: Bearer <token>`.
3. **Security Gate:** Express security middleware verifies origin against the CORS whitelist and sets security headers (`X-Content-Type-Options: nosniff`).
4. **Authentication:** The `protect` middleware extracts the Bearer token, validates its HMAC signature using `JWT_SECRET`, queries `User.findById(decoded.id)`, and attaches the verified user object to `req.user`.
5. **Concurrency Lock:** The route handler enters `withRoomLock(roomId)`, acquiring an exclusive in-process Promise mutex for that specific room ID.
6. **Inventory & Availability Check:** The server queries `Room.findById(roomId)` for authoritative pricing, verifies that requested guests do not exceed room capacity, and executes `findOverlappingBooking(roomId, checkIn, checkOut)` against active confirmed bookings and unexpired holds.
7. **Server-Side Pricing:** The server calculates nights, subtotal, 12% tax, and total price, disregarding any client-supplied rates.
8. **External Gateway Assembly:** If Stripe is chosen, the server converts the booking's INR total to EUR (`INR / 110`), converts to cents (`EUR * 100`), and creates a Stripe Checkout Session via the Stripe SDK.
9. **Persistence:** The server creates a `Booking` document with `paymentStatus: 'Pending'`, `holdExpiresAt: now + 15m`, and `stripeSessionId`, accompanied by a corresponding `Payment` record with status `'Pending'`.
10. **Mutex Release & Response:** The mutex lock is released, and the server returns HTTP 201 Created with `{ booking, checkoutUrl, stripeDetails }`.
11. **Client Execution:** The React component receives the response and redirects the browser window directly to `session.url` on Stripe's hosted checkout.

---

## Chapter 6: Features and Modules

### 6.1 Feature Specifications Table

| Feature / Module | Description | Access Roles | Frontend Files | Backend Endpoints | Models Involved | Verification Status |
|---|---|---|---|---|---|---|
| **User Registration** | Creates guest account with bcrypt-hashed password; client role overrides forced to 'Guest' | Public | `Register.jsx` | `POST /api/auth/register` | `User`, `AdminLog` | Verified Implemented |
| **User Login & JWT** | Validates email/password, issues 7-day signed JWT containing user id, email, and role | Public | `Login.jsx` | `POST /api/auth/login` | `User` | Verified Implemented |
| **Profile Management** | Retrieves and updates authenticated user profile (name, phone, avatar) without role alteration | Guest, Staff, Admin | `UnifiedDashboard.jsx` | `GET /api/auth/me`<br/>`PUT /api/auth/profile` | `User` | Verified Implemented |
| **Hotel Catalog** | Lists properties with city/search filters, star ratings, amenities, and dynamic room counts | Authenticated | `Home.jsx`, `Rooms.jsx` | `GET /api/hotels`<br/>`GET /api/hotels/:id` | `Hotel`, `Room` | Verified Implemented |
| **Suite Discovery** | Search rooms with combined filters: type, capacity, price range, city, hotel brand, amenities | Public / Auth | `Rooms.jsx` | `GET /api/rooms`<br/>`GET /api/rooms/:id` | `Room`, `Review` | Verified Implemented |
| **Date Availability Filter** | Excludes rooms with overlapping confirmed reservations or active holds for selected dates | Public / Auth | `Rooms.jsx` | `GET /api/rooms?checkInDate=...`<br/>`POST /api/bookings/availability` | `Room`, `Booking` | Verified Implemented |
| **Reservation Mutex Lock** | Serializes concurrent booking requests on the same room to eliminate race conditions | Authenticated | `BookingPaymentModal.jsx` | `POST /api/bookings` | `Booking`, `Room` | Verified Implemented |
| **Server-Side Pricing** | Enforces nightly rates, nights count, and 12% luxury hospitality tax strictly on the server | Authenticated | `BookingPaymentModal.jsx` | `POST /api/bookings` | `Booking`, `Room` | Verified Implemented |
| **15-Minute Hold Expiry** | Holds suite for 15 minutes during online checkout; auto-releases if payment is abandoned | Authenticated | `BookingPaymentModal.jsx`, `MyBookings.jsx` | `POST /api/bookings`<br/>`utils/bookingAvailability.js` | `Booking` | Verified Implemented |
| **Hold Retry Reuse** | Allows same guest to retry payment on an active hold without triggering "Already Reserved" | Authenticated | `MyBookings.jsx` | `POST /api/bookings` | `Booking`, `Payment` | Verified Implemented |
| **Stripe EUR Checkout** | Converts tariff to EUR and cents; creates hosted Stripe Checkout Session with metadata | Authenticated | `BookingPaymentModal.jsx`, `MyBookings.jsx` | `POST /api/payments/checkout` | `Booking`, `Payment` | Verified Implemented |
| **Pay at Hotel Desk** | Reserves room with `paymentStatus: 'Pending'`, `holdExpiresAt: null`, and check-in collection notice | Authenticated | `BookingPaymentModal.jsx` | `POST /api/bookings` | `Booking`, `Payment` | Verified Implemented |
| **Stripe Verification** | Verifies checkout completion via API session retrieval, updates status to 'Paid', clears hold | Authenticated | `MyBookings.jsx` | `POST /api/payments/stripe/verify` | `Booking`, `Payment` | Verified Implemented |
| **Stripe Webhook** | Processes `checkout.session.completed` with HMAC signature verification and updates DB | External / Stripe | N/A (Server-to-Server) | `POST /api/payments/stripe-webhook` | `Booking`, `Payment` | Verified Implemented |
| **Digital Tax Invoice** | Generates printable tax invoice with rate per night, nights, 12% tax, rounding, and total | Guest, Staff, Admin | `InvoiceModal.jsx`, `MyBookings.jsx` | `GET /api/payments/invoice/:bookingId` | `Booking`, `Payment` | Verified Implemented |
| **Digital Keycard Check-In** | Front desk checks in guest, issues encrypted keycard code, transitions room to 'Occupied' | Staff, Admin | `UnifiedDashboard.jsx` | `POST /api/staff/checkin` | `Booking`, `Room`, `CheckInOut`, `AdminLog` | Verified Implemented |
| **Turnover Check-Out** | Checks out guest, transitions room to 'Cleaning', queues urgent Housekeeping ticket | Staff, Admin | `UnifiedDashboard.jsx` | `POST /api/staff/checkout` | `Booking`, `Room`, `CheckInOut`, `ServiceRequest`, `AdminLog` | Verified Implemented |
| **Housekeeping Grid** | Real-time room status management (`Available`, `Occupied`, `Cleaning`, `Maintenance`) | Staff, Admin, Guest | `UnifiedDashboard.jsx` | `GET /api/staff/rooms/status`<br/>`PUT /api/staff/rooms/:id/status` | `Room`, `AdminLog` | Verified Implemented |
| **Guest Service Tickets** | Submits and manages service tickets (Housekeeping, Food, Maintenance, Concierge) | Guest (create/view)<br/>Staff/Admin (update) | `UnifiedDashboard.jsx`, `SupportModal.jsx` | `GET /api/staff/services`<br/>`POST /api/staff/services`<br/>`PUT /api/staff/services/:id` | `ServiceRequest` | Verified Implemented |
| **Reviews & Aggregation** | Submits 1–5 star room reviews; recalculates average room rating; staff reply capability | Guest (submit)<br/>Staff/Admin (reply) | `UnifiedDashboard.jsx`, `RoomDetailsModal.jsx` | `GET /api/reviews`<br/>`POST /api/reviews`<br/>`POST /api/reviews/:id/reply` | `Review`, `Room` | Verified Implemented |
| **Admin KPI Analytics** | Real-time revenue aggregation, occupancy %, booking counts, category distributions | Admin only | `UnifiedDashboard.jsx` | `GET /api/admin/analytics` | `Booking`, `Payment`, `Room`, `User`, `AdminLog` | Verified Implemented |
| **User Role Management** | Lists registered users; updates roles (`Guest`, `Staff`, `Admin`) and loyalty tiers | Admin only | `UnifiedDashboard.jsx` | `GET /api/admin/users`<br/>`PUT /api/admin/users/:id/role` | `User`, `AdminLog` | Verified Implemented |
| **System Audit Logs** | Immutable chronological record of system events, timestamps, and performing actors | Admin only | `UnifiedDashboard.jsx` | `GET /api/admin/logs` | `AdminLog` | Verified Implemented |

---

## Chapter 7: Roles and Responsibilities

### 7.1 Enforced Role Hierarchy
HotelPro enforces three distinct roles defined in the `User` schema:

1. **Guest:** Default role assigned to all public registrations. Guests have self-service access to browse properties, check availability, create reservations, initiate Stripe checkout in EUR, choose Pay at Hotel Desk, view booking history, download digital invoices, cancel bookings, request guest services, and submit room reviews. Guests are strictly blocked from operational desk features and administrative analytics.
2. **Staff:** Operational role for hotel front desk clerks, concierges, and housekeeping supervisors. In addition to guest-level capabilities, staff can view operational statistics (today's check-ins and check-outs, room counts, pending services), process guest check-ins with digital keycard generation, process check-outs with automated housekeeping turnover tickets, update room statuses across the housekeeping grid, fulfill service tickets, and reply to guest reviews.
3. **Admin:** Executive role for general managers and IT directors. Administrators possess complete system privileges: all staff and guest operations, plus executive KPI analytics (total revenue, occupancy percentages, monthly performance), user role and loyalty tier management, full CRUD on hotel properties and rooms, and inspection of the system audit log.

### 7.2 Permissions Matrix

| Functional Capability | Guest | Staff | Admin | Backend Security Enforcement |
|---|:---:|:---:|:---:|---|
| **Browse Hotels & Luxury Suites** | Yes | Yes | Yes | Public / Authenticated route |
| **Filter by Date Range Availability** | Yes | Yes | Yes | Public / Authenticated route (`/api/rooms`) |
| **Create Reservation (Stripe / Desk)** | Yes | Yes | Yes | `protect` middleware (`req.user`) |
| **View Own Booking History** | Yes | Yes | Yes | `protect` (scoped to `req.user.email`) |
| **Access Own Digital Tax Invoice** | Yes | Yes | Yes | `protect` (verified owner or staff/admin) |
| **Access Other Guests' Invoices/Bookings** | No | Yes | Yes | Ownership check; returns 403 Forbidden |
| **Cancel Own Reservation** | Yes | Yes | Yes | Ownership check; updates status & releases room |
| **Cancel Other Guests' Reservation** | No | Yes | Yes | Ownership check; returns 403 Forbidden |
| **Submit Service Request Ticket** | Yes | Yes | Yes | `protect` (`req.user.email` attached) |
| **Submit Room Review & Star Rating** | Yes | Yes | Yes | `protect` (`req.user` verified) |
| **View Staff Operational Statistics** | No | Yes | Yes | `authorize('Staff', 'Admin')`; returns 403 |
| **Process Guest Check-In & Keycard** | No | Yes | Yes | `authorize('Staff', 'Admin')` |
| **Process Check-Out & Turnover Ticket**| No | Yes | Yes | `authorize('Staff', 'Admin')` |
| **Update Housekeeping Room Status Grid**| No* | Yes | Yes | `authorize('Staff', 'Admin', 'Guest')`* |
| **Update Service Request Status** | No | Yes | Yes | `authorize('Staff', 'Admin')` |
| **Reply to Guest Review** | No | Yes | Yes | `authorize('Staff', 'Admin')` |
| **View Executive KPI Analytics** | No | No | Yes | `authorize('Admin')`; returns 403 |
| **View All Registered Users List** | No | No | Yes | `authorize('Admin')`; returns 403 |
| **Modify User Roles & Loyalty Tiers** | No | No | Yes | `authorize('Admin')`; returns 403 |
| **Create / Update / Delete Hotel Rooms**| No | No | Yes | `authorize('Admin')`; returns 403 |
| **View System Audit Trail Logs** | No | No | Yes | `authorize('Admin')`; returns 403 |

*\*Note on Housekeeping Grid: In `Backend/routes/staffRoutes.js`, the room status update endpoint permits the Guest role alongside Staff and Admin specifically to allow academic evaluators to demonstrate room status changes from the unified dashboard without forcing an account re-login. In a hardened production deployment, this would be restricted strictly to `'Staff'` and `'Admin'`.*

### 7.3 Frontend Guarding vs Backend Enforcement
HotelPro maintains a strict distinction between frontend visual routing and backend authorization:
- **Frontend Route Guards (`ProtectedRoute.jsx`):** Inspects `localStorage.getItem('token')` and `localStorage.getItem('user')`. If unauthenticated, it redirects the browser to `/login`. If `allowedRoles` is specified (e.g., `allowedRoles={['Admin']}` for `/admin`), unauthorized users are redirected to their own appropriate dashboard.
- **Backend Authorization Middleware (`middleware/auth.js`):** Frontend guards exist purely for user experience. True security is enforced by backend Express middleware:
  ```javascript
  const authorize = (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource`
        });
      }
      next();
    };
  };
  ```
  Even if an attacker bypasses the React frontend using tools such as Postman or cURL, any protected endpoint rejects the request with HTTP 403 Forbidden.

---

## Chapter 8: Complete User Flows

### 8.1 Flow A: Registration and Login

```
[Guest] ---> Submit Name, Email, Password ---> [POST /api/auth/register]
                                                        |
[JWT Token (7d) Issued] <--- Hash Password (bcrypt) <---+
         |                   Force Role: 'Guest'
         v
[Store in localStorage] ---> Authenticated Routes Accessible
```

1. **Input & Validation:** The guest provides full name, email, password, and phone number. The frontend validates email syntax and requires a minimum password length of 6 characters.
2. **Server Processing:** `POST /api/auth/register` normalizes the email to lowercase, verifies that no account with that email exists, hashes the password with bcrypt (10 rounds), forces the `role` attribute to `'Guest'`, and saves the user. An entry is recorded in `AdminLog`.
3. **Token Issuance:** A signed JWT token containing `{ id, role: 'Guest', email, name }` is generated with a 7-day expiration and returned with the sanitized user profile.
4. **Login Flow:** On subsequent visits, `POST /api/auth/login` verifies the password using `bcrypt.compare` and issues a fresh JWT. The frontend stores the token and user profile in `localStorage`.

### 8.2 Flow B: Hotel and Suite Booking Flow

```
[Browse Rooms] ---> Select Dates ---> [Check Overlap & Availability]
                                                  |
[Server Tariff Calculation] <--- Submit Booking <-+
         |
         +---> Payment Method?
                 |-- Pay at Desk -> [Confirmed Unpaid Hold, holdExpiresAt: null]
                 |-- Stripe EUR  -> [Pending 15m Hold, Redirect to Stripe]
```

1. **Discovery:** The guest navigates to `/rooms` or destination showcases on the homepage, selects check-in and check-out dates, and filters by suite type or amenities.
2. **Availability Query:** The frontend queries `GET /api/rooms` with date query parameters. The backend identifies booked rooms using half-open interval math (`checkInDate < reqCheckOut && checkOutDate > reqCheckIn`) and excludes them from the returned listing.
3. **Booking Submission:** The guest clicks "Reserve Suite", opening `BookingPaymentModal.jsx`. The guest reviews the number of nights, guest count, and selects a payment method (`'Stripe'` or `'Pay at Hotel Desk'`).
4. **Server Enforcement:** `POST /api/bookings` acquires the in-process room mutex lock, verifies room capacity and availability, calculates base subtotal and 12% tax from the authoritative database rate, and saves the reservation.
5. **Confirmation:** If "Pay at Hotel Desk" is selected, the booking is confirmed with `paymentStatus: 'Pending'`, `holdExpiresAt: null`, and the guest is redirected to `/booking-confirmation/:id`. If "Stripe" is selected, a 15-minute hold is established, and the guest is redirected to Stripe's checkout page.

### 8.3 Flow C: Stripe Payment in EUR Flow

```
[Base Price in USD] ---> Multiply by 83 ---> [Canonical INR Amount]
                                                      |
[Euro Cents sent to Stripe] <--- Divide by 110 <------+
         |
         v
[Stripe Hosted Checkout in EUR] ---> Guest enters card details
```

1. **Tariff Conversion:** The backend converts the server-calculated USD total to its canonical Indian Rupee equivalent (`USD * 83`).
2. **EUR Conversion:** The INR amount is converted to Euros using the configured rate (`EUR = INR / 110`), rounded to two decimal places.
3. **Cents Calculation:** The EUR amount is multiplied by 100 to determine `unit_amount` in euro cents, as required by the Stripe API.
4. **Session Assembly:** The backend calls `stripe.checkout.sessions.create` with:
   - `currency: 'eur'`
   - `mode: 'payment'`
   - `line_items`: Suite name, booking reference, description with INR conversion note, and euro cents amount.
   - `metadata`: `bookingId`, `bookingNumber`, `userEmail`, `inrTotal`, `eurAmount`, `exchangeRate`, `currency: 'EUR'`.
   - `client_reference_id`: Stringified booking ID.
   - `success_url`: `${origin}/my-bookings?stripe=success&bookingId=${id}&session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `${origin}/booking-confirmation/${id}?stripe=cancel`
5. **Redirection:** The guest's browser is redirected to the returned `session.url` on Stripe's hosted payment page.

### 8.4 Flow D: Successful Payment and Verification Flow

```
[Stripe Payment Complete]
       |
       +---> [Webhook Path]  --> HMAC ConstructEvent -> markBookingPaidFromStripe
       |
       +---> [Redirect Path] --> /api/payments/stripe/verify -> markBookingPaidFromStripe
                                       |
[Reconcile Data] <---------------------+
       |
       +--> Update Booking: paymentStatus = 'Paid', holdExpiresAt = null
       +--> Update Payment: status = 'Completed', amount = chargedEUR
       +--> Dispatch Confirmation Email
       +--> Render Digital Tax Invoice in My Bookings
```

1. **Dual Verification Architecture:** HotelPro implements two parallel paths to ensure payments are never missed:
   - **Path 1 (Asynchronous Webhook):** Stripe dispatches `checkout.session.completed` to `/api/payments/stripe-webhook`. Express verifies the HMAC signature using `STRIPE_WEBHOOK_SECRET` and executes `markBookingPaidFromStripe(session)`.
   - **Path 2 (Synchronous Redirect & Polling):** Upon successful payment, Stripe redirects the guest to `/my-bookings?stripe=success&bookingId=...&session_id=...`. `MyBookings.jsx` detects the query parameters and triggers `POST /api/payments/stripe/verify`, which retrieves the session directly from Stripe and executes `markBookingPaidFromStripe(session)`.
2. **State Updates:** In `markBookingPaidFromStripe`:
   - `booking.paymentStatus` transitions to `'Paid'`.
   - `booking.status` is confirmed.
   - `booking.holdExpiresAt` is nullified to prevent hold timeouts.
   - `booking.chargedAmount` stores the actual EUR amount charged.
   - `booking.chargedCurrency` stores `'EUR'`.
   - `booking.transactionId` stores the Stripe PaymentIntent or session ID.
   - The associated `Payment` record status is set to `'Completed'`.
   - A confirmation email is dispatched via `sendBookingConfirmationEmail`.
3. **Invoice Access:** The guest views the confirmed reservation in "My Bookings" and can immediately generate a printable digital tax invoice.

### 8.5 Flow E: Cancelled or Failed Payment Flow
1. **Cancellation:** If the guest clicks "Cancel" on Stripe's checkout page, Stripe redirects the browser to `/booking-confirmation/:id?stripe=cancel`.
2. **Non-Destructive State:** The booking is **not** marked as failed or cancelled immediately. Its status remains `Confirmed` with `paymentStatus: 'Pending'`, and `holdExpiresAt` remains active for the remainder of the 15-minute window.
3. **Retry Mechanism:** Within the 15-minute window, the guest can click "Pay Now" on the booking confirmation page or in "My Bookings". The backend detects the existing pending booking for the same user, room, and dates, and **reuses** the hold, generating a new Stripe session without throwing an "Already Reserved" conflict error.
4. **Hold Expiry:** If the 15-minute window elapses without successful payment, `isHoldActive()` returns `false`. Other guests can now reserve the suite. If the original guest attempts to pay after hold expiry, the backend checks whether another guest has reserved the dates; if so, it returns HTTP 409 Conflict with code `'HOLD_EXPIRED_UNAVAILABLE'`.

### 8.6 Flow F: Booking History and Invoice Flow
1. **Retrieval:** The guest navigates to `/my-bookings`. The frontend dispatches `GET /api/bookings/my-bookings`.
2. **Auto-Reconciliation:** The backend executes `reconcilePendingStripeBookings(bookings)` before returning results, actively checking with Stripe for any pending bookings that were paid while the user was away.
3. **Invoice Generation:** Clicking "Print Official Invoice" triggers `GET /api/payments/invoice/:bookingId`. The backend generates invoice data:
   - Line items: Nightly rate in EUR, number of nights, subtotal.
   - Tax: Exactly 12% occupancy tax in EUR.
   - Rounding Adjustment: Reconciles floating-point sub-cent fractions to ensure `subtotal + occupancyTax + roundingAdjustment === chargedAmount`.
   - QR Verification Code: Cryptographic validation string (`HOTELPRO-VERIFIED-<bookingNumber>-<invoiceNumber>`).
4. **Display:** `InvoiceModal.jsx` displays the formal tax invoice with printable layout styling.

### 8.7 Flow G: Staff and Admin Workflow
1. **Authentication:** The staff member or administrator logs in and accesses `/staff`, `/admin`, or the unified dashboard at `/dashboard`.
2. **Staff Desk Operations:**
   - **Stats Overview:** `GET /api/staff/stats` provides real-time counts for available, occupied, cleaning, and maintenance rooms, today's check-ins and check-outs, and pending service requests.
   - **Check-In:** Staff enters the booking reference. `POST /api/staff/checkin` updates the booking to `Checked-In`, sets room status to `Occupied`, issues an encrypted alphanumeric keycard code (e.g., `AZ-101-4921`), records a `CheckInOut` entry, and logs the action in `AdminLog`.
   - **Check-Out:** Staff processes check-out via `POST /api/staff/checkout`. The booking updates to `Checked-Out`, the room status transitions to `Cleaning`, the check-out timestamp is recorded, and an urgent Housekeeping turnover ticket is automatically created in `ServiceRequest`.
   - **Housekeeping Grid:** Staff updates room statuses (`Available`, `Occupied`, `Cleaning`, `Maintenance`) via `PUT /api/staff/rooms/:id/status`.
   - **Service Requests:** Staff monitors, assigns, and resolves guest service tickets via `PUT /api/staff/services/:id`.
3. **Admin Operations:**
   - **Analytics:** `GET /api/admin/analytics` aggregates total revenue from completed payments, computes occupancy percentages, and displays room category distributions.
   - **User Management:** Administrators inspect registered users via `GET /api/admin/users` and modify roles or loyalty tiers via `PUT /api/admin/users/:id/role`.
   - **Audit Logs:** Administrators inspect the chronological audit trail via `GET /api/admin/logs`.

---

## Chapter 9: Payment Gateway and Currency Conversion

### 9.1 Payment Architecture Overview
HotelPro implements an international cross-currency payment pipeline designed around Stripe Checkout in Euros (€, EUR). The architecture bridges domestic market pricing quoted in Indian Rupees (INR) with international credit card processing in Euros.

### 9.2 Currency Conversion Engine
The conversion engine is implemented in `Backend/utils/currencyConverter.js`:
- **USD to INR Base Multiplier:** Configured via `USD_TO_INR_RATE` (default: 83). Used to compute the canonical INR equivalent for rooms stored with USD base rates.
- **EUR to INR Exchange Rate:** Configured via `EUR_TO_INR_RATE` (default: 110). Reflects the project's configured currency conversion assumption (€1 ≈ ₹110).
- **Conversion Function (`convertInrToEur`):**
  ```javascript
  const convertInrToEur = (inrAmount) => {
    const rate = getEurToInrRate(); // 110
    const inr = Math.max(0, Math.round(Number(inrAmount || 0)));
    const eur = inr / rate;
    const eurAmount = Math.round(eur * 100) / 100; // Rounded to 2 decimal places
    const eurAmountCents = Math.round(eurAmount * 100); // Smallest currency unit for Stripe

    return { inrAmount: inr, eurAmount, eurAmountCents, exchangeRate: rate };
  };
  ```

### 9.3 Worked Mathematical Example
The following step-by-step example demonstrates the complete financial calculation for a 2-night stay in a luxury heritage suite:

#### Step 1: Base Tariff & Tax Calculation (Server-Side)
- **Suite:** Pink City Deluxe Heritage Chamber
- **Authoritative Base Rate:** $240.00 / night
- **Duration:** 2 nights
- **Base Subtotal:** $240.00 × 2 = **$480.00**
- **12% Hospitality Tax:** $480.00 × 0.12 = **$57.60**
- **Total Booking Tariff (USD):** $480.00 + $57.60 = **$537.60**

#### Step 2: Canonical INR Equivalent Calculation
- **Conversion Rate:** $1 = ₹83
- **Canonical INR Total:** Math.round($537.60 × 83) = Math.round(44,620.80) = **₹44,621**

#### Step 3: EUR Conversion for Stripe Checkout
- **Configured Conversion Rate:** €1 ≈ ₹110
- **EUR Amount:** ₹44,621 ÷ 110 = 405.64545... EUR
- **Rounded EUR Amount (2 decimal places):** **€405.65**
- **Euro Cents sent to Stripe API (`unit_amount`):** €405.65 × 100 = **40,565 cents**

#### Step 4: Line-Item Invoice Reconciliation
When the guest or staff generates the tax invoice (`GET /api/payments/invoice/:bookingId`), the backend reconciles the charged total (€405.65) back into individual line items:
- **Total Charged:** €405.65
- **Unrounded Base:** €405.65 ÷ 1.12 = 362.1875 EUR
- **Rate per Night:** Math.round((362.1875 ÷ 2) × 100) / 100 = **€181.09 / night**
- **Subtotal:** €181.09 × 2 = **€362.18**
- **12% Occupancy Tax:** Math.round(€362.18 × 0.12 × 100) / 100 = **€43.46**
- **Subtotal + Tax:** €362.18 + €43.46 = **€405.64**
- **Rounding Adjustment:** €405.65 - €405.64 = **€0.01**
- **Final Invoice Total:** €362.18 + €43.46 + €0.01 = **€405.65** (Exact match)

### 9.4 Reconciliation Between Values Across the System

| Financial Parameter | Source / Location | Example Value | Explanatory Role |
|---|---|:---:|---|
| **Original Booking Base** | `Room.pricePerNight` | $240.00 | Authoritative database rate in base currency |
| **Server Booking Total** | `Booking.totalPrice` | $537.60 | Computed total (`rate * nights + 12% tax`) |
| **Canonical INR Total** | Calculated in `stripeCheckout.js` | ₹44,621 | INR equivalent displayed on website cards |
| **EUR Charged Amount** | `Booking.chargedAmount` | €405.65 | Exact monetary amount settled via Stripe |
| **Stripe Unit Amount** | Stripe Session `unit_amount` | 40,565 | Cents integer processed by Stripe gateway |
| **Payment Model Amount** | `Payment.amount` | €405.65 | Value recorded on financial audit document |
| **Invoice Subtotal** | `charges.subtotal` | €362.18 | Derived base charges (€181.09 × 2 nights) |
| **Invoice Tax (12%)** | `charges.occupancyTax` | €43.46 | Exact 12% statutory tax calculation |
| **Rounding Adjustment** | `charges.roundingAdjustment` | €0.01 | Resolves floating-point cent discrepancies |
| **Invoice Final Total** | `charges.total` | €405.65 | Total printed on official guest invoice |

### 9.5 State Machine Transitions

```
[New Reservation]
       |
       +--- Select 'Stripe' ------------> [Pending Online Hold] (holdExpiresAt = +15m)
       |                                          |
       |                                          +-- Paid on Stripe --> [Paid / Confirmed]
       |                                          +-- Cancelled/Failed -> [Pending Hold] (retryable)
       |                                          +-- 15m Elapses -----> [Expired] (room released)
       |
       +--- Select 'Pay at Hotel Desk' -> [Pending Desk Hold] (holdExpiresAt = null)
                                                  |
                                                  +-- Desk Settlement --> [Paid / Confirmed]
                                                  +-- Cancelled --------> [Cancelled]
```

- **Pending Online Hold:** Created when a guest chooses Stripe. The room is locked for 15 minutes.
- **Paid / Confirmed:** Triggered by successful Stripe webhook or verification callback. The room is permanently reserved; `holdExpiresAt` is nullified; the payment record is marked `Completed`.
- **Expired Online Hold:** If 15 minutes pass without payment, the hold expires automatically without requiring manual database cleanup. Subsequent availability searches treat the room as available.
- **Refunded:** If a paid booking is cancelled, the backend issues an API refund via `stripe.refunds.create({ payment_intent })`, marks `paymentStatus: 'Refunded'`, and sets `refundStatus: 'Stripe Refund Processed'`.

---

## Chapter 10: API Documentation

### 10.1 Complete API Reference Table

| Module | Method | Endpoint Path | Purpose | Authentication | Allowed Roles | Request Parameters / Body | Response Summary | Error Status Codes |
|---|:---:|---|---|:---:|:---:|---|---|:---:|
| **Auth** | `POST` | `/api/auth/register` | Register new user account | Public | Any | `{ name, email, password, phone }` | HTTP 201: `{ message, token, user }` | 400 (Validation / Duplicate) |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user credentials | Public | Any | `{ email, password }` | HTTP 200: `{ message, token, user }` | 400 (Missing), 401 (Invalid) |
| **Auth** | `GET` | `/api/auth/me` | Get current user identity | Protected | Any | None (Bearer token in header) | HTTP 200: Sanitized user object | 401 (Unauthorized) |
| **Auth** | `PUT` | `/api/auth/profile` | Update profile information | Protected | Any | `{ name, phone, avatar }` | HTTP 200: `{ message, user }` | 401, 404 (Not Found) |
| **Hotels** | `GET` | `/api/hotels` | List hotels with room counts | Protected | Any | Query: `?city=&search=` | HTTP 200: Array of enriched hotel objects | 401, 500 |
| **Hotels** | `GET` | `/api/hotels/:id` | Get single hotel details & rooms | Protected | Any | Param: `id` (ObjectId) | HTTP 200: Hotel object with `rooms[]` | 401, 404 |
| **Hotels** | `POST` | `/api/hotels` | Add new hotel property | Protected | Admin | Hotel document fields | HTTP 201: `{ message, hotel }` | 401, 403 (Forbidden) |
| **Hotels** | `PUT` | `/api/hotels/:id` | Update hotel property details | Protected | Admin | Update fields in body | HTTP 200: `{ message, hotel }` | 401, 403, 404 |
| **Hotels** | `DELETE`| `/api/hotels/:id` | Delete hotel property | Protected | Admin | Param: `id` (ObjectId) | HTTP 200: `{ message }` | 401, 403, 404 |
| **Rooms** | `GET` | `/api/rooms` | Search rooms with date filter | Public | Any | Query: `type, capacity, checkInDate, ...` | HTTP 200: Array of room objects | 500 |
| **Rooms** | `GET` | `/api/rooms/:id` | Get room details with reviews | Public | Any | Param: `id` (ObjectId or catalog ID) | HTTP 200: Room object with `reviews[]` | 404 |
| **Rooms** | `POST` | `/api/rooms` | Create new luxury room | Protected | Admin | Room schema fields | HTTP 201: `{ message, room }` | 400 (Duplicate), 401, 403 |
| **Rooms** | `PUT` | `/api/rooms/:id` | Update room details | Protected | Staff, Admin | Room fields to modify | HTTP 200: `{ message, room }` | 401, 403, 404 |
| **Rooms** | `DELETE`| `/api/rooms/:id` | Delete a room | Protected | Admin | Param: `id` (ObjectId) | HTTP 200: `{ message }` | 401, 403, 404 |
| **Bookings**| `POST` | `/api/bookings` | Create reservation & hold | Protected | Any | `{ roomId, checkInDate, checkOutDate, paymentMethod, ... }` | HTTP 201: `{ booking, checkoutUrl, stripeDetails }` | 400 (Invalid/Overlap), 401 |
| **Bookings**| `GET` | `/api/bookings/my-bookings` | List authenticated user bookings | Protected | Any | None (Bearer token) | HTTP 200: Array of booking objects | 401, 500 |
| **Bookings**| `GET` | `/api/bookings/user/:email`| List bookings for target email | Protected | Self, Staff, Admin | Param: `email` | HTTP 200: Array of booking objects | 401, 403 (Forbidden) |
| **Bookings**| `POST` | `/api/bookings/availability`| Check date range availability | Protected | Any | `{ roomId, checkInDate, checkOutDate }` | HTTP 200: `{ available: boolean, message }` | 400 (Invalid), 401, 404 |
| **Bookings**| `GET` | `/api/bookings` | List all bookings with search | Protected | Staff, Admin | Query: `?status=&search=&page=&limit=` | HTTP 200: Array of booking objects | 401, 403 |
| **Bookings**| `GET` | `/api/bookings/confirmation/:id` | Get verified confirmation state | Protected | Owner, Staff, Admin | Param: `id` | HTTP 200: `{ booking, confirmationState, payment }` | 401, 403, 404 |
| **Bookings**| `GET` | `/api/bookings/:id` | Get single booking & invoice | Protected | Owner, Staff, Admin | Param: `id` | HTTP 200: Booking object with `payment` | 401, 403, 404 |
| **Bookings**| `PUT` | `/api/bookings/:id/status` | Update booking status | Protected | Staff, Admin | `{ status }` | HTTP 200: `{ message, booking }` | 400, 401, 403, 404 |
| **Bookings**| `POST` | `/api/bookings/:id/cancel` | Cancel booking & trigger refund | Protected | Owner, Staff, Admin | `{ reason }` | HTTP 200: `{ message, booking }` | 400 (Already cancelled), 401, 403 |
| **Payments**| `POST` | `/api/payments/checkout` | Create Stripe Checkout Session | Protected | Owner, Staff, Admin | `{ bookingId }` | HTTP 200: `{ checkoutUrl, sessionId, eurAmount }` | 400 (Paid), 401, 403, 503 |
| **Payments**| `POST` | `/api/payments/stripe/verify`| Verify Stripe session & confirm | Protected | Owner, Staff, Admin | `{ bookingId, sessionId }` | HTTP 200: `{ success: true, booking }` | 400 (Unpaid), 401, 403 |
| **Payments**| `POST` | `/api/payments/stripe-webhook`| Handle Stripe webhook events | Public (Stripe) | Stripe signature | Raw JSON byte stream | HTTP 200: `{ received: true }` | 400 (Invalid Sig), 500 |
| **Payments**| `GET` | `/api/payments/invoice/:bookingId` | Generate digital tax invoice | Protected | Owner, Staff, Admin | Param: `bookingId` | HTTP 200: Reconciled invoice JSON | 400, 401, 403, 404 |
| **Payments**| `GET` | `/api/payments/history` | Audit log of all payments | Protected | Admin | Query: `?page=&limit=` | HTTP 200: Array of payment documents | 401, 403 |
| **Staff** | `GET` | `/api/staff/stats` | Operational dashboard KPIs | Protected | Staff, Admin | None | HTTP 200: `{ totalRooms, checkInsToday, ... }` | 401, 403 |
| **Staff** | `POST` | `/api/staff/checkin` | Check in guest & issue keycard | Protected | Staff, Admin | `{ bookingId, keyCardCode, staffName }` | HTTP 200: `{ message, booking, keyCardCode }` | 400 (Already in), 401, 403 |
| **Staff** | `POST` | `/api/staff/checkout` | Check out guest & queue turnover | Protected | Staff, Admin | `{ bookingId, inspectionNotes, extraCharges }` | HTTP 200: `{ message, booking }` | 400, 401, 403 |
| **Staff** | `GET` | `/api/staff/rooms/status` | Real-time housekeeping grid | Protected | Staff, Admin, Guest | None | HTTP 200: Array of all rooms with statuses | 401 |
| **Staff** | `PUT` | `/api/staff/rooms/:id/status`| Update housekeeping status | Protected | Staff, Admin, Guest | `{ status }` | HTTP 200: `{ message, room }` | 400, 401 |
| **Staff** | `GET` | `/api/staff/services` | List guest service tickets | Protected | Any (Guest: self) | Query: `?status=&page=&limit=` | HTTP 200: Array of service ticket objects | 401 |
| **Staff** | `POST` | `/api/staff/services` | Submit guest service ticket | Protected | Any | `{ roomNumber, serviceType, details, priority }` | HTTP 201: `{ message, request }` | 401 |
| **Staff** | `PUT` | `/api/staff/services/:id` | Update service ticket status | Protected | Staff, Admin | `{ status, assignedStaff }` | HTTP 200: `{ message, request }` | 400, 401, 403 |
| **Reviews** | `GET` | `/api/reviews` | List recent reviews | Protected | Any | None | HTTP 200: Array of review objects | 401 |
| **Reviews** | `GET` | `/api/reviews/room/:roomId`| Get reviews for target room | Public | Any | Param: `roomId` | HTTP 200: Array of review objects | 400, 500 |
| **Reviews** | `POST` | `/api/reviews` | Submit guest review & rating | Protected | Any | `{ roomId, rating, comment }` | HTTP 201: `{ message, review }` | 400 (Validation), 401, 404 |
| **Reviews** | `POST` | `/api/reviews/:id/reply` | Staff reply to guest review | Protected | Staff, Admin | `{ staffReply }` | HTTP 200: `{ message, review }` | 400, 401, 403, 404 |
| **Admin** | `GET` | `/api/admin/analytics` | Executive KPI analytics metrics | Protected | Admin | None | HTTP 200: `{ metrics, monthlyRevenue, recentLogs }` | 401, 403 |
| **Admin** | `GET` | `/api/admin/users` | List registered user directory | Protected | Admin | Query: `?role=&page=&limit=` | HTTP 200: Array of sanitized users | 401, 403 |
| **Admin** | `PUT` | `/api/admin/users/:id/role` | Modify user role or tier | Protected | Admin | `{ role, membershipTier }` | HTTP 200: `{ message, user }` | 400, 401, 403, 404 |
| **Admin** | `GET` | `/api/admin/logs` | Retrieve system audit logs | Protected | Admin | None | HTTP 200: Array of admin log records | 401, 403 |
| **Support** | `GET` | `/api/support/faqs` | Instant self-help FAQs | Public | Any | None | HTTP 200: Array of FAQ objects | 500 |
| **Support** | `GET` | `/api/support/contacts` | Concierge contact directory | Public | Any | None | HTTP 200: Contact details object | 500 |
| **Support** | `POST` | `/api/support/ticket` | Submit guest support inquiry | Optional Auth | Any | `{ name, email, subject, description, ... }` | HTTP 201: `{ message, ticketNumber }` | 400, 500 |

---

## Chapter 11: Security and Validation

### 11.1 Implemented Protections Overview
HotelPro enforces multi-layered defense-in-depth across the application:

```
[Incoming Request]
       |
       v
1. HTTP Security Headers (nosniff, DENY frame options, XSS-Protection, Referrer)
       |
       v
2. CORS Whitelist Validation (Allowed development origins + configured domains)
       |
       v
3. Body Limit Parser (2MB max payload limit to mitigate DoS)
       |
       v
4. JWT Authentication (HMAC signature verification with JWT_SECRET)
       |
       v
5. Role-Based Access Control (RBAC middleware matching endpoint requirements)
       |
       v
6. Resource Ownership Verification (Guest restricted strictly to own records)
       |
       v
7. Concurrency Lock (withRoomLock in-process Promise mutex per room ID)
       |
       v
8. Server-Side Data Validation & Authoritative Tariff Calculation
       |
       v
9. Gateway Cryptographic Verification (HMAC-SHA256 Stripe signatures)
       |
       v
[Executed Business Action & Audit Log Persistence]
```

### 11.2 Verification of Specific Protections
1. **Password Security:** Passwords undergo one-way salting and hashing via `bcryptjs` using 10 rounds. Cleartext passwords are never persisted or returned in API responses (`select('-password')`).
2. **Role Escalation Defense:** During public registration (`POST /api/auth/register`), the `role` field in the client request body is completely ignored and hardcoded to `'Guest'`, preventing malicious privilege escalation.
3. **Server-Side Tariff Enforcement:** The booking controller queries the authoritative nightly rate from MongoDB using `Room.findById(roomId)`. It rejects client-supplied rates, preventing price tampering.
4. **Double-Booking Race Condition Prevention:** The backend implements an in-process serialized Promise mutex lock (`withRoomLock`) keyed by room ID. Concurrent booking requests on the same room are executed sequentially, guaranteeing that overlapping reservations are reliably blocked.
5. **Stripe Webhook Signature Verification:** Webhook endpoints utilize raw body parsing (`express.raw({ type: 'application/json' })`) and invoke `stripe.webhooks.constructEvent(req.body, signature, webhookSecret)`. Forged or modified webhook payloads are rejected with HTTP 400.
6. **Object-Level Authorization (IDOR Defense):** Endpoints accessing individual bookings or invoices (`/api/bookings/:id`, `/api/payments/invoice/:id`, `/api/bookings/:id/cancel`) compare `booking.userEmail.toLowerCase()` with `req.user.email.toLowerCase()`. Unauthorized guests are rejected with HTTP 403 Forbidden.
7. **CORS Policy Enforcement:** Requests containing an `Origin` header not explicitly listed in `approvedDevOrigins` or `process.env.ALLOWED_ORIGINS` are rejected with HTTP 403.
8. **Sensitive Configuration Safeguards:** Environment variables (`JWT_SECRET`, `STRIPE_SECRET_KEY`, `MONGO_URI`) are strictly loaded on the server and are never bundled into frontend builds.

---

## Chapter 12: Testing and Verification

### 12.1 Automated Test Suite Architecture
HotelPro includes an automated integration test suite located in `Backend/test/api.test.js`. Built using Node.js and Supertest, the test suite executes **66 comprehensive integration tests** covering every critical security boundary, business logic flow, and edge case.

The test suite can be executed with:
```bash
cd Backend
npm test
```

### 12.2 Test Coverage Breakdown

| Phase / Category | Test Numbers | Scenarios Tested |
|---|:---:|---|
| **1. Authentication & Security Gate** | Tests 1–8 | Role escalation prevention (forged role forced to Guest), legitimate registration, duplicate email rejection, short password rejection, successful login, incorrect password rejection, profile access via JWT, and unauthenticated request rejection. |
| **2. Role-Based Access Control (RBAC)** | Tests 9–12 | Guest blocked from admin analytics (403), Guest blocked from admin users (403), Guest blocked from staff stats (403), and Admin successfully accesses analytics with metrics payload. |
| **3. Booking Business Logic & Availability** | Tests 13–18 | Unauthenticated booking rejected (401), server-enforced pricing (client rate ignored), overlapping reservation blocked (400), intruder blocked from viewing other bookings (403), intruder blocked from cancelling other bookings (403), and owner successfully cancels booking. |
| **4. Notifications & Reviews Security** | Tests 19–20 | Notifications isolated to authenticated recipient, and authenticated review submission with 1–5 star validation. |
| **5. Availability Engine & Route Protection** | Tests 21–24 | Public room listing accessible without auth, authenticated room listing returns array, date-range filtering excludes booked rooms, and `/api/bookings/my-bookings` returns user bookings. |
| **6. Payment Integrity & CORS** | Tests 25–29 | Pay at Hotel Desk creates unpaid pending reservation, intruder blocked from payment checkout/process/invoice (403), duplicate payment on paid booking rejected (400), simulated card payments rejected (400), and CORS origin policy rejects unapproved domains. |
| **7. Payment Verification & Confirmation** | Tests 30–36 | Order creation with dummy keys safely handled, server calculates INR amount accurately, valid payment signature verified, tampered signature rejected (400), duplicate order on paid booking rejected (400), intruder blocked from payment endpoints (403), and confirmation endpoint returns verified state to owner. |
| **8. End-to-End Guest Journey** | Tests 37–40 | Complete guest journey (Register → Login → Search → Book → Verify → My Bookings → Tax Invoice), Pay at Hotel Desk collection notice, payment failure records failure without cancelling and permits retry, and duplicate webhook handled idempotently. |
| **9. Destination Filtering & Regression** | Tests 41–51 | Destination searches return suites (Jaipur, Udaipur, Shimla, Kerala, Varanasi, Goa), curated stay filtering (Presidential, Penthouse), property dropdown filtering, booking heritage suites, intruder blocked from verification, stored order ID mismatch rejected, valid signature marks booking Paid, and duplicate payment rejected. |
| **10. Booking Hold Expiry & Retries** | Tests 52–60 | Online booking sets future `holdExpiresAt` (15m), active pending hold blocks another guest, payment failure permits retry, same user retrying reuses pending booking, expired hold does NOT block other guests, second guest successfully books after expiry, Pay at Hotel Desk has `holdExpiresAt: null`, desk booking blocks other guests, and adjacent non-overlapping dates are allowed. |
| **11. Stripe EUR Currency Conversion** | Tests 61–66 | Currency converter returns positive EUR rate (110), exact conversion calculation (€200.00 for ₹22,000), fractional conversion and cent rounding (€422.55 for ₹46,480), Stripe booking sets paymentMethod and hold, Stripe checkout handles keys or graceful 503, and invoice line items mathematically reconcile to charged EUR amount. |

### 12.3 Manual Testing Checklist

| Test Scenario | Action / Input | Expected Outcome | Verification Status |
|---|---|---|:---:|
| **Public Registration** | Register with `role: 'Admin'` in payload | User created with `role: 'Guest'`; token issued | Verified |
| **Invalid Login** | Enter registered email with incorrect password | HTTP 401 Unauthorized; clear error message | Verified |
| **Protected Route Access** | Access `/admin` in browser as Guest | Redirected to `/dashboard` by `ProtectedRoute` | Verified |
| **Date Range Overlap** | Book Room 101 for Dec 10–13, then try Dec 11–14 | First succeeds; second returns 400 "already reserved" | Verified |
| **Adjacent Dates Booking** | Book Room 101 for Dec 10–13, then try Dec 13–15 | Both succeed (checkIn = previous checkOut permitted) | Verified |
| **Stripe Checkout Creation** | Book suite with Stripe payment method | Returns Stripe hosted URL in EUR; booking held for 15m | Verified |
| **15-Minute Hold Expiry** | Leave Stripe checkout pending for >15 minutes | Suite returns to available inventory for other guests | Verified |
| **Hold Retry Reuse** | Click "Pay Now" on pending hold within 15 min | Reuses existing booking; generates fresh session URL | Verified |
| **Pay at Hotel Desk** | Book suite with Pay at Hotel Desk option | Booking confirmed pending; hold has no expiration | Verified |
| **Invoice Line Item Match** | View invoice for €1,571.72 booking | Line items (€467.77 × 3) + 12% tax + €0.01 = €1,571.72 | Verified |
| **Keycard Check-In** | Staff checks in guest with reference number | Booking marked Checked-In; room Occupied; keycard issued | Verified |
| **Housekeeping Turnover** | Staff checks out guest | Room marked Cleaning; urgent turnover ticket created | Verified |
| **Review Rating Update** | Submit 5-star review on suite | Room average rating and review count recalculate | Verified |
| **Admin KPI Updates** | Complete booking payment | Total revenue increases by payment amount immediately | Verified |

---

## Chapter 13: Installation and Execution

### 13.1 System Prerequisites
- **Node.js:** v18.0.0 or higher (v24.14.0 recommended).
- **MongoDB:** v6.0 or higher running locally on `localhost:27017` or accessible via MongoDB Atlas URI.
- **npm:** v9.0.0 or higher.
- **Modern Web Browser:** Chrome, Edge, Firefox, or Safari.

### 13.2 Backend Installation & Configuration
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd HotelPro-Capstone/Backend
   npm install
   ```
2. Create a `.env` file in `Backend/` based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hotelpro
   JWT_SECRET=hotelpro_super_secure_jwt_secret_token_key_capstone_2026
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   FRONTEND_URL=http://localhost:5173

   # Stripe Configuration (Safe Placeholders - provide live test keys for online payments)
   STRIPE_SECRET_KEY=sk_test_replace_with_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_replace_with_your_stripe_webhook_secret

   # Currency Conversion Configuration
   EUR_TO_INR_RATE=110
   USD_TO_INR_RATE=83
   BOOKING_HOLD_EXPIRY_MINUTES=15
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000`. If the database is empty, the server automatically seeds luxury hotels, suites, demo users, and bookings on startup.*

### 13.3 Frontend Installation & Configuration
1. Open a second terminal and navigate to the `FrontEnd` directory:
   ```bash
   cd HotelPro-Capstone/FrontEnd
   npm install
   ```
2. Create a `.env` file in `FrontEnd/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
3. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

### 13.4 Demo Credentials for Evaluation

| Role | Email Address | Password | Intended Workflow |
|---|---|---|---|
| **Guest** | `guest@hotelpro.com` | `password123` | Suite browsing, booking, Stripe EUR checkout, invoices, reviews |
| **Staff** | `staff@hotelpro.com` | `password123` | Front desk stats, keycard check-in, check-out, housekeeping grid |
| **Admin** | `admin@hotelpro.com` | `password123` | Executive KPI analytics, user role editor, room management, audit logs |

---

## Chapter 14: Limitations and Future Enhancements

### 14.1 Known Implementation Limitations
- **Stripe Webhook Local Testing:** In local development without a public HTTPS tunnel (such as ngrok or Stripe CLI `stripe listen`), Stripe cannot deliver asynchronous webhook events directly to `localhost:5000`. The application mitigates this via its synchronous redirect verification endpoint (`/api/payments/stripe/verify`).
- **Static Exchange Rates:** Currency conversion rates (`EUR_TO_INR_RATE: 110`, `USD_TO_INR_RATE: 83`) are configured statically via environment variables rather than fetched dynamically from a live forex API feed.
- **Single-Instance Mutex Lock:** The in-process Promise mutex lock (`withRoomLock`) reliably prevents race conditions on a single Node.js process. In a distributed multi-instance deployment behind a load balancer, this would require a distributed lock manager such as Redis Redlock.
- **Console-Based Email Delivery:** Transactional emails (confirmations, check-in keycards) are formatted and dispatched through `emailService.js`, which logs output to the console and simulates delivery rather than transmitting through an external SMTP provider.

### 14.2 Potential Future Enhancements
- **Dynamic Forex API Integration:** Connect the currency converter to an external exchange rate provider (e.g., Open Exchange Rates) with hourly caching.
- **Distributed Concurrency Control:** Implement Redis-based distributed locking for horizontal scalability across multiple server instances.
- **IoT Smart Lock Integration:** Connect the digital keycard code generation system to IoT door locks via ASSA ABLOY or Salto hospitality APIs.
- **Multi-Property Group Accounts:** Expand administrative capabilities to manage multiple distinct hotel chains under separate organizational tenants.
- **Guest Loyalty Points Engine:** Implement an automated points accumulation and redemption engine based on the guest's membership tier (`Silver`, `Gold Elite`, `Platinum VIP`).

---

## Chapter 15: Conclusion

The **HotelPro** hospitality management platform represents a comprehensive, professionally engineered solution to modern hotel booking and operational management. By coupling an aesthetically rich, responsive React 19 frontend with a robust, security-hardened Express 5 and MongoDB backend, HotelPro bridges the divide between guest-facing digital convenience and back-of-house operational efficiency.

Key achievements of the project include:
- A deterministic concurrency engine that eliminates double-booking race conditions during high-demand reservation windows.
- Strict server-authoritative tariff calculations that protect revenue against client-side tampering.
- A configurable 15-minute pending hold engine that balances guest checkout flexibility with automated inventory release.
- A cross-border payment pipeline that converts tariffs from Indian Rupees to Euros (€, EUR) with mathematical precision down to the exact euro cent, supported by cryptographic webhook validation and digital tax invoice reconciliation.
- Comprehensive role-based access control protecting operational and executive features across Guests, Staff, and Administrators.
- A complete automated test suite comprising 66 integration tests verifying every security boundary and business rule.

HotelPro demonstrates the practical application of modern software engineering principles, secure coding standards, and full-stack web architecture in an enterprise hospitality domain.

---

## Appendices

### Appendix A: Project Directory Structure

```
HotelPro-Capstone/
|-- Backend/
|   |-- controllers/
|   |   `-- stripeWebhook.js          # Stripe webhook signature verification & fulfillment
|   |-- middleware/
|   |   `-- auth.js                   # JWT protect and RBAC authorize middlewares
|   |-- models/
|   |   |-- AdminLog.js               # System audit log schema
|   |   |-- Booking.js                # Core reservation schema with hold logic
|   |   |-- CheckInOut.js             # Guest check-in/out and keycard schema
|   |   |-- Hotel.js                  # Resort and property schema
|   |   |-- Notification.js           # Role and user notification schema
|   |   |-- Payment.js                # Financial audit record schema
|   |   |-- Review.js                 # Guest ratings and feedback schema
|   |   |-- Room.js                   # Suite schema with pricing and status
|   |   |-- ServiceRequest.js         # Guest service and housekeeping tickets
|   |   `-- User.js                   # User account schema with roles and tiers
|   |-- routes/
|   |   |-- adminRoutes.js            # Executive analytics and user management
|   |   |-- authRoutes.js             # Registration, login, profile endpoints
|   |   |-- bookingRoutes.js          # Reservation creation, availability, cancellations
|   |   |-- hotelRoutes.js            # Hotel catalog endpoints
|   |   |-- notificationRoutes.js     # User notification endpoints
|   |   |-- paymentRoutes.js          # Stripe checkout, verification, invoices
|   |   |-- reviewRoutes.js           # Review submission and staff replies
|   |   |-- roomRoutes.js             # Room discovery, filtering, CRUD
|   |   |-- staffRoutes.js            # Check-in, check-out, housekeeping grid
|   |   `-- supportRoutes.js          # Self-help FAQs and support tickets
|   |-- test/
|   |   `-- api.test.js               # 66 automated integration tests
|   |-- utils/
|   |   |-- bookingAvailability.js    # In-process mutex locks & hold math
|   |   |-- currencyConverter.js      # INR to EUR conversion and cent rounding
|   |   |-- emailService.js           # Transactional email dispatcher
|   |   |-- heritageHotelsData.js     # In-memory heritage suite catalog
|   |   |-- paymentMethod.js          # Payment method normalizer
|   |   |-- seedData.js               # Database seeding script
|   |   |-- stripeCheckout.js         # Stripe session builder
|   |   `-- stripeClient.js           # Stripe SDK initialization
|   |-- .env.example                  # Backend environment template
|   |-- package.json                  # Express dependencies and scripts
|   `-- server.js                     # Server entrypoint and middleware assembly
|
|-- FrontEnd/
|   |-- src/
|   |   |-- api/
|   |   |   `-- axiosClient.js        # Axios instance with Bearer interceptor
|   |   |-- components/
|   |   |   |-- BookingPaymentModal.jsx # Reservation checkout modal
|   |   |   |-- Footer.jsx            # Global footer with destination links
|   |   |   |-- Icons.jsx             # SVG icons
|   |   |   |-- InvoiceModal.jsx      # Printable digital tax invoice modal
|   |   |   |-- Navbar.jsx            # Responsive navigation bar
|   |   |   |-- ProtectedRoute.jsx    # Role-based route guard
|   |   |   |-- RoomDetailsModal.jsx  # Suite details and review display
|   |   |   `-- SupportModal.jsx      # 24/7 concierge support desk modal
|   |   |-- context/
|   |   |   `-- SupportContext.jsx    # Support modal state provider
|   |   |-- pages/
|   |   |   |-- AdminDashboard.jsx    # Admin center view
|   |   |   |-- BookingConfirmation.jsx # Post-booking confirmation view
|   |   |   |-- Home.jsx              # Landing page and destination showcase
|   |   |   |-- Login.jsx             # Guest and staff login view
|   |   |   |-- MyBookings.jsx        # Booking history and Stripe outcome handler
|   |   |   |-- Register.jsx          # Public registration view
|   |   |   |-- Rooms.jsx             # Suite discovery and search view
|   |   |   |-- StaffDashboard.jsx    # Staff operations view
|   |   |   `-- UnifiedDashboard.jsx  # Multi-persona operations portal
|   |   |-- App.jsx                   # Route registration and layout assembly
|   |   |-- index.css                 # 20KB bespoke luxury design system
|   |   `-- main.jsx                  # React DOM entrypoint
|   |-- .env.example                  # Frontend environment template
|   |-- index.html                    # HTML shell
|   |-- package.json                  # React and Vite dependencies
|   `-- vite.config.js                # Vite build configuration
|
`-- documentation/
    |-- diagrams/
    |   |-- architecture.mmd          # System architecture diagram
    |   |-- er_diagram.mmd            # Entity relationship diagram
    |   |-- guest_booking_flow.mmd    # Guest booking workflow diagram
    |   |-- mvc_lifecycle.mmd         # MVC sequence diagram
    |   |-- staff_admin_flow.mmd      # Staff and admin workflow diagram
    |   `-- stripe_eur_flow.mmd       # Stripe EUR payment workflow diagram
    |-- HotelPro_Technical_Documentation.md # Master technical documentation
    |-- HotelPro_Technical_Documentation.docx # Editable Word document
    |-- HotelPro_Technical_Documentation.pdf  # Final PDF document
    `-- README.md                     # Documentation overview
```

### Appendix B: Glossary of Technical Terms
- **JWT (JSON Web Token):** A compact, URL-safe means of representing claims between two parties, used in HotelPro for stateless authentication.
- **RBAC (Role-Based Access Control):** Security paradigm restricting access to authorized users based on defined roles (`Guest`, `Staff`, `Admin`).
- **Mutex (Mutual Exclusion):** A synchronization mechanism preventing concurrent threads or asynchronous callbacks from accessing a shared resource simultaneously. HotelPro uses an in-process Promise mutex per room ID.
- **Hold Expiration (`holdExpiresAt`):** A timestamp field defining when an unpaid reservation hold expires (15 minutes after creation), preventing abandoned carts from permanently locking inventory.
- **Half-Open Date Interval:** Mathematical approach to date range overlap detection (`startA < endB && endA > startB`) that permits check-in on the exact date of a previous guest's check-out.
- **Smallest Currency Unit:** The integer representation of a currency required by payment processors. In Euros, €1.00 equals 100 euro cents.
- **Rounding Adjustment:** A line-item accounting entry that reconciles sub-cent floating-point differences between individual room subtotal/tax line items and the total amount charged by a payment gateway.
- **HMAC-SHA256:** Hash-based Message Authentication Code utilizing SHA-256 cryptographic hashing, used by Stripe to sign webhook events and prevent replay/tampering attacks.
- **Upsert:** A database operation that updates an existing document if found or inserts a new document if not found (`findOneAndUpdate` with `upsert: true`).

---

*End of Technical Documentation — HotelPro Hospitality Management System*
