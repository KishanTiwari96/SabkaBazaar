# SabkaBazaar 🛒

**SabkaBazaar** is a full-featured e-commerce website where users can browse, filter, and shop for products with a smooth and responsive experience. It supports authentication via email/password and mobile OTP (using Firebase). Users can manage their cart, place orders, and leave reviews.

Live Url : https://sabka-bazaar-official.vercel.app/
## ✨ Features

- **Authentication**
  - Signup/Login using **email & password**
  - JWT-based cookie session management
  - Dynamic UI: shows logged-in user's name instead of login/signup buttons

- **Product Catalog**
  - View all products with filters:
    - **Category**
    - **Brand**
    - **Price (Low to High / High to Low)**
  - Product detail page with full description and images

- **Cart & Orders**
  - Add/remove items from cart
  - View cart summary and total
  - Place orders and view past orders

- **Reviews**
  - Add/edit/delete your own reviews
  - View all reviews sorted by date or rating

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Hono (Cloudflare Workers), Prisma
- **Database**: PostgreSQL
- **Authentication**: Firebase (OTP), Custom email/password logic with JWT

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm or yarn
- PostgreSQL instance
- Firebase project (for mobile OTP)

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/your-username/sabkabazaar.git
cd sabkabazaar

2. **Install dependencies**
# For frontend
cd frontend
npm install

# For backend
cd ../backend
npm install

3. **Set up environment variables**
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret

4. **Set up Prisma**
npx prisma generate
npx prisma migrate deploy

5. **Run the servers**
# In one terminal
cd backend
npm run dev

# In another terminal
cd frontend
npm run dev

Testing

- Create an account with any email and password.
- Or login with a phone number using OTP.
- Add products to your cart and place an order.
- Leave a review for a product you’ve purchased.

Made by KISHAN TIWARI
