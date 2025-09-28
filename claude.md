# Crisp - AI-Powered Interview Assistant

## Project Overview
React app with AI-powered interview capabilities. Two-tab system: Interviewee (chat) + Interviewer (dashboard). Role-based access with invitation codes.

## Tech Stack
- **Frontend**: React + Vite, Shadcn/ui + Tailwind CSS, Zustand (state), React Hook Form
- **Backend**: Vercel Serverless Functions (BFF pattern)
- **Database**: Supabase PostgreSQL
- **Auth**: Argon2 password hashing
- **Deployment**: Vercel/Netlify

## Architecture Decisions
- **BFF Pattern**: API keys stay server-side, never exposed to client
- **RBAC**: Interviewer creates sessions, generates access codes for candidates
- **No Candidate Accounts**: Streamlined experience via access codes
- **Local Persistence**: Restore progress on refresh

## Design System

### Color Palette
```css
/* Primary Brand Colors */
--primary-600: #2563eb;    /* Main brand blue */
--primary-500: #3b82f6;    /* Interactive blue */
--primary-400: #60a5fa;    /* Hover states */

/* Semantic Colors */
--success-500: #10b981;    /* Success states */
--warning-500: #f59e0b;    /* Warning states */
--error-500: #ef4444;      /* Error states */
--info-500: #06b6d4;       /* Info states */

/* Neutral Scale */
--gray-50: #f9fafb;        /* Lightest backgrounds */
--gray-100: #f3f4f6;       /* Light backgrounds */
--gray-900: #111827;       /* Dark text */
--gray-800: #1f2937;       /* Secondary dark text */
```

### Typography Scale
- **Headings**: Inter font, weights 600-700
- **Body**: Inter font, weights 400-500
- **Code/Mono**: JetBrains Mono

### Component Standards
- **Spacing**: 4px base unit (4, 8, 12, 16, 20, 24, 32, 48, 64px)
- **Border Radius**: 6px (sm), 8px (md), 12px (lg)
- **Shadows**: Subtle depth with 3-level system

## Key Features

### Interviewer Flow
1. Sign up/Login → Dashboard
2. Create interview session (candidate name/email)
3. Generate unique access code (CRISP-XXXX-XXXX format)
4. Send code to candidate
5. Monitor interview progress & view results

### Candidate Flow
1. Receive access code from interviewer
2. Enter code on landing page
3. Upload resume (PDF/DOCX) → Extract name/email/phone
4. AI chatbot collects missing info
5. Complete timed interview (6 questions: 2 Easy, 2 Medium, 2 Hard)

### Technical Requirements
- **Data Persistence**: localStorage for session recovery
- **Welcome Back Modal**: Resume incomplete sessions
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: System preference + manual toggle

## Database Schema

### Users Table
```sql
id (uuid, primary key)
email (varchar, unique)
password_hash (varchar)
role (enum: 'interviewer')
created_at (timestamp)
```

### Interview Sessions Table
```sql
id (uuid, primary key)
interviewer_id (uuid, foreign key)
candidate_name (varchar)
candidate_email (varchar)
access_code (varchar, unique)
status (enum: 'pending', 'in_progress', 'completed')
score (integer, nullable)
created_at (timestamp)
```

### Interview Responses Table
```sql
id (uuid, primary key)
session_id (uuid, foreign key)
question_text (text)
candidate_answer (text)
ai_feedback (text)
difficulty (enum: 'easy', 'medium', 'hard')
score (integer)
created_at (timestamp)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Interviewer registration
- `POST /api/auth/login` - Interviewer login
- `POST /api/auth/validate-code` - Validate candidate access code

### Interview Management
- `POST /api/interviews` - Create interview session
- `GET /api/interviews` - List interviewer's sessions
- `GET /api/interviews/:id` - Get session details
- `POST /api/interviews/:id/start` - Begin candidate interview

### AI Integration
- `POST /api/ai/generate-question` - Get next interview question
- `POST /api/ai/evaluate-answer` - Score candidate response
- `POST /api/ai/generate-summary` - Create final interview summary

## Development Phases

### Phase 1: Foundation ✅
- Project setup, folder structure, testing config

### Phase 2: Authentication (Current)
- Interviewer signup/login with proper theming
- Dark/light mode implementation
- Form validation with shadcn/ui components

### Phase 3: Interview Management
- Dashboard with session creation
- Access code generation
- Session status tracking

### Phase 4: Candidate Experience
- Code validation & resume upload
- AI question generation & response evaluation
- Progress tracking & completion

### Phase 5: Polish & Deploy
- Performance optimization
- Testing coverage
- Production deployment

## Code Standards

### File Organization
```
src/
├── components/ui/          # Shadcn/ui components
├── features/
│   ├── auth/              # Authentication feature
│   ├── dashboard/         # Interviewer dashboard
│   └── interview/         # Interview experience
├── lib/                   # Utilities & config
├── stores/               # Zustand stores
└── styles/               # Global styles & themes
```

### Component Patterns
- Use React Hook Form for all forms
- Implement proper loading & error states
- Follow shadcn/ui patterns for consistency
- Use Zustand for cross-component state

### Styling Guidelines
- Tailwind utility-first approach
- CSS variables for theme consistency
- Responsive design with mobile-first
- Dark mode support via CSS variables

## Environment Variables
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key (server-side only)
```

## Current Implementation Status
- Project initialized with Vite + React
- Planned backend signup API endpoint
- Basic SignupForm component structure
- Ready to implement theming & shadcn/ui integration