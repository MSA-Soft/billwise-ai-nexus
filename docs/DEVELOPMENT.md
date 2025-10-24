# BillWise AI Nexus Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Code editor (VS Code recommended)
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/billwise-ai-nexus.git
   cd billwise-ai-nexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components
│   ├── forms/          # Form components
│   ├── tables/         # Table components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── contexts/           # React contexts
├── pages/              # Page components
└── test/               # Test files
```

## Development Workflow

### 1. Feature Development

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Write tests for your changes:
   ```bash
   npm run test
   ```

4. Run linting and formatting:
   ```bash
   npm run lint
   npm run format
   ```

5. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### 2. Code Standards

#### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` type, use `unknown` instead

```tsx
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Bad
const user: any = { id: 1, name: 'John' };
```

#### React Components

- Use functional components with hooks
- Implement proper prop types
- Use memo for performance optimization
- Follow single responsibility principle

```tsx
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="btn"
    >
      {children}
    </button>
  );
};
```

#### Styling

- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use consistent spacing and colors
- Implement dark mode support

```tsx
// Good
<div className="flex flex-col space-y-4 p-6 bg-white dark:bg-gray-800">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### 3. Testing

#### Unit Tests

Write unit tests for all components and utilities:

```tsx
import { render, screen } from '@/test/utils';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

#### Integration Tests

Test component interactions:

```tsx
import { render, screen, fireEvent } from '@/test/utils';
import { PatientForm } from '@/components/PatientForm';

describe('PatientForm Integration', () => {
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<PatientForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe'
      });
    });
  });
});
```

### 4. Performance

#### Code Splitting

Use lazy loading for heavy components:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

#### Memoization

Use React.memo and useMemo for performance:

```tsx
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  return <div>{processedData}</div>;
});
```

### 5. Accessibility

#### ARIA Labels

Always include proper ARIA labels:

```tsx
<button 
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  ×
</button>
```

#### Keyboard Navigation

Implement keyboard navigation:

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const Component = () => {
  useKeyboardNavigation({
    onEnter: handleSubmit,
    onEscape: handleCancel,
  });
  
  return <div>Content</div>;
};
```

#### Screen Reader Support

Use semantic HTML and proper headings:

```tsx
<main>
  <h1>Page Title</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Section Title</h2>
    <p>Content</p>
  </section>
</main>
```

## Database Development

### 1. Schema Changes

1. Create migration files:
   ```sql
   -- migrations/001_add_patient_table.sql
   CREATE TABLE patients (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     first_name TEXT NOT NULL,
     last_name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. Run migrations:
   ```bash
   supabase db push
   ```

### 2. Data Seeding

Create seed data for development:

```sql
-- seed-data.sql
INSERT INTO patients (first_name, last_name) VALUES
  ('John', 'Doe'),
  ('Jane', 'Smith');
```

### 3. RLS Policies

Implement Row Level Security:

```sql
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (auth.uid() = user_id);
```

## API Development

### 1. Service Layer

Create service functions for API calls:

```tsx
// services/patientService.ts
export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    
    if (error) throw error;
    return data;
  },
  
  async createPatient(patient: CreatePatientData): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### 2. Custom Hooks

Create hooks for data management:

```tsx
// hooks/usePatients.ts
export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, loading, error, refetch: fetchPatients };
};
```

## Debugging

### 1. Development Tools

Use React Developer Tools and browser dev tools:

```tsx
// Add debug logging
const Component = () => {
  useEffect(() => {
    console.log('Component mounted');
  }, []);
  
  return <div>Content</div>;
};
```

### 2. Error Boundaries

Implement error boundaries for error handling:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
);
```

### 3. Performance Profiling

Use React Profiler for performance analysis:

```tsx
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
};

<Profiler id="Component" onRender={onRenderCallback}>
  <YourComponent />
</Profiler>
```

## Deployment

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance optimized
- [ ] Accessibility tested

### 2. Build Process

```bash
# Run tests
npm run test:run

# Build for production
npm run build

# Preview build
npm run preview
```

### 3. Environment Configuration

Set up different environments:

```env
# .env.development
VITE_APP_ENV=development
VITE_SUPABASE_URL=your_dev_url

# .env.production
VITE_APP_ENV=production
VITE_SUPABASE_URL=your_prod_url
```

## Contributing

### 1. Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Run all checks
4. Create pull request
5. Address review feedback
6. Merge after approval

### 2. Code Review Guidelines

- Check for security vulnerabilities
- Verify test coverage
- Ensure accessibility compliance
- Review performance implications
- Validate error handling

### 3. Documentation

- Update README for new features
- Document API changes
- Add component documentation
- Update deployment guides

## Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version and dependencies
2. **Type Errors**: Verify TypeScript configuration
3. **Test Failures**: Check test environment setup
4. **Database Issues**: Verify Supabase connection

### Getting Help

- Check existing issues on GitHub
- Review documentation
- Ask questions in team chat
- Create detailed bug reports
