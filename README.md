# Overview
This is a simple Node.js and Express application that provides a service layer to:
- Fetch questions
- Submit an answer
- Submit the quiz to fetch the score

## Features
- Node.js backend
- Express for routing and middleware
- Cookie handling (encryption, reading cookies)
- CORS setup for cross-origin requests
- API endpoint setup for handling requests
- Deployed on Vercel

## Installation

1. **Clone the repository:**
   ```bash
   https://github.com/ayushmaz/quiz-backend.git
   cd quiz-backend

2. **Install dependencies::**
   ```bash
   npm install

3. **Run the development server::**
   ```bash
   npm run start


## API Endpoints

The following are some example API endpoints:

| Method | Endpoint              | Description                      |
|--------|------------------------|----------------------------------|
| GET    | /questions             | Fetches a list of questions      |
| POST   | /question/:id/answer   | Submits an answer                |
| POST   | /submit                | Submits the quiz and fetches score|
