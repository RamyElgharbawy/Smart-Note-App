Smart Note App
A secure note-taking application built with modern web technologies, featuring user authentication and CRUD operations for notes.
Features

🔐 User Authentication - Secure registration and login with JWT (RSA asymmetric encryption)
📝 Note Management - Create, view, and delete personal notes
🛡️ Security - Password hashing with bcrypt, input validation with Joi
📧 Email Notifications - Password reset and account verification via Nodemailer
🚀 GraphQL API - Flexible query language for efficient data fetching

## Technology Stack

Backend: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT with RSA asymmetric key pairs
Password Security: bcrypt
Email Service: Nodemailer
API: GraphQL
Validation: Joi

## Prerequisites

Node.js (v14 or higher)
MongoDB (local or MongoDB Atlas)

## Installation

Clone the repository
$ git clone <[repository-url](https://github.com/RamyElgharbawy/Smart-Note-App.git)>
$ cd smart-note-app

Install dependencies
$ npm install

Start the application

# Development mode

npm run dev

# Production mode

npm start

## API Endpoints

GraphQL Endpoint

URL: http://localhost:8000/graphql
