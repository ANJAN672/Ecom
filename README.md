# Fullstack E-commerce Project

A premium e-commerce application built with NestJS (Backend) and Next.js (Frontend).

## Project Structure

- `backend/`: NestJS API service.
- `frontend/`: Next.js web application.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (for backend)

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure your database settings.
4. Run the application:
   ```bash
   npm run start:dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev -- -p 3002
   ```
4. Open [http://localhost:3002](http://localhost:3002) in your browser.

## Features

- **Premium Aesthetics**: High-end Zinc/Apple-style minimalist design.
- **Amazon-Style Stock Logic**: Real-time urgency alerts (low stock pulses) and strict inventory locking on quantity selectors.
- **Inventory Awareness**: "Currently Unavailable" states with blurred imagery for out-of-stock items.
- **Address Management**: Streamlined, professional grid-based management for shipping information.
- **Secure Cart**: Professional cart experience with mathematical precision and stock validation.
- **Search & Filter**: Category-based filtering and global product search.
