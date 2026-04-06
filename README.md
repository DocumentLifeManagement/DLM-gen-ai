# Document Lifecycle Management Agent using Generative AI


## Overview


This project implements an autonomous agent designed to manage the complete lifecycle of business documents, such as invoices and contracts, with minimal human intervention. The solution integrates Intelligent Document Processing (IDP) for data extraction, a BPMN engine for workflow orchestration, and Retrieval-Augmented Generation (RAG) for policy-grounded AI document content. The primary aim is to reduce cycle times, improve data accuracy, and ensure auditability and compliance across the document lifecycle—from ingestion through approval to archiving.

The system integrates OCR-based Intelligent Document Processing with confidence-driven validation, a Retrieval-Augmented Generation pipeline for policy-grounded document creation, and BPMN 2.0 workflow orchestration to autonomously manage the complete document lifecycle with RBAC, audit logging, and compliance enforcement.

## Features

- **Automated Ingestion:** Supports email, API, and manual uploads for documents.
- **Intelligent Data Extraction:** OCR and NLP-based field recognition with multi-language support and confidence scoring. Human-in-the-loop correction for low-confidence data.
- **Document Generation:** Produces compliant DOCX, HTML, and PDF files using templates and RAG-powered AI for dynamic content grounded in internal policies.
- **BPMN-Orchestrated Workflows:** Flexible, auditable workflows for approvals, escalations, and exception handling.
- **Governance & Compliance:** Implements Role-Based Access Control (RBAC), retention policies, versioning, and immutable audit trails.
- **System Integration:** Connects to ERP/CRM platforms and document repositories for end-to-end automation.

## Technology Stack

- **Workflow/Orchestration:** BPMN 2.0 engine (e.g., Camunda 8)
- **IDP:** OCR engine (Tesseract or Google Vision), NLP libraries (spaCy, transformers)
- **Document Generation:** docxtpl for DOCX, Jinja2 for HTML, ReportLab for PDFs
- **Retrieval-Augmented Generation:** Pinecone or FAISS for vector database, OpenAI/Gemini LLM APIs
- **Governance:** Keycloak or Camunda for RBAC & audit logs
- **Frontend:** ReactJS
- **APIs:** FastAPI
- **Storage:** PostgreSQL, AWS S3/Azure Blob
- **Testing:** Pytest/unittest (backend), Cypress/Jest (frontend)

## System Architecture

```
Ingestion Layer --> IDP Layer --> Generation Layer
                           |             |
                BPMN Orchestration Layer
                           |
                    Governance Layer
```

- **Ingestion:** Receives documents via UI, email, or API.
- **IDP:** Classifies & extracts data with confidence scoring and triggers human validation as needed.
- **Generation:** Produces document output grounded in company policy using RAG.
- **Orchestration:** Routes workflows, manages human tasks, enforces business rules, and integrates with external systems.
- **Governance:** Security, RBAC, audit trails, retention, versioning.[1][2][3]

## Quick Setup

1. **Clone the Repository:**
   ```
   git clone <repository-url>
   ```
2. **Install Project Dependencies:**
   - Backend: `cd backend/` and run `pip install -r requirements.txt`
   - Frontend: `cd frontend/` and run `npm install`
3. **Set Up Environment Variables:**
   - Add API keys and database credentials to `.env` as needed.
4. **Run Database Migrations:**
   - For PostgreSQL, use migration tools (e.g., Alembic, Django ORM).
5. **Launch Services:**
   - Backend: `python app.py` (or relevant start command)
   - Frontend: `npm start` (in command prompt)
   - Workflow Engine and Supporting Services as per documentation.

## Running Tests

- **Backend:** `pytest`
- **Frontend:** `npm test`
- **End-to-End:** Use provided sample datasets and test scripts.[2]

## Contributing

- Open issues for bugs or enhancements.
- Fork the repo and submit pull requests for review.
- Follow code style and documentation guidelines (see `CONTRIBUTING.md` if present).[1][2]

## Project Timeline & Milestones

- Week 1-2: Requirements & Modeling (DFD/BPMN)
- Week 3-5: IDP Pipeline Protoype
- Week 4-6: Template Generation, RAG Setup
- Week 6-8: BPMN Approval Flows, First Integration
- Week 8-10: Governance Features (RBAC, audit, retention)
- Week 10-14: Testing, Documentation, UAT & Release[3][2][1]

## License

This project is licensed under the MIT License.

**For further details, please refer to the project documents and architecture diagrams included with the repository.**[2][3][1]

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_94140303-bb4a-4426-87da-cb24a2b434c7/5d1e8e99-792a-4c84-8a84-489b2f64ae9d/Project-Synopsis.docx)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_94140303-bb4a-4426-87da-cb24a2b434c7/4a974c39-bb24-4224-b141-d2dbc2ac4727/Project-Report.pdf)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_94140303-bb4a-4426-87da-cb24a2b434c7/e9685f82-9f3d-42d2-bd81-9de71e71a23a/project-review-2-ppt.pptx)

