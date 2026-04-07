# Document Lifecycle Management Agent using Generative AI

## 🚀 Overview

This project implements an autonomous agent designed to manage the complete lifecycle of business documents (e.g., invoices, contracts, receipts) with minimal human intervention. By integrating **Intelligent Document Processing (IDP)**, **BPMN Workflow Orchestration**, and **Retrieval-Augmented Generation (RAG)**, the system ensures high data accuracy, rapid cycle times, and robust compliance.

The solution automates everything from ingestion and OCR-based data extraction to policy-grounded approval workflows and eventual archiving, providing a seamless "Human-in-the-loop" experience.

---

## ✨ Key Features

- **Autonomous Orchestration**: Powered by **Camunda 8 (Zeebe)**, workflows are dynamically routed based on extraction confidence and business logic.
- **Intelligent Extraction (IDP)**: Uses **AWS Textract** for advanced OCR, extracting Key-Value pairs, tables, and raw text with granular confidence scoring.
- **RAG-Enabled Repository**: Automatically generates embeddings for uploaded documents, allowing for policy-grounded AI summaries and natural language queries.
- **Granular RBAC**: Role-based dashboards for **Uploaders**, **Reviewers**, **Approvers**, and **Admins**.
- **Immutable Audit Trail**: Tracks every state transition and user interaction in a detailed `DocumentLifecycle` log.
- **Digital Signatures**: Built-in support for digital signing during the approval phase.
- **System Integrity**: Includes soft-delete (Bin) and permanent purge functionality with automated S3 and database cleanup.

---

## 🛠️ Technology Stack

### Backend (Python/FastAPI)

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) for high-performance async APIs.
- **Orchestration**: [Camunda 8 (Zeebe)](https://camunda.com/products/camunda-8/) for BPMN 2.0 workflow execution.
- **IDP/OCR**: [AWS Textract](https://aws.amazon.com/textract/) & [Boto3](https://aws.amazon.com/sdk-for-python/).
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) ORM and [Alembic](https://alembic.sqlalchemy.org/) for migrations.
- **Task Scheduling**: [APScheduler](https://apscheduler.readthedocs.io/) for background maintenance and polling.
- **AI/LLM**: Groq LLM for summarization and Sentence Transformers for RAG embeddings.

### Frontend (React/Vite)

- **Build Tool**: [Vite](https://vitejs.dev/) for a lightning-fast dev experience.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive, modern UI.
- **Icons & Motion**: [Lucide React](https://lucide.dev/) and [Framer Motion](https://www.framer.com/motion/) for interactive micro-animations.
- **Routing**: Custom React-based router with RBAC path protection.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User/Client)) -->|Upload| API[FastAPI Backend]
    API -->|Start Instance| Zeebe[Camunda 8 Zeebe]

    subgraph "Worker Layer"
        Zeebe -->|Task: Extract| W1[Textract Worker]
        Zeebe -->|Task: Archive| W2[Archive Worker]
    end

    W1 -->|OCR Results| S3[(AWS S3)]
    W1 -->|DB Records| DB[(PostgreSQL)]
    W1 -->|Embeddings| VS[(Vector Store)]

    API -->|RAG Query| VS

    subgraph "Frontend Roles"
        U[Uploader]
        R[Reviewer]
        A[Approver]
        AD[Admin]
    end

    User --- Frontend
    Frontend --- U & R & A & AD
```

---

## 🚦 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL Instance
- AWS Account (S3 & Textract access)
- Camunda 8 (SaaS or Self-Managed)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env` file (see `.env.example` if available):
   ```env
   DATABASE_URL=postgresql://user:pass@localhost/dbname
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=ap-south-1
   ZEEBE_ADDRESS=your_camunda_address
   ```
4. Run migrations/initialization:
   ```bash
   python create_tables.py
   ```
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 📖 API Documentation

Once the backend is running, you can access the interactive API docs at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core Endpoints

- `POST /api/v1/uploader/upload`: Ingest documents and trigger workflows.
- `GET /api/v1/documents`: List documents with category and status filters.
- `PUT /api/v1/documents/{id}/update-fields`: Reviewer data correction.
- `POST /api/v1/reviewer/approve`: Transition document to approval stage.
- `POST /api/v1/approver/approve`: Final approval and digital signature.

---

## 🛡️ Governance & Compliance

- **Audit Logs**: Every action is timestamped and attributed to a user role.
- **Soft Deletion**: Documents moved to the Bin are retained before permanent purging.
- **S3 Integrity**: Automatic syncing between database deletion and S3 object removal.
- **RBAC**: dashboard access is strictly enforced based on local storage mock-auth (extendable to OAuth2/JWT).

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
