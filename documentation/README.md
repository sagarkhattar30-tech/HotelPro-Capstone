# HotelPro — Technical Documentation Suite

This directory contains the complete, submission-ready technical documentation for the **HotelPro** hospitality booking and management platform. All documents are generated directly from the active codebase, database schemas, API routes, middleware, and automated test suite.

---

## Generated Documentation Files

| File | Format | Purpose & Description |
|---|:---:|---|
| [HotelPro_Technical_Documentation.docx](file:///d:/HotelPro-Capstone/documentation/HotelPro_Technical_Documentation.docx) | Word Document (`.docx`) | Fully styled, editable Word document with formal cover page, table of contents, headers, footers, page numbering, colored tables, and typography. |
| [HotelPro_Technical_Documentation.pdf](file:///d:/HotelPro-Capstone/documentation/HotelPro_Technical_Documentation.pdf) | PDF (`.pdf`) | Submission-ready PDF version generated via native Microsoft Word COM automation, preserving exact formatting, pagination, and layout. |
| [HotelPro_Technical_Documentation.md](file:///d:/HotelPro-Capstone/documentation/HotelPro_Technical_Documentation.md) | Markdown (`.md`) | Master markdown source containing all 15 chapters, appendices, code examples, and mathematical walkthroughs. |
| [README.md](file:///d:/HotelPro-Capstone/documentation/README.md) | Markdown (`.md`) | Index and guide to all documentation assets. |

---

## Architectural & Process Diagrams

Source Mermaid diagrams are stored in the `diagrams/` subfolder:

| Diagram File | Type | Description |
|---|:---:|---|
| [architecture.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/architecture.mmd) | Architecture | Multi-tier system architecture: Presentation (React 19 + Vite), Security Perimeter, Application (Express 5), Business Services, Persistence (MongoDB), and Stripe Gateway. |
| [er_diagram.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/er_diagram.mmd) | Entity-Relationship | Database schemas, fields, primary/foreign keys, and cardinalities across all 10 Mongoose models. |
| [mvc_lifecycle.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/mvc_lifecycle.mmd) | Sequence Diagram | End-to-end request lifecycle: React View → Axios → Auth Middleware → Mutex Lock → Availability Math → Stripe API → Persistence → Response. |
| [guest_booking_flow.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/guest_booking_flow.mmd) | Flowchart | Guest discovery, search date filtering, modal checkout, and dual payment path (Stripe EUR vs Pay at Hotel Desk). |
| [stripe_eur_flow.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/stripe_eur_flow.mmd) | Flowchart | Complete Stripe EUR payment lifecycle: Tariff calculation, INR-to-EUR conversion (€1 ≈ ₹110), euro cents creation, dual-path verification (webhook + redirect), and invoice reconciliation. |
| [staff_admin_flow.mmd](file:///d:/HotelPro-Capstone/documentation/diagrams/staff_admin_flow.mmd) | Flowchart | Front desk check-in (keycard generation), check-out (housekeeping turnover), room status grid, and administrative KPI analytics. |

---

## Documentation Structure & Chapters

1. **Chapter 1: Introduction** — Abstract, problem statement, objectives, scope, intended users, functional and non-functional requirements.
2. **Chapter 2: Technology Stack and Tools** — React 19, Vite 8, React Router 7, Axios, Vanilla CSS, Node.js 24, Express 5, MongoDB, Mongoose 9, JWT, bcryptjs, Stripe SDK, and Supertest.
3. **Chapter 3: System Architecture** — Presentation tier, security perimeter, application services, database layer, and Stripe integration.
4. **Chapter 4: ER Diagram and Database Design** — Specifications for all 10 Mongoose schemas, compound indexes, model methods, and in-memory heritage suites catalog.
5. **Chapter 5: MVC Pattern and Request Lifecycle** — Decoupled SPA+API adaptation of MVC, file mappings, and sequence lifecycle walkthrough.
6. **Chapter 6: Features and Modules** — Detailed matrix of all verified features, role access, frontend files, backend routes, models, and status.
7. **Chapter 7: Roles and Responsibilities** — Guest, Staff, and Admin permissions matrix, middleware verification, and route guards.
8. **Chapter 8: Complete User Flows** — Step-by-step flows and Mermaid diagrams for Registration, Booking, Stripe EUR Payment, Successful Verification, Cancellation, Invoices, and Staff/Admin operations.
9. **Chapter 9: Payment Gateway and Currency Conversion** — Detailed Stripe EUR checkout specification, canonical INR calculation, EUR conversion (€1 ≈ ₹110), smallest-unit euro cents calculation, invoice line-item reconciliation, and worked numerical example.
10. **Chapter 10: API Documentation** — Comprehensive API reference table across all 10 route modules with methods, paths, authorization, parameters, and responses.
11. **Chapter 11: Security and Validation** — Bcrypt hashing, JWT validation, role escalation defense, server-side tariff calculation, mutex double-booking locking, Stripe webhook signature verification, and CORS.
12. **Chapter 12: Testing and Verification** — Automated test suite with 66 tests, Supertest execution, and manual testing checklists.
13. **Chapter 13: Installation and Execution** — Prerequisites, backend and frontend setup, environment variable templates, start commands, and demo evaluation credentials.
14. **Chapter 14: Limitations and Future Enhancements** — Genuinely identified constraints and roadmap for future iterations.
15. **Chapter 15: Conclusion** — Architectural summary and project evaluation.
16. **Appendices** — Directory structure, glossary of technical terms, and reference tables.

---

*HotelPro Hospitality Management System — Technical Documentation Suite*
