# C4H Healthcare EMR System

A comprehensive Electronic Medical Records (EMR) system designed specifically for maternal and child healthcare in Sierra Leone. This system focuses on pregnant and lactating women, providing essential healthcare management tools.

## 🚀 Demo Features

- **Patient Management**: Comprehensive patient records for pregnant and lactating women
- **Appointment Scheduling**: Advanced appointment management with priority levels
- **Risk Assessment**: Automated risk level calculation based on medical history
- **Dashboard Analytics**: Real-time statistics and insights with priority alerts
- **Report Export**: Download comprehensive maternal health reports (PDF/TXT format)
- **Visit Management**: Complete visit workflow with notes and session tracking
- **Smart Filtering**: Filter patients by risk level directly from dashboard alerts
- **Mobile Responsive**: Optimized for all device sizes
- **Demo Mode**: Runs with local data without requiring database setup

## 📊 Demo Data

The system includes comprehensive demo data featuring:
- **22+ Patient Records**: Diverse cases including pregnant and lactating women
- **25+ Appointments**: Various appointment types and statuses
- **Risk Levels**: Low, medium, and high-risk patients
- **Medical History**: Realistic medical conditions and treatments
- **Geographic Data**: Sierra Leone districts and chiefdoms

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with local demo fallback
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics
- **Deployment**: Vercel-optimized

## 🚀 Quick Start (Demo Mode)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd c4h-healthcare-emr

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will run in demo mode by default, using local comprehensive demo data.

### Environment Setup

The system includes a `.env.local` file configured for demo mode:

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_NAME="C4H Healthcare EMR"
NEXT_PUBLIC_APP_VERSION="1.0.0-demo"
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Environment Variables**:
   Set these in your Vercel dashboard:
   ```
   NEXT_PUBLIC_DEMO_MODE=true
   NEXT_PUBLIC_APP_NAME=C4H Healthcare EMR
   NEXT_PUBLIC_APP_VERSION=1.0.0-demo
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Production with Supabase

For production deployment with a real database:

1. **Setup Supabase Project**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL scripts in `scripts/` folder
   - Get your project URL and anon key

2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**:
   ```sql
   -- Run scripts/create-tables.sql
   -- Run scripts/seed-data.sql (optional)
   ```

## 📁 Project Structure

```
c4h-healthcare-emr/
├── app/
│   ├── components/          # Reusable UI components
│   ├── lib/                # Utilities and configurations
│   │   └── supabase.ts     # Database client and demo data
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles
├── scripts/
│   ├── create-tables.sql   # Database schema
│   └── seed-data.sql       # Sample data
├── public/                 # Static assets
├── .env.example           # Environment template
├── .env.local             # Demo configuration
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 🎯 Demo Script

### Dashboard Overview (2 minutes)
1. **Statistics Cards**: Show patient counts and appointment metrics
2. **Recent Patients**: Highlight diverse patient cases
3. **Upcoming Appointments**: Demonstrate scheduling system
4. **Quick Actions**: Show add patient/appointment functionality

### Patient Management (3 minutes)
1. **Patient List**: Filter by status (pregnant/lactating)
2. **Search Functionality**: Find patients by name
3. **Risk Assessment**: Show low/medium/high risk patients
4. **Patient Details**: View comprehensive patient information

### Appointment System (2 minutes)
1. **Appointment Calendar**: Show scheduled appointments
2. **Priority Levels**: Demonstrate urgent vs routine appointments
3. **Status Management**: Show completed, scheduled, cancelled
4. **Provider Assignment**: Multiple healthcare providers

### Mobile Responsiveness (1 minute)
1. **Responsive Design**: Show mobile and tablet views
2. **Touch Interactions**: Demonstrate mobile-friendly interface

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Features

- **Demo Mode**: Automatic fallback to local data
- **Error Handling**: Graceful degradation
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized for fast loading

## 🚨 Production Readiness

### Current Status: Demo Ready ✅
- ✅ Enhanced demo data (22+ patients, 25+ appointments)
- ✅ Improved error handling and fallbacks
- ✅ Vercel deployment configuration
- ✅ Environment variable management
- ✅ Mobile responsiveness
- ✅ Performance optimizations

### For Production Deployment:
- 🔄 Enable proper TypeScript/ESLint checking
- 🔄 Add comprehensive testing
- 🔄 Implement authentication
- 🔄 Add data validation
- 🔄 Security hardening
- 🔄 Monitoring and logging

## 📞 Support

For demo questions or technical support:
- Review the demo script above
- Check environment configuration
- Verify all dependencies are installed
- Ensure Node.js 18+ is being used

## 📄 License

This project is developed for C4H (Code for Health) initiative.