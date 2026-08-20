# Xpert System

**AI-Powered Network Issue Prediction & Analytics Platform**

Xpert System is an end-to-end AI and data analytics platform that analyzes telecom network KPIs and historical tickets to predict network issue resolution categories and provide interactive analytics through a React dashboard.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ayaaltayeb-ngss/xpert-system.git
cd xpert-system
```

### 2. Database Setup

Start PostgreSQL using Docker:

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Create Database & Load Data

```bash
python create_tables.py
python load_data.py
```

### 5. Start FastAPI

```bash
uvicorn main:app --reload
```

### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application is now ready to use.
