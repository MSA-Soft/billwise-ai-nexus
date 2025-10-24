# BillWise AI Nexus - Complete Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://pusaxbvoiplsjflmnnyh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1c2F4YnZvaXBsc2pmbG1ubnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQxNDEsImV4cCI6MjA3NjYxMDE0MX0.Va-Xss-A4mgl7dECObWLMWlb0VwEuTPdPfwmXbEdFbk

# AI Configuration (Optional - for real AI features)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

### 2. Database Setup

**IMPORTANT**: Run this SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of Database/complete-database-setup.sql
-- This will create all tables, relationships, and sample data
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 🔧 Database Schema

The application uses the following main tables:

### Core Tables
- `profiles` - User profiles
- `user_roles` - User role management
- `collections_accounts` - Patient collection accounts
- `collection_activities` - Collection activities and communications
- `billing_statements` - Patient billing statements
- `authorization_requests` - Prior authorization requests
- `payment_plans` - Patient payment plans
- `payment_installments` - Payment plan installments

### Supporting Tables
- `insurance_payers` - Insurance company information
- `billing_cycles` - Billing cycle configurations

## 🏗️ Architecture

### Database Service Layer
- `src/services/databaseService.ts` - Centralized database operations
- All CRUD operations are handled through this service
- Proper error handling and type safety

### Custom Hooks
- `useCollections` - Collections management
- `useBillingStatements` - Billing statements
- `useAuthorizationRequests` - Prior authorizations
- `usePaymentPlans` - Payment plans
- `useAnalytics` - Dashboard analytics

### Components
- All components now use real database data
- Error boundaries for graceful error handling
- Loading states and proper error messages

## 🔒 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Proper policies for data access control
- User-based data isolation

### Environment Variables
- No hardcoded credentials
- Proper environment validation
- Secure API key management

## 🚨 Error Handling

### Error Boundary
- Global error boundary component
- Graceful error recovery
- Development error details

### Database Errors
- Comprehensive error handling in database service
- User-friendly error messages
- Proper error logging

## 📊 Real Data Integration

### No More Mock Data
- All components use real database data
- Live analytics and reporting
- Real-time data updates

### Analytics Dashboard
- Collections analytics
- Billing analytics
- Performance metrics
- Real-time dashboard updates

## 🧪 Testing the Setup

### 1. Check Database Connection
- Navigate to the Collections Management page
- Verify that real data is loaded
- Check that CRUD operations work

### 2. Test Analytics
- Go to the Billing Workflow page
- Verify that analytics show real data
- Check that metrics are calculated correctly

### 3. Test Error Handling
- Try to create invalid data
- Verify that error messages are shown
- Check that the error boundary works

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check your environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY
```

#### 2. Missing Tables
- Run the complete database setup script
- Check Supabase logs for errors
- Verify RLS policies are created

#### 3. Permission Errors
- Check that RLS policies are properly configured
- Verify user authentication
- Check user roles and permissions

#### 4. Type Errors
- Ensure all TypeScript types are properly imported
- Check that database types are up to date
- Verify that all interfaces match the database schema

### Debug Mode
Set `VITE_APP_ENV=development` in your `.env.local` to enable:
- Detailed error messages
- Database query logging
- Development-only features

## 📈 Performance Optimization

### Database Indexes
- All tables have proper indexes
- Query performance is optimized
- Large dataset handling

### React Optimization
- Proper loading states
- Error boundaries
- Efficient re-rendering

## 🔄 Next Steps

### 1. Authentication
- Implement user authentication
- Add login/logout functionality
- Secure API endpoints

### 2. Real-time Features
- WebSocket connections
- Live updates
- Real-time notifications

### 3. Advanced Features
- File uploads
- Email integration
- Payment processing
- Advanced analytics

## 📞 Support

If you encounter any issues:

1. Check the console for errors
2. Verify your environment variables
3. Ensure the database setup script ran successfully
4. Check the Supabase dashboard for any issues

## 🎉 Success!

Once everything is set up correctly, you should see:
- Real data in all components
- Working CRUD operations
- Live analytics dashboard
- Proper error handling
- No more mock data

Your BillWise AI Nexus application is now fully connected to the database with complete CRUD operations!
