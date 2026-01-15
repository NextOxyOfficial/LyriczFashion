from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth, products

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LyriczFashion API",
    description="Backend API for LyriczFashion E-commerce Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)


@app.get("/")
def root():
    return {"message": "Welcome to LyriczFashion API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
