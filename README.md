# Delivery Tracker

A modern web application for tracking deliveries in real-time, built with Next.js and Node.js.

## Features

- Real-time delivery tracking
- Interactive maps using Leaflet
- Modern UI components using Radix UI
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- Form handling with React Hook Form
- Data visualization with Recharts
- Real-time updates with Socket.IO

## Tech Stack

### Frontend
- Next.js 13.5.1
- React 18.2.0
- TypeScript
- Tailwind CSS
- Radix UI Components
- Leaflet for maps
- React Hook Form
- Zod for validation
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DevXPanda/Delivery-tracker.git
cd delivery-tracker
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Development

1. Start the frontend development server:
```bash
npm run dev
```

2. Start the backend server:
```bash
npm run server
```

The application will be available at `http://localhost:3000`

### Building for Production

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Project Structure

```
delivery-tracker/
├── app/                 # Next.js app directory
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── server/             # Backend server code
│   └── src/            # Server source code
├── public/             # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run server` - Start the backend server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
