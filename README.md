# ChatGPT Backend

## Project Description

A backend API for a ChatGPT-style conversational AI application built with **Node.js, Express.js, MongoDB, and OpenRouter**.

The application provides user authentication, chat management, message handling, AI-generated responses, conversation context, and token usage tracking.

## Tech Stack

* **Node.js** — Backend runtime
* **Express.js** — REST API framework
* **MongoDB** — Database
* **Mongoose** — MongoDB ODM
* **OpenRouter** — AI model API integration
* **JWT** — Authentication
* **bcrypt** — Password hashing
* **Zod** — Request validation
* **cookie-parser** — Cookie handling
* **dotenv** — Environment variable management

## Installation

Clone the repository:

```bash
git clone https://github.com/Sachin7137/ChatGPT_Backend.git
```

Navigate to the project:

```bash
cd ChatGPT_Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and add the required environment variables.

Start the server:

```bash
node index.js
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

Replace the placeholder values with your actual MongoDB connection string, JWT secret, and OpenRouter API key.
