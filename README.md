# ChatGPT Backend

A REST API for a ChatGPT-style conversational AI application. The backend manages user accounts, authentication, chat history, message persistence, AI responses through OpenRouter, and token-usage tracking.

The matching frontend is available at [ChatGPT Frontend](https://github.com/Sachin7137/ChatGPT_Frontend).

## Features

- User registration, login, logout, profile retrieval, and account deletion.
- Password hashing with bcrypt.
- JWT authentication delivered through an HTTP-only cookie.
- MongoDB persistence using Mongoose.
- Chat and message history scoped to the authenticated user.
- AI response generation through the OpenRouter SDK.
- Conversation context construction and background summary updates.
- Redis-backed request rate limiting and token-window counting.
- Per-chat and per-user token usage records.
- Zod validation for authentication inputs.

## Tech stack

- Node.js (ES modules)
- Express 5
- MongoDB and Mongoose
- Redis
- OpenRouter SDK
- JWT and bcrypt
- Zod
- dotenv, cookie-parser, and CORS

## Architecture

A request generally follows this path:

1. **Route** receives the HTTP request.
2. **Middleware** checks authentication, applies rate limiting, and loads the current user where required.
3. **Controller** validates the request and coordinates the operation.
4. **Model** reads or writes user, chat, and message documents in MongoDB.
5. **Service** calls OpenRouter or builds/updates conversation summaries.
6. **Response** returns JSON to the frontend.

Important folders and files:

```text
config/
  database.js              # MongoDB connection
  redis.js                 # Redis client connection
  openRouter.js            # OpenRouter client configuration
controllers/
  userController.js        # Signup, login, logout, profile, account deletion
  chatController.js        # Create, list, read, and delete chats
  messageController.js     # Load messages and generate/save AI responses
middlewares/
  authUserMiddleware.js    # JWT/cookie authentication
  loadUserMiddleware.js    # Load the authenticated user's database record
  authenticatedRateLimiter.js
  unathenticatedRateLimiter.js
  tokenUsageMiddleware.js  # Redis token-window limit check
model/
  userSchema.js
  chatSchema.js
  messageSchema.js
routes/
  userRouter.js
  chatRouter.js
  messageRouter.js
service/
  openRouterService.js     # OpenRouter request and usage extraction
  summaryService.js        # Conversation summary maintenance
utils/
  chatContext.js            # Build model input from chat history
  tokenUsage.js             # Update per-chat token totals
  userUsage.js              # Update per-user token totals
validators/
  userValidators.js         # Signup/login validation
index.js                    # Express setup and server startup
```

## Requirements

- Node.js and npm
- A MongoDB database
- A Redis instance
- An OpenRouter API key

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Sachin7137/ChatGPT_Backend.git
cd ChatGPT_Backend
npm install
```

Create a `.env` file in the repository root. Use the variable names below; replace all example values with your own:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatgpt
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=replace_with_a_long_random_secret
OPENROUTER_API_KEY=your_openrouter_api_key
TOKEN_LIMIT=10000
TOKEN_WINDOW_SECONDS=3600
```

Notes:

- `PORT` must match the port configured in the frontend's `src/api.js`; the current frontend uses `http://localhost:3000`.
- `MONGODB_URI` should point to your MongoDB deployment and database.
- `REDIS_URL` should point to your running Redis service.
- `JWT_SECRET` is used to sign and verify authentication tokens. Keep it private and use a strong random value.
- `OPENROUTER_API_KEY` is used by the backend to request AI completions. Never expose it in frontend code or commit it to Git.
- `TOKEN_LIMIT` and `TOKEN_WINDOW_SECONDS` configure the Redis-backed token limit and its time window. The example values are development defaults, not a guarantee of provider pricing or limits.

Start the server:

```bash
node index.js
```

The server connects to MongoDB and Redis before listening. Check the terminal for connection errors if it does not start.

## API overview

All endpoints are relative to the backend origin, for example `http://localhost:3000`. Protected routes require the authentication cookie created by signup/login.

### User routes

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/user/signup` | Create an account | No |
| POST | `/user/login` | Log in | No |
| POST | `/user/logout` | Log out and blocklist the current token | Yes |
| GET | `/user/profile` | Get the current user's profile and usage | Yes |
| DELETE | `/user/delete` | Delete the account and its chats/messages | Yes |

### Chat routes

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/chat/createChat` | Create a chat with a model ID | Yes |
| GET | `/chat/getRecentChat` | Get up to 20 recent chats | Yes |
| GET | `/chat/:chatId` | Get a chat's metadata | Yes |
| DELETE | `/chat/:chatId` | Delete a chat and its messages | Yes |

### Message routes

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/message` | Start a chat and send its first prompt; body includes `content` and `model` | Yes |
| POST | `/message/:chatId` | Send a prompt in an existing chat; body includes `content` | Yes |
| GET | `/message/:chatId` | Retrieve messages for a chat | Yes |

Example request for a new conversation:

```http
POST /message
Content-Type: application/json
```

```json
{
  "content": "Explain how promises work in JavaScript.",
  "model": "aion-labs/aion-3.5"
}
```

The message response includes the chat ID, user and assistant message objects, token usage details, and token-window information when generation succeeds.

## How AI chat works

1. The client sends a prompt to `POST /message` or `POST /message/:chatId`.
2. Authentication and rate-limit middleware run before the controller.
3. For a new chat, the controller creates a chat record using the requested model ID. For an existing chat, it verifies that the chat belongs to the authenticated user.
4. The backend builds the model's context from prior messages and any stored summary.
5. The OpenRouter service requests a completion for the chat's configured model.
6. The backend stores both the user prompt and assistant reply in MongoDB.
7. Usage totals are updated for the chat and user, and Redis tracks token use within the configured time window.
8. The response returns the saved messages and usage data. A summary update is scheduled in the background when needed.

## Token usage: two tracking layers

- **Redis token window:** used by `tokenUsageMiddleware` to enforce `TOKEN_LIMIT` during `TOKEN_WINDOW_SECONDS`. This is a temporary rate/usage window.
- **MongoDB usage records:** the user schema stores `usage.tokenUsed`, `usage.tokenLimit`, `usage.resetAt`, and `usage.totalTokenUsed`. Chat documents also track prompt, completion, and total tokens.

These counters serve different purposes. Confirm which value the frontend displays and keep the reset/limit policies consistent when changing usage behavior.

## Security and configuration notes

- Never commit `.env` or API secrets.
- Use HTTPS and secure cookie settings in production.
- Configure CORS for the exact frontend origin you deploy; the current server configuration allows `http://localhost:5173` with credentials.
- Set strong secrets, validate input, and review rate limits before public deployment.
- The current `package.json` does not define a production start script or a working test suite; `node index.js` is the documented local startup command.

## Related repository

- [ChatGPT Frontend](https://github.com/Sachin7137/ChatGPT_Frontend) — React UI for authentication, conversation history, prompt submission, and usage display.
