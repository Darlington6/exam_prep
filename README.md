# Exam Prep

> A web-based platform helping African students excel in their examinations through interactive practice and instant feedback

## African Context

Many students across Africa prepare for important national examinations at the end of secondary school and for university entrance exams. These exams are highly competitive and play a major role in determining students' academic and career opportunities.

However, access to structured and interactive revision materials remains limited in many areas. Students often depend on printed past questions, textbooks, or informal study groups. In some communities, access to quality digital learning platforms is still developing. As a result, many learners do not receive instant feedback on their performance and cannot easily track their progress over time.

This project aims to provide a simple, affordable, and accessible online platform where students can practice exam questions, receive immediate results, and monitor their improvement. By supporting digital learning and self-assessment, the platform contributes to improving exam preparation and educational outcomes across African countries.

## Team Members

- UWIMANA Chantal - Frontend, DevOps - [Student ID]
- Desmond Tunyiko -  Backend, DevOps - 297697450
- Nmesoma Solomon Peter - Backend, DevOps - [Student ID]
- Sharangabo Edouard - Frontend, DevOps 

## Project Overview

Exam Prep is a full-stack MERN (MongoDB, Express, React, Node.js) web application that allows students to practice exam questions online. Users can register, log in securely with JWT authentication, choose exam categories, attempt multiple-choice questions, and receive instant results with detailed feedback.

The system automatically calculates scores and shows correct answers with explanations. Students can also view their past attempts and monitor their improvement over time through personalized dashboards.

The platform includes an admin section where administrators can create exams, add questions, and manage content easily. The system is designed to be scalable, secure, and easy to maintain using modern development and DevOps practices, including GitHub Actions and Docker containerization.

### Target Users
Secondary school students

University students

People preparing for professional certification exams

Schools and training centers

### Core Features

- **User Registration and Authentication**: Secure account creation and login with JWT tokens and bcrypt password hashing
- **Practice Exams**: Users can choose from various exam categories and answer multiple-choice questions for any type of exam
- **Timed Practice Sessions**: Test yourself within specific time limits to simulate real exam conditions
- **Instant Results and Feedback**: Immediate scoring with correct answers and detailed explanations after submission
- **Performance Tracking**: View previous attempts and monitor improvement over time through personalized dashboards
- **Admin Dashboard**: Administrators can create and manage exams, add questions manually or fetch from external platforms via API integration
- **API Integration**: Fetch exam questions and content from external educational platforms and APIs to expand the question bank
- **Protected Routes**: Role-based access control for students and administrators
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## Technology Stack

- **Backend**: Node.js/Express
- **Frontend**: React with TypeScript
- **Database**: MongoDB
- **Other**: JWT authentication, bcryptjs, Axios, React Router, Vite, GitHub Actions (planned), Docker (planned)

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher
- MongoDB v4.4 or higher (local installation or MongoDB Atlas account)
- Git for version control

### Installation

1. Clone the repository
```bash
git clone https://github.com/Darlington6/exam_prep.git
cd exam_prep
```

2. Set up the Backend
```bash
cd exam-prep/backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/exam_prep_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

Set up the Frontend:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

Edit the `.env` file:
```
<!--  -->

3. Run the application

Start MongoDB (if running locally):
```bash
mongod
```

In separate terminal windows:

Backend:
```bash
cd exam-prep/backend
npm run dev
```

Frontend:
```bash
cd exam-prep/frontend
npm run dev
```

### Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Click "Register" to create a new account with your name, email, and password
3. After registration, you'll be automatically logged in
4. The authentication feature is the only one implemented for this phase. Other features will be added later

## Project Structure

```
exam_prep/
├── LICENSE
├── README.md
└── exam-prep/
    ├── backend/                    # Node.js/Express backend
    │   ├── server.js              # Entry point, Express app setup
    │   ├── package.json           # Backend dependencies
    │   ├── .env.example           # Environment variables template
    │   ├── middleware/
    │   │   └── auth.js            # Authentication middleware
    │   ├── models/
    │   │   └── User.js            # Mongoose User schema
    │   └── routes/
    │       └── auth.js            # Authentication routes
    │
    └── frontend/                   # React/TypeScript frontend
        ├── index.html             # HTML entry point
        ├── package.json           # Frontend dependencies
        ├── vite.config.ts         # Vite configuration
        ├── tsconfig.json          # TypeScript configuration
        ├── eslint.config.js       # ESLint configuration
        ├── .env.example           # Environment variables template
        ├── public/                # Static assets
        └── src/
            ├── main.tsx           # React entry point
            ├── App.tsx            # Main App component with routing
            ├── App.css            # Global styles
            ├── index.css          # Base styles
            ├── api/
            │   └── client.ts      # Axios client with interceptors
            ├── components/
            │   └── ProtectedRoute.tsx  # Route protection
            ├── contexts/
            │   └── AuthContext.tsx     # Authentication context
            └── pages/
                ├── Home.tsx       # Landing page
                ├── Login.tsx      # Login page
                └── Register.tsx   # Registration page
```

## Links


## License

MIT License
