# Gram Sahayak

**A smart village governance platform** that bridges the communication gap between villagers, government officials, and contractors — enabling transparent project management, grievance redressal, and community collaboration.

> 🏆 Full-stack application with role-based dashboards, real-time chat, AI-powered community insights, and geospatial route verification.

---

## Features

- **Role-Based Dashboards** — Separate views for Villagers, Government Officials, and Contractors
- **Grievance Redressal** — Villagers raise complaints with photo/PDF evidence; officials resolve with proof
- **Project Lifecycle Management** — Track infrastructure projects from allocation → completion with milestone verification
- **Route Verification** — Geospatial route mapping with OSRM integration and on-site GPS verification
- **Official–Contractor Chat** — Real-time messaging between officials and contractors
- **Community Forum** — Village discussion board with AI-powered sentiment analysis
- **Bilingual Support** — English and Kannada (ಕನ್ನಡ) language toggle
- **PDF Report Generation** — Download official complaint resolution reports
- **Automatic Escalation** — Unresolved complaints auto-escalate after 15 days

---

## Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Leaflet, Lucide |
| **Backend**  | FastAPI, Python, Motor (async MongoDB driver)                 |
| **Database** | MongoDB Atlas                                                 |
| **Storage**  | AWS S3 (file uploads)                                         |
| **AI/ML**    | LLM integration for community sentiment analysis              |
| **Deploy**   | Vercel (frontend), Cloud-hosted (backend)                     |

---

## Folder Structure

```
gram-sahayak/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets (logo, hero GIF)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── RouteVerifier.jsx
│   │   │   ├── ComplaintDetailsModal.jsx
│   │   │   ├── ProjectDetailsModal.jsx
│   │   │   └── SchemeDetailsModal.jsx
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VillageDashboard.jsx
│   │   │   ├── ContractorDashboard.jsx
│   │   │   ├── OfficialDashboard.jsx
│   │   │   ├── Complaints.jsx
│   │   │   ├── OfficialComplaints.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── OfficialCommunityAI.jsx
│   │   │   ├── ContractorConnect.jsx
│   │   │   └── ...
│   │   ├── context/            # React context providers
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Root component with routing
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── server/                     # FastAPI backend
    └── backend/
        ├── app/
        │   ├── main.py         # FastAPI app entry point
        │   ├── config.py       # Environment configuration
        │   ├── database.py     # MongoDB connection
        │   ├── schemas.py      # Pydantic data models
        │   ├── security.py     # Authentication utilities
        │   ├── routers/        # API route handlers
        │   │   ├── auth.py
        │   │   ├── community.py
        │   │   ├── complaints.py
        │   │   ├── projects.py
        │   │   ├── dashboard.py
        │   │   ├── schemes.py
        │   │   ├── proposals.py
        │   │   ├── users.py
        │   │   └── official_contractor_chat.py
        │   ├── services/       # Business logic
        │   │   └── llm.py
        │   └── utils/          # Utility modules
        │       └── s3.py
        └── requirements.txt
```

---

## Installation & Setup

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10
- **MongoDB Atlas** cluster (or local MongoDB)
- **AWS S3** bucket (for file uploads)

### Frontend

```bash
cd client
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

### Backend

```bash
cd server/backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
SECRET_KEY=your-jwt-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket
```

---

## How to Run

### Start the Backend

```bash
cd server/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start the Frontend

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Screenshots

> _Screenshots coming soon — see the live deployment for a preview._

---

## Future Improvements

- Push notifications for complaint status updates
- Offline-first PWA support for low-connectivity villages
- Advanced analytics dashboard with charts and trends
- SMS-based complaint registration for non-smartphone users
- Multi-language support beyond English and Kannada

---

## License

This project is for educational and portfolio purposes.
