# Property Management

A full-stack property management application built with React, TypeScript, Express, and MongoDB.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: MongoDB with Drizzle ORM
- **Styling**: Tailwind CSS with custom components

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Property-Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/property-management
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property-management
   ```

## Running the Project

### Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

This command starts the Express server with hot reloading enabled.

### Production Mode

To build and run in production:

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## Database Setup

### Push Database Schema

If using Drizzle ORM for schema management:

```bash
npm run db:push
```

This will push your database schema to MongoDB.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Utility functions
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts             # Database configuration
│   └── ...
├── shared/                # Shared types and schemas
└── script/                # Build scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT
