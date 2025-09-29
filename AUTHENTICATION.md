# Authentication System Documentation

## Overview

This document describes the comprehensive authentication system implemented for Crisp AI Interviews. The system follows industry best practices for security, user experience, and scalability.

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **State Management**: Zustand with persistence
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email/password
- **Password Hashing**: Argon2 (server-side via Supabase)
- **Routing**: React Router v6 with protected routes
- **Form Validation**: React Hook Form + custom validators
- **UI**: Tailwind CSS + Framer Motion

### Security Features
- ✅ Row Level Security (RLS) enabled
- ✅ Secure session management with auto-refresh
- ✅ Client-side rate limiting
- ✅ Input sanitization and XSS prevention
- ✅ Comprehensive form validation
- ✅ Role-based access control (RBAC)
- ✅ Environment variable protection

## File Structure

```
src/
├── features/auth/
│   ├── components/
│   │   ├── AuthLayout.jsx      # Common auth page layout
│   │   ├── LoginForm.jsx       # Login form with validation
│   │   └── SignupForm.jsx      # Registration form
│   ├── hooks/
│   │   └── useAuth.js          # Auth hook with enhanced functionality
│   └── utils/
├── stores/
│   └── authStore.js            # Zustand auth store with persistence
├── lib/
│   ├── supabase.js            # Enhanced Supabase client
│   ├── auth.js                # Validation utilities
│   └── api.js                 # API layer with error handling
├── components/
│   ├── ProtectedRoute.jsx     # Route protection components
│   ├── AppRouter.jsx          # Main router configuration
│   └── ConnectionTest.jsx     # Development connection tester
└── App.jsx                    # Main app with auth initialization
```

## Key Components

### 1. Authentication Store (`src/stores/authStore.js`)
Zustand-based store with the following features:
- Persistent session management
- Real-time auth state updates
- Enhanced error handling
- Role-based utility methods

```javascript
// Usage example
const { signUp, signIn, signOut, user, isAuthenticated } = useAuth();
```

### 2. Protected Routes (`src/components/ProtectedRoute.jsx`)
Three types of route protection:
- `ProtectedRoute`: Requires authentication + optional role checking
- `PublicRoute`: Only accessible to non-authenticated users
- `RoleBasedRoute`: Specific role requirements

### 3. Form Components
- **SignupForm**: Full registration with password strength indicator
- **LoginForm**: Login with forgot password functionality
- **AuthLayout**: Consistent auth page styling with animations

### 4. Validation System (`src/lib/auth.js`)
Comprehensive client-side validation:
- Email format validation (RFC 5322 compliant)
- Password strength checking
- Name and company validation
- Rate limiting protection
- Input sanitization

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development
NODE_ENV=development
```

### Database Setup

Run the provided SQL script in your Supabase SQL Editor to create:
- Users table with proper constraints
- Audit logging system
- Row Level Security policies
- Helpful views and functions
- Indexes for performance

## Usage Examples

### Basic Authentication Flow

```javascript
import useAuth from '@/features/auth/hooks/useAuth';

function MyComponent() {
  const { signIn, signUp, signOut, user, isLoading, error } = useAuth();

  const handleLogin = async (formData) => {
    const result = await signIn(formData);
    if (result.success) {
      // Redirect or update UI
    }
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
}
```

### Protected Route Usage

```javascript
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Interviewer-only route
<ProtectedRoute allowedRoles={['interviewer']}>
  <Dashboard />
</ProtectedRoute>

// Admin-only route
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// Public route (redirect if authenticated)
<PublicRoute redirectTo="/dashboard">
  <LandingPage />
</PublicRoute>
```

### API Usage

```javascript
import { authApi } from '@/lib/api';

// Sign up new user
const result = await authApi.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  metadata: {
    first_name: 'John',
    last_name: 'Doe',
    company: 'Example Corp'
  }
});

// Test database connection
const connectionResult = await dbApi.testConnection();
```

## Security Considerations

### Client-Side Security
1. **Rate Limiting**: Prevents brute force attacks
2. **Input Validation**: Comprehensive form validation
3. **XSS Prevention**: Input sanitization
4. **Secure Storage**: Encrypted session persistence

### Server-Side Security (Supabase)
1. **Row Level Security**: Users can only access their own data
2. **Argon2 Hashing**: Industry-standard password hashing
3. **JWT Tokens**: Secure session management
4. **Audit Logging**: Complete action tracking

### Environment Security
1. **Environment Variables**: Sensitive data protection
2. **CORS Configuration**: Proper origin restrictions
3. **HTTPS Only**: Secure transport layer

## Testing

### Connection Testing
The system includes a development connection tester (`ConnectionTest.jsx`) that shows:
- Database connection status
- Authentication state
- User information
- Error details

### Manual Testing Checklist
- [ ] User registration with email confirmation
- [ ] User login with valid credentials
- [ ] Password reset functionality
- [ ] Route protection (authenticated/unauthenticated)
- [ ] Role-based access control
- [ ] Session persistence across page refreshes
- [ ] Proper error handling and user feedback
- [ ] Rate limiting for auth attempts

## API Endpoints

The system is designed to work with Supabase's built-in auth endpoints:

- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token?grant_type=password` - User login
- `POST /auth/v1/logout` - User logout
- `POST /auth/v1/recover` - Password reset
- `PUT /auth/v1/user` - Update user profile

## Error Handling

The system provides comprehensive error handling:

1. **Network Errors**: Offline detection and retry logic
2. **Validation Errors**: Field-specific error messages
3. **Auth Errors**: User-friendly error translations
4. **Rate Limiting**: Clear timeout messages
5. **Connection Errors**: Database connectivity feedback

## Performance Optimizations

1. **Lazy Loading**: Route-based code splitting
2. **State Persistence**: Zustand with localStorage
3. **Connection Pooling**: Supabase connection management
4. **Debounced Validation**: Real-time form feedback
5. **Optimistic Updates**: Instant UI feedback

## Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Check Connection Status**:
   - Open http://localhost:5173/
   - Check the connection test widget in the bottom-right corner

3. **Test Authentication**:
   - Visit `/signup` to create a test account
   - Visit `/login` to test login functionality
   - Try accessing `/dashboard` to test route protection

## Production Deployment

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup

### Environment Configuration
Ensure production environment variables are set:
- Supabase production URLs and keys
- Proper CORS origins
- Production-grade error logging

## Troubleshooting

### Common Issues

1. **Connection Failures**:
   - Check environment variables
   - Verify Supabase project status
   - Check network connectivity

2. **Authentication Errors**:
   - Verify email confirmation
   - Check password requirements
   - Review rate limiting status

3. **Route Protection Issues**:
   - Check user role assignments
   - Verify session persistence
   - Review route configurations

### Debug Tools
- Connection test widget (development only)
- Browser developer tools console
- Supabase dashboard logs
- Network tab for API calls

## Contributing

When extending the authentication system:

1. Follow existing patterns and conventions
2. Add comprehensive error handling
3. Include proper TypeScript types (when migrated)
4. Add tests for new functionality
5. Update documentation

## License

This authentication system is part of the Crisp AI Interviews project and follows the same licensing terms.