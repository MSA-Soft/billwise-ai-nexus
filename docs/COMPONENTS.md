# BillWise AI Nexus Component Documentation

## Overview

This document provides comprehensive documentation for all React components in the BillWise AI Nexus application.

## Component Architecture

The application follows a modular component architecture with clear separation of concerns:

```
src/components/
├── common/           # Reusable common components
├── ui/              # Base UI components (shadcn/ui)
├── forms/           # Form-specific components
├── tables/          # Table components
├── charts/          # Chart components
└── pages/           # Page-level components
```

## Common Components

### AccessibleButton

A button component with built-in accessibility features.

```tsx
import { AccessibleButton } from '@/components/common';

<AccessibleButton
  variant="primary"
  size="md"
  loading={false}
  loadingText="Saving..."
  onClick={handleClick}
>
  Save Changes
</AccessibleButton>
```

**Props:**
- `variant`: Button style variant
- `size`: Button size
- `loading`: Loading state
- `loadingText`: Text shown during loading
- `disabled`: Disabled state
- `aria-label`: Accessibility label

### AccessibleFormField

A form field component with validation and accessibility features.

```tsx
import { AccessibleFormField } from '@/components/common';

<AccessibleFormField
  label="Patient Name"
  name="patientName"
  type="text"
  value={formData.patientName}
  onChange={handleChange}
  required
  error={errors.patientName}
  description="Enter the patient's full name"
/>
```

**Props:**
- `label`: Field label
- `name`: Field name
- `type`: Input type
- `value`: Field value
- `onChange`: Change handler
- `required`: Required field
- `error`: Error message
- `description`: Help text

### ResponsiveTable

A table component that adapts to different screen sizes.

```tsx
import { ResponsiveTable } from '@/components/common';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
];

<ResponsiveTable
  data={patients}
  columns={columns}
  title="Patients"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Form Components

### PatientForm

Form for creating and editing patient records.

```tsx
import { PatientForm } from '@/components/forms/PatientForm';

<PatientForm
  patient={patient}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

**Features:**
- Form validation
- Accessibility support
- Loading states
- Error handling

### BillingStatementForm

Form for creating billing statements.

```tsx
import { BillingStatementForm } from '@/components/forms/BillingStatementForm';

<BillingStatementForm
  patientId={patientId}
  onSubmit={handleSubmit}
/>
```

## Table Components

### PatientsTable

Table for displaying patient data.

```tsx
import { PatientsTable } from '@/components/tables/PatientsTable';

<PatientsTable
  patients={patients}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>
```

### CollectionsTable

Table for displaying collection accounts.

```tsx
import { CollectionsTable } from '@/components/tables/CollectionsTable';

<CollectionsTable
  accounts={accounts}
  onEdit={handleEdit}
  onAddActivity={handleAddActivity}
/>
```

## Chart Components

### RevenueChart

Chart for displaying revenue trends.

```tsx
import { RevenueChart } from '@/components/charts/RevenueChart';

<RevenueChart
  data={revenueData}
  period="monthly"
  height={400}
/>
```

### CollectionsChart

Chart for displaying collection metrics.

```tsx
import { CollectionsChart } from '@/components/charts/CollectionsChart';

<CollectionsChart
  data={collectionsData}
  type="bar"
/>
```

## Page Components

### Dashboard

Main dashboard page component.

```tsx
import { Dashboard } from '@/components/pages/Dashboard';

<Dashboard
  analytics={analytics}
  recentActivity={recentActivity}
/>
```

### PatientManagement

Patient management page.

```tsx
import { PatientManagement } from '@/components/pages/PatientManagement';

<PatientManagement
  patients={patients}
  onPatientSelect={handlePatientSelect}
/>
```

## Layout Components

### Layout

Main application layout with sidebar and header.

```tsx
import { Layout } from '@/components/Layout';

<Layout
  activeTab={activeTab}
  setActiveTab={setActiveTab}
>
  {children}
</Layout>
```

### Sidebar

Navigation sidebar component.

```tsx
import { Sidebar } from '@/components/Sidebar';

<Sidebar
  currentPage={currentPage}
  onPageChange={handlePageChange}
/>
```

## Hooks Integration

All components are designed to work seamlessly with custom hooks:

```tsx
import { useCollections } from '@/hooks/useCollections';
import { CollectionsTable } from '@/components/tables/CollectionsTable';

const CollectionsPage = () => {
  const { accounts, loading, error, createAccount, updateAccount } = useCollections();

  return (
    <CollectionsTable
      accounts={accounts}
      loading={loading}
      error={error}
      onCreate={createAccount}
      onUpdate={updateAccount}
    />
  );
};
```

## Styling

Components use Tailwind CSS for styling with consistent design tokens:

```tsx
// Example component styling
const StyledCard = ({ children, className }) => (
  <div className={cn(
    "bg-white rounded-lg shadow-sm border p-6",
    className
  )}>
    {children}
  </div>
);
```

## Accessibility

All components include accessibility features:

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Testing

Components are tested using React Testing Library:

```tsx
import { render, screen } from '@/test/utils';
import { AccessibleButton } from '@/components/common';

test('renders button with correct text', () => {
  render(<AccessibleButton>Click me</AccessibleButton>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Performance

Components are optimized for performance:

- Lazy loading for heavy components
- Memoization for expensive operations
- Virtual scrolling for large lists
- Code splitting for better bundle sizes

## Best Practices

1. **Props Interface**: Always define TypeScript interfaces for props
2. **Default Props**: Use default props for optional parameters
3. **Error Boundaries**: Wrap components in error boundaries
4. **Loading States**: Include loading and error states
5. **Accessibility**: Follow WCAG 2.1 guidelines
6. **Testing**: Write comprehensive tests
7. **Documentation**: Document all props and usage examples

## Component Lifecycle

Components follow React lifecycle patterns:

1. **Mounting**: Component initialization
2. **Updating**: Props and state changes
3. **Unmounting**: Cleanup and memory management

## State Management

Components use various state management patterns:

- Local state with `useState`
- Global state with Context API
- Server state with React Query
- Form state with React Hook Form

## Error Handling

Components include comprehensive error handling:

- Try-catch blocks for async operations
- Error boundaries for component errors
- User-friendly error messages
- Fallback UI for error states
