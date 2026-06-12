# 🚗 FuelTracks - B2B Fleet Management SaaS

A comprehensive fleet management system with real-time GPS tracking, multiple protocol support, and powerful analytics dashboard.

![FuelTracks Dashboard](https://via.placeholder.com/800x400?text=FuelTracks+Dashboard)

## Features

- **Real-time GPS Tracking** - Live vehicle monitoring on interactive maps
- **Multi-Protocol Support** - AIS-140, BSTP-15, BSTPL-17 GPS devices
- **Fleet Health Monitoring** - Vehicle status, battery, fuel levels
- **Alert Management** - Overspeed, ignition, tamper, geofence alerts
- **Analytics & Reports** - Speed trends, fuel consumption, trip history
- **Multi-organization Support** - Full RBAC with admin/manager/user roles
- **Dark/Light Theme** - Professional design with theme toggle
- **Mobile Responsive** - Works on desktop and mobile devices

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Leaflet, Socket.io Client  
**Backend:** Node.js, Express.js, Socket.io, PostgreSQL  
**GPS Protocols:** AIS-140, BSTP-15, BSTPL-17

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd fueltracks

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE fueltracks;"

# Go to backend directory
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 3. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fueltracks
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# TCP Servers for GPS Devices
GPS_PORT=9000              # Legacy protocol
TCP_AIS140_PORT=9001       # AIS-140 (tnavic)
TCP_BSTP15_PORT=9002       # BSTP-15 (BS Technotronics)
TCP_BSTPL17_PORT=9003      # BSTPL-17 (BS Technotronics)
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd fueltracks/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd fueltracks/frontend
npm run dev
```

### 5. Access the App

Open your browser: **http://localhost:5173**

## Login Credentials

| Role  | Email                | Password |
|-------|----------------------|----------|
| Admin | admin@fueltracks.com | admin123 |
| User  | user@fueltracks.com  | user123  |

## TCP Server Ports

| Port  | Protocol     | Device Type              | Header Format |
|-------|--------------|--------------------------|---------------|
| 9000  | Legacy       | Custom/simple protocols  | `imei:xxx`    |
| 9001  | **AIS-140**  | tnavIC AIS-140 devices   | `$LGN`, `$NRM`, `$ALT` |
| 9002  | **BSTP-15**  | BS Technotronics BSTP-15 | `$10`, `$11`  |
| 9003  | **BSTPL-17** | BS Technotronics BSTPL-17| `$10`, `$11`  |

## Project Structure

```
fueltracks/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, socket, env config
│   │   ├── models/          # Database models (User, Vehicle, etc.)
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, audit
│   │   ├── services/        # Email, SMS, alerts, reports
│   │   ├── tcp/             # TCP GPS Protocol Servers
│   │   │   ├── index.js           # TCP Manager (starts all servers)
│   │   │   ├── ais140/
│   │   │   │   └── parser.js      # AIS-140 protocol parser
│   │   │   ├── bstp15/
│   │   │   │   └── parser.js      # BSTP-15 protocol parser
│   │   │   ├── bstpl17/
│   │   │   │   └── parser.js      # BSTPL-17 protocol parser
│   │   │   └── shared/
│   │   │       └── db-utils.js    # Shared database utilities
│   │   └── server.js        # Main Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api/             # API service files
│   │   └── layouts/         # Page layouts
│   └── package.json
│
└── README.md
```

## GPS Protocol Details

### AIS-140 Protocol (Port 9001)
tnavic AIS-140 compliant devices

**Packet Types:**
| Header | Packet | Description |
|--------|--------|-------------|
| `$LGN` | Login | Device authentication |
| `$HLM` | Health | Battery, signal status |
| `$NRM` | Location | GPS tracking data |
| `$ALT` | Alert | Events, overspeed, etc. |
| `$EPB` | Emergency | SOS button pressed |

**Device Config:**
```
tnavic,SET PIP:yourserver.com,PPT:9001,RST
```

### BSTP-15 / BSTPL-17 Protocol (Ports 9002/9003)
BS Technotronics devices

**Packet Format:**
```
$10,<vehicle_id>,<valid>,<date>,<time>,<lat>,<N/S>,<lon>,<E/W>,<speed>,<odometer>,<dir>,<sats>,<gsm>,<bat>,<din1>,<din2>,<din3>,<eng>,<analog>,<fuel>,<volt>,<L/H>#
```

**Alert Format:**
```
$11,<vehicle_id>,<date>,<time>,<lat>,<N/S>,<lon>,<E/W>,<message>#
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

### Vehicles
- `GET /api/v1/vehicles` - List all vehicles
- `GET /api/v1/vehicles/:id` - Get vehicle details
- `POST /api/v1/vehicles` - Create vehicle
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Tracking
- `GET /api/v1/tracking/live` - Get live vehicle positions
- `GET /api/v1/tracking/:vehicleId` - Get specific vehicle live data

### History
- `GET /api/v1/history/:vehicleId` - Get vehicle location history

### Reports
- `GET /api/v1/reports/trips` - Get trip reports
- `GET /api/v1/reports/alerts` - Get alert reports
- `GET /api/v1/reports/fuel` - Get fuel consumption reports

### Admin
- `GET /api/v1/organizations` - List organizations
- `GET /api/v1/devices` - List GPS devices
- `GET /api/v1/groups` - List vehicle groups
- `GET /api/v1/users` - List users

## Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed demo data
npm run db:reset     # Reset and seed database
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

| Variable              | Description                      | Default        |
|-----------------------|----------------------------------|----------------|
| PORT                  | Express server port              | 5000           |
| DB_HOST               | PostgreSQL host                  | localhost      |
| DB_PORT               | PostgreSQL port                  | 5432           |
| DB_NAME               | Database name                    | fueltracks     |
| DB_USER               | Database username                | postgres       |
| DB_PASSWORD           | Database password                | -              |
| JWT_SECRET            | JWT signing secret               | -              |
| FRONTEND_URL          | Frontend URL for CORS            | http://localhost:5173 |
| GPS_PORT              | Legacy TCP server port           | 9000           |
| TCP_AIS140_PORT       | AIS-140 TCP server port          | 9001           |
| TCP_BSTP15_PORT       | BSTP-15 TCP server port          | 9002           |
| TCP_BSTPL17_PORT      | BSTPL-17 TCP server port         | 9003           |

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions, please contact support@fueltracks.com