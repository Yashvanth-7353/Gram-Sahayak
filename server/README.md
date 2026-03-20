# Gram Sahayak — Backend

FastAPI-based REST API powering the Gram Sahayak village governance platform.

## Tech Stack

- **FastAPI** — High-performance async Python web framework
- **Motor** — Async MongoDB driver for Python
- **MongoDB Atlas** — Cloud-hosted NoSQL database
- **AWS S3** — File storage for complaint attachments and project images
- **Pydantic** — Data validation and serialization
- **JWT** — Token-based authentication

## API Overview

| Router                     | Prefix            | Description                              |
| -------------------------- | ----------------- | ---------------------------------------- |
| `auth.py`                  | `/auth`           | Login, signup, token generation           |
| `users.py`                 | `/users`          | User profile management                  |
| `projects.py`              | `/projects`       | Infrastructure project CRUD & status      |
| `complaints.py`            | `/complaints`     | Grievance filing, resolution, escalation  |
| `community.py`             | `/community`      | Discussion forum posts and comments       |
| `dashboard.py`             | `/dashboard`      | Aggregated stats for dashboards           |
| `schemes.py`               | `/schemes`        | Government scheme listings                |
| `proposals.py`             | `/proposals`      | Contractor project proposals              |
| `official_contractor_chat` | `/chat`           | Real-time messaging between roles         |

## Getting Started

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
SECRET_KEY=your-jwt-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket
```

## Running the Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API documentation is auto-generated at `http://localhost:8000/docs` (Swagger UI).
