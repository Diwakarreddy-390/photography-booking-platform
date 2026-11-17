# 📸 PRL SHOOTS – Photography Booking Platform

A full-stack photography booking web application designed to simplify photography service discovery, package selection, and online booking management.

PRL SHOOTS provides customers with an easy way to explore photography services, view packages, register, and manage bookings. It also includes an administrative dashboard for managing bookings, customers, packages, and video reels.

🌐 **Live Website:** https://photography-booking-platform.vercel.app/

💻 **GitHub Repository:** https://github.com/Diwakarreddy-390/photography-booking-platform

---

## ✨ Features

### 👤 Customer Features
- User registration and login using phone number and PIN.
- Secure authentication using JWT.
- Browse available photography services.
- View photography packages and pricing.
- Select packages for booking.
- Submit photography booking requests.
- View personal booking information.

### 🛠️ Admin Dashboard
- Dedicated administrator login.
- Admin dashboard with management sections.
- Manage customer bookings.
- View and manage customer information.
- Add, update, and delete photography packages.
- Manage video reels and categories.
- Organize photography services and content.

### 📷 Photography Services
- Wedding Photography
- Birthday Photography
- Vehicle Delivery Photography

### 🎬 Reels Management
- Admin can add and manage video reels.
- Organize reels by photography category.
- Display category-based photography content.

### 🔐 Security
- JWT-based authentication.
- Password/PIN hashing using bcrypt.
- Protected booking and administrative routes.
- Environment-based configuration.
- Database connection with SSL support for cloud deployment.

---

## 🧰 Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, JavaScript |
| UI Development | HTML5, CSS3 |
| Backend | Python, Flask |
| API | RESTful APIs |
| Database | MySQL |
| Authentication | JWT, bcrypt |
| Database Connectivity | MySQL Connector |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Database Hosting | Aiven Cloud |

---

## 🏗️ Project Architecture

The application follows a frontend-backend architecture.

**Frontend**
- React.js handles the user interface.
- Communicates with backend services through REST APIs.
- Displays packages, services, customer bookings, and reels.

**Backend**
- Flask handles API requests and application logic.
- JWT manages authenticated requests.
- Validates customer and booking information.
- Communicates with the MySQL database.

**Database**
- MySQL stores customer information, bookings, packages, administrators, OTP verification records, and reels.

---

## 📂 Project Structure

```text
photography-booking-platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── api.js
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── create_admins.py
│   └── ...
│
├── database/
│
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3
- Node.js and npm
- MySQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Diwakarreddy-390/photography-booking-platform.git

cd photography-booking-platform
```

### 2. Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

### 3. Backend Setup

Open another terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment on Linux:

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=prl_shoots

FRONTEND_URL=http://localhost:5173
```

Configure the database credentials and SSL settings according to your MySQL environment and backend configuration.

Start the Flask server:

```bash
python app.py
```

Backend server:

```text
http://localhost:5000
```

Frontend server:

```text
http://localhost:5173
```

### 4. Database Configuration

1. Create a MySQL database.
2. Configure the database connection variables in the backend `.env` file.
3. Import the project's database schema.
4. Configure the required database SSL certificate when using the hosted Aiven database.

---

## ☁️ Deployment

The project uses cloud deployment services:

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Aiven MySQL |

Frontend deployment:
https://photography-booking-platform.vercel.app/

The frontend communicates with the deployed backend using the `VITE_API_URL` environment variable.

Backend and database credentials are configured through deployment environment variables.

---

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack web application development.
- React.js frontend development.
- Python Flask backend development.
- REST API creation and integration.
- MySQL database design and connectivity.
- JWT-based authentication.
- Secure PIN/password hashing.
- CRUD operations.
- Git and GitHub version control.
- Cloud deployment using Vercel, Render, and Aiven.

---

## 👨‍💻 Developer

**MITTAPALLI DIWAKAR REDDY**

- GitHub: https://github.com/Diwakarreddy-390
- LinkedIn: https://linkedin.com/in/diwakar-reddy-1928b1233
- Email: diwakarreddy926@gmail.com

---

⭐ If you find this project interesting, feel free to explore the repository!

**PRL SHOOTS – Capturing Moments. Creating Memories.**
