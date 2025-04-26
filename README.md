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
- Leave a review for a product you've purchased.

## Firebase Authentication Setup

### Frontend Setup
The frontend is already configured with Firebase client SDK to support Google authentication.

### Backend Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e-commerce-a53a8)
3. Go to Project Settings > Service accounts
4. Click "Generate new private key" to download a JSON file containing your Firebase service account credentials
5. Open the downloaded JSON file and update the environment variables in your backend wrangler.jsonc file:

```json
"FIREBASE_PROJECT_ID": "your-project-id", // Copy from the JSON file
"FIREBASE_PRIVATE_KEY": "your-private-key", // Copy the entire private_key value from the JSON file
"FIREBASE_CLIENT_EMAIL": "your-service-account-email" // Copy from the JSON file (ends with @your-project-id.iam.gserviceaccount.com)
```

6. Make sure the private key includes the begin and end markers:
```
"FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBA... ...your full key here... ...3DR55uNw==\n-----END PRIVATE KEY-----\n"
```

7. If you continue to have issues, try URL encoding the private key or removing newlines manually

### Troubleshooting Google Sign-in
If you see 401 Unauthorized errors after attempting to sign in:
1. Check browser console for detailed error messages
2. Verify your Firebase service account has the "Firebase Authentication Admin" role
3. Make sure you're using the correct service account email and private key
4. Check your backend logs for more detailed error information

### Testing the Google Authentication
1. Run the backend: `cd backend && npm run dev`
2. Run the frontend: `cd frontend && npm run dev`
3. Click "Sign in with Google" button in the login page
4. Complete the Google login flow
5. You should be redirected to the homepage after successful login

Made by KISHAN TIWARI
