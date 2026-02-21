# Dalali Transaction Management System

A full-stack web application for managing commission-based grain trading transactions with MongoDB backend, React frontend, and comprehensive reporting features.

## Features

- **Authentication**: Login/Logout with JWT, Forgot Password functionality
- **Transaction Management**: Create transactions with auto-incrementing year-based numbers (Tr2026-1, Tr2026-2, etc.)
- **Master Data**: Manage Items, Clients, and Cities
- **Reporting**: 
  - Daily transaction views
  - Party-wise transaction reports with date filtering
  - PDF export functionality
  - Print-friendly layouts
- **Responsive Design**: Built with Tailwind CSS

## Tech Stack

### Frontend
- React.js 19
- React Router DOM
- Tailwind CSS
- Axios
- jsPDF & jsPDF-AutoTable
- date-fns

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Nodemailer for email

## Project Structure

```
DalaliProg/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utilities (API client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
└── server/                # Node.js backend
    ├── config/           # Database configuration
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Auth middleware
    ├── server.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- npm or yarn

### 1. MongoDB Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development

# Optional: Email configuration for forgot password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@dalali.com
```

### 3. Frontend Setup

```bash
cd client
npm install
```

### 4. Create Initial User

You'll need to create an initial user in MongoDB. You can use MongoDB Compass or the MongoDB Atlas web interface:

1. Connect to your database
2. Go to the `users` collection
3. Insert a document:

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "createdAt": { "$date": "2026-02-08T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-02-08T00:00:00.000Z" }
}
```

**Note**: You'll need to hash the password using bcrypt. You can use an online bcrypt generator or run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('yourpassword', salt);
console.log(hashedPassword);
```

### 5. Running the Application

#### Start Backend Server
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

#### Start Frontend Development Server
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:5173

## Usage Guide

### First Time Setup

1. **Login** with your credentials
2. **Add Cities**: Go to Manage Cities and add cities with STD codes and postal codes
3. **Add Items**: Go to Manage Items and add grain types (Maize, Rice, Wheat, etc.)
4. **Add Clients**: Go to Manage Clients and add your clients with their cities
5. **Create Transactions**: Now you can start adding transactions!

### Creating a Transaction

1. Click "Add Transaction" from the home page
2. Fill in all required fields:
   - Purchaser and Buyer details
   - Item and quantity (bag or katta)
   - Rate per unit
   - Dalali rate and katta weight
   - Trade conditions and method
   - Date
3. The transaction number is auto-generated (format: Tr2026-1, Tr2026-2, etc.)
4. Total amount is calculated automatically
5. Click "Create Transaction"

### Viewing Reports

- **Daily Transactions**: Select a date to view all transactions for that day. Print-friendly layout available.
- **Party Reports**: Select a client and date range to view all transactions. Download as PDF.

## Transaction Number Format

Transaction numbers follow the format: `TrYYYY-N`
- YYYY: Current year
- N: Sequential number starting from 1 each year

Examples: Tr2026-1, Tr2026-2, Tr2027-1, Tr2027-2

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/next-number` - Get next transaction number
- `GET /api/transactions/daily/:date` - Get daily transactions
- `GET /api/transactions/party/:clientId` - Get party transactions

### Master Data
- `GET/POST/PUT/DELETE /api/items` - Item CRUD
- `GET/POST/PUT/DELETE /api/clients` - Client CRUD
- `GET/POST/PUT/DELETE /api/cities` - City CRUD

All routes except auth require JWT token in Authorization header.

## Troubleshooting

### npm install fails
Try:
```bash
npm cache clean --force
npm install
```

### MongoDB connection fails
- Check your connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check Vite proxy configuration in `vite.config.js`

## Future Enhancements

- Edit/Delete transactions
- Individual transaction letterhead printing
- User profile management
- Advanced filtering and search
- Export to Excel
- Email notifications

## License

MIT

## Support

For issues or questions, please contact the development team.



  