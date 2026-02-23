# PaperGen AI 🎓✨

PaperGen AI is a full-stack, AI-powered platform designed specifically for students to effortlessly generate, take, and evaluate university-level question papers based on their own uploaded PDF notes and study materials. 

Built with a specialized focus on **REVA University's Unit/Set exam patterns**, this platform uses Google's Gemini 2.5 AI SDK to intelligently analyze study material and generate rigorous, structurally accurate exam papers.

---

## 🌟 Key Features

- **🧠 Intelligent Paper Generation:** Upload up to 10 course PDFs and generate a structured exam paper that perfectly mimics real university formats (Unit-wise, Parallel Sets).
- **🔒 Secure Test Environment:** Take the generated exams in a simulated, distraction-free environment with countdown timers and automated saving.
- **👨‍🏫 AI Professor Evaluation:** Exams are automatically graded by an AI evaluator that provides scores, constructive feedback, and correctly penalizes missing information. 
- **📊 Analytics Dashboard:** Track your test history, average scores, and subject proficiency over time with interactive and dynamic charts (via Recharts).
- **🔐 Secure Authentication:** Supports traditional Email & Password login, alongside seamless OAuth integrations with **GitHub** and **Google**.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 & Vite:** Lightning-fast frontend tooling and rendering.
- **Tailwind CSS & Framer Motion:** Beautiful, responsive glassmorphism UI with micro-animations.
- **React Router Dom:** For secure and seamless client-side routing.
- **Lucide React:** Premium iconography.

### Backend
- **Node.js & Express:** Scalable RESTful API architecture.
- **PostgreSQL (Supabase/Neon):** Robust relational database for user profiles, test history, and analytics.
- **Google OAuth Library & Bcrypt:** Secure authentication and password hashing.
- **Python 3:** Handles the heavy lifting for PDF text extraction (`pdfplumber`) and AI generation.

### 🔬 Machine Learning Pipeline
- **PDF Parsing:** Utilizes `pdfplumber` to extract high-quality raw text from complex student notes and presentations.
- **Pattern Recognition:** A custom mathematical pattern map (`models/pattern_model.pkl`) automatically parses and enforces university-specific exam weights and requirements.
- **Generative AI Integration:** Leverages the modern `google-genai` Python SDK to prompt `gemini-2.5-flash`. The prompt engineering is heavily constrained to force the LLM to output a rigid JSON schema, preventing hallucinations and ensuring parallel sets (Set A / Set B) are accurately generated for every individual unit.
- **Dynamic AI Evaluator:** During the simulated exams, the Node.js backend uses zero-shot prompting with strict persona constraints (e.g., Chill vs. Strict) to intelligently evaluate student answers against the original parsed curriculum, returning individual question scores, max marks, and constructive feedback.

---

## 🚀 Local Development Setup

### Prerequisites
1. **Node.js** (v20+)
2. **Python** (v3.10+)
3. A **PostgreSQL** database (Local or Cloud like Supabase/Neon)
4. A **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kavyaarora349/papergen.git
cd papergen

# Install Frontend Dependencies
npm install

# Install Backend Node Dependencies
cd backend
npm install

# Install Python ML Dependencies
pip install -r ../requirements.txt
```

### 2. Environment Variables

Create a `.env` file inside the `backend/` directory by looking at `backend/.env.example`. You will need:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/papergen_db
PORT=8001
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Database Initialization
Before running the application, make sure your PostgreSQL database has the correct tables.
Run the schema script against your pgAdmin or Supabase SQL editor:
```bash
# The schema file is located at:
backend/schema.sql
```

### 4. Run the Application
You can run both the React frontend and the Node backup concurrently from the root folder:
```bash
# Run this in the root project directory:
npm start
```
- The frontend will be available at `http://localhost:3000` (or `http://localhost:5173`)
- The backend will be available at `http://localhost:8001`

---

## 🌍 Production Deployment

### Backend (Render)
1. Deploy the `backend` folder as a **Web Service** on Render.
2. Set the Build Command to: `npm install && pip install -r ../requirements.txt`
3. Set the Start Command to: `npm start`
4. Add the Environment Variable `PYTHON_VERSION` = `3.10.12` to ensure ML dependencies build successfully.
5. Populate the remaining `.env` variables from your local setup into the Render dashboard.

### Frontend (Vercel)
1. Import the root repository into Vercel.
2. The `vercel.json` and `.vercelignore` files will automatically configure Vercel to only build the React app and safely ignore the Python pipeline.
3. Add the extremely important Environment Variable: 
   - `VITE_API_URL` = `https://your-render-app-url.onrender.com/api`

---

*Built with love by Kavya Arora*
