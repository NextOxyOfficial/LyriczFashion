# LyriczFashion - E-commerce Platform

A full-stack e-commerce platform for fashion products with Python backend, React/TSX web frontend, and Flutter mobile app.

## Project Structure

```
LyriczFashion/
├── backend/          # Python FastAPI Backend
├── frontend/         # React/TSX Web Frontend
└── mobile/           # Flutter Mobile App
```

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (PgAdmin user: `user_lczfashion`)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with python-jose

### Web Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router DOM

### Mobile App
- **Framework**: Flutter
- **State Management**: Provider
- **HTTP Client**: http package

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Flutter 3.0+
- PostgreSQL

### Database Setup

1. Create a PostgreSQL database named `lyriczfashion_db`
2. Create user `user_lczfashion` with appropriate permissions
3. Update the `.env` file in the backend folder with your database credentials

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The web app will be available at `http://localhost:3000`

### Mobile App Setup

```bash
cd mobile

# Get dependencies
flutter pub get

# Run the app
flutter run
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Products
- `GET /products/` - List all products
- `GET /products/{id}` - Get product details
- `POST /products/` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Categories
- `GET /products/categories/` - List all categories
- `POST /products/categories/` - Create category

## Environment Variables

Create a `.env` file in the backend folder:

```env
DATABASE_URL=postgresql://user_lczfashion:your_password@localhost:5432/lyriczfashion_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Features

- 🛍️ Product catalog with categories
- 🔍 Search and filter products
- 🛒 Shopping cart functionality
- 👤 User authentication (register/login)
- 📱 Responsive web design
- 📲 Native mobile app
- 💳 Checkout process (ready for payment integration)

## License

MIT License

## Author

LyriczFashion Team
