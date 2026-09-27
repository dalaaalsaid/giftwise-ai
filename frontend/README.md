# GiftWise AI

GiftWise AI is a smart personalized gift planning and e-commerce platform designed to help users find, build, and purchase meaningful gifts.

The platform combines a traditional gift shop with AI-powered recommendations, custom gift box creation, last-minute gift options, secure user authentication, order management, and an admin dashboard.

## Features

- User registration and login
- JWT-based authentication
- Browse and search gift products
- Product categories
- Product details
- AI-powered gift recommendations
- No-match detection with alternative suggestions
- Build Your Own Gift Box
- Optional flower add-ons
- Personalized recipient name and card message
- Last-minute ready-made gift boxes
- Shopping cart
- Detailed custom box price breakdown
- Checkout with delivery information
- Sandbox payment flow
- Order creation and order history
- Admin dashboard
- Admin order management
- Product and category management
- Sales reports
- AI recommendation insights
- Stock management

## AI Gift Finder

The GiftWise AI Gift Finder allows users to describe the recipient, their interests, occasion, and budget.

The recommendation system:

- Retrieves available and in-stock products from the GiftWise catalog
- Sends only those products to the AI model
- Prevents the AI from inventing products that do not exist in the shop
- Returns relevant recommendations when a meaningful match exists
- Returns a "No exact match found" result when the requested interest is unavailable
- Provides clearly labeled alternative products when appropriate
- Uses a fallback recommendation system if the AI service is unavailable

This keeps the AI recommendations grounded in the actual GiftWise product catalog.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- CSS Modules
- Lucide React

### Backend

- FastAPI
- Python
- MongoDB
- Pydantic
- JWT Authentication

### AI

- OpenAI API
- Catalog-grounded AI recommendations
- JSON-based recommendation responses
- Rule-based fallback recommendation engine

## Project Structure

```text
giftwise-ai/
│
├── frontend/
│   ├── app/
│   ├── lib/
│   ├── public/
│   └── .env.local
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
└── README.md