
# Smart Learning Space Management and Reservation System at HCMUT

## System Description

This project is a  Smart Learning Space Management and Reservation System designed for educational institutions or organizations that need to manage the reservation of study rooms and equipment. The system provides a seamless experience for both regular users (students, staff) and administrators.

## System Architecture

### Frontend
- Built with React and Ant Design for a modern, responsive user interface
- State management handled with Redux Toolkit

### Backend
- Node.js and Express provide a robust REST API
- Authentication via JWT

### Database
- MySQL for persistent data storage

### Security
- User authentication and authorization enforced throughout the system
- CORS configured for secure cross-origin requests

## How to Run

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Backend Setup

#### a. Install dependencies
```bash
cd be
npm install
```

#### b. Configure environment
Create a `.env` file in the `be` directory with the following content:
```bash
PORT=8080
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

#### c. Set up the database
Download and install MySQL if you don't have it installed.

Open the MySQL Shell, then type:
```sql
\connect root@localhost
\sql
CREATE DATABASE IF NOT EXISTS SMART_LIBRARY_CNPM;
USE SMART_LIBRARY_CNPM;
\source path/to/database.sql
```

#### d. Start the backend server
```bash
node app.js
```

### 3. Frontend Setup

#### a. Install dependencies
```bash
cd fe
npm install
```

#### b. Start the frontend development server
```bash
npm run dev
```
