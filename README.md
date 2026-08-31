Checkout 

A simple full-stack checkout application built with React and Node.js.

It supports user authentication and real-time payment status updates using WebSocket.


Features

Login and registration,
Protected routes,
Redux state management,
Real-time payment updates,
Clean and responsive UI,

Tech Stack

Frontend

React + TypeScript,
Redux Toolkit,
React Router,
Tailwind CSS,
Vite,


Backend

Node.js,
Express,
MongoDB,
JWT authentication,
Socket.IO,

Project Setup

Backend Setup

Navigate to backend folder:

cd back-end
Install dependencies:
npm install

Create a .env file in the back-end folder:
PORT=3000
MONGODB_URI=mongodb+srv://welutsegay56_db_user:2BnvCtiD4qT9WECC@cluster0.yh2dx70.mongodb.net/
JWT_SECRET=youthis

Start the backend server:
npm run dev

Frontend Setup

Navigate to frontend folder:
cd front-end

Install dependencies:
npm install

Create a .env file in the front-end folder:
VITE_API_URL=http://localhost:3000

Start the frontend:
npm run dev

Notes

Backend must be running before starting the frontend

User must be authenticated to access the checkout page

Payment status updates are handled in real time via WebSocket
