# StreakTrack

StreakTrack is a web application designed to manage student attendance using face detection and user authentication. This application allows for seamless student registration, attendance tracking, and data management, providing an efficient way to maintain accurate attendance records.

## Features

- **User Authentication**: Secure login, registration, and logout functionality.
- **Student Registration**: Allows students to register by uploading three images for face recognition.
- **Attendance Tracking**: Uses face detection technology to track and record student attendance.
- **Dashboard**: View registered students and their current attendance status.
- **Edit Dashboard**: Manually mark attendance for students when necessary.
- **Download Attendance Data**: Export attendance records as an Excel sheet.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for Node.js.
- **MongoDB (Mongoose)**: NoSQL database for storing student data.
- **Passport.js**: Middleware for authentication.
- **Face-api.js**: Library for face detection and recognition.
- **EJS**: Embedded JavaScript templates for views.
- **PERISKOPE API**: API integration for sending WhatsApp messages.

## Setup

### Prerequisites

- **Node.js**: Ensure Node.js is installed on your system.
- **MongoDB**: Have MongoDB installed locally or have a MongoDB Atlas account.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aaupatel/Attendance-Tracking-using-Face-Recognition
   cd StreakTrack

2. **Install dependencies**:
   ```bash
   npm install

3. **Create a `.env` file**:
   ```bash
   touch .env

4. **Add the following environment variables in the `.env` file**:

   ```makefile
   PORT=8080
   MONGODB_URI=<your_mongodb_connection_string>
   EMAIL_HOST=<your_email_smtp_host>
   EMAIL_PORT=<your_email_smtp_port>
   EMAIL_USER=<your_email_address>
   EMAIL_PASS=<your_email_password>
   SESSION_SECRET=<your_secret_key>
   PERISKOPE_API_KEY=<your_Periskope_api_key>
   PERISKOPE_X_PHONE=<your_Periskope_phone_number>

5. **Run the application**:
   ```bash
   npm start

5. **Access the application**:

   Open your browser and navigate to `http://localhost:8080`.