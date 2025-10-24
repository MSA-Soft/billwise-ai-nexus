import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import Auth from '@/pages/Auth'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useToast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form by default', () => {
    render(<Auth />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('switches between sign in and sign up tabs', () => {
    render(<Auth />)
    
    // Click sign up tab
    fireEvent.click(screen.getByText('Sign Up'))
    
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('validates required fields on sign in', async () => {
    render(<Auth />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter email and password',
      })
    })
  })

  it('validates required fields on sign up', async () => {
    render(<Auth />)
    
    // Switch to sign up tab
    fireEvent.click(screen.getByText('Sign Up'))
    
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(signUpButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all fields',
      })
    })
  })

  it('validates password length on sign up', async () => {
    render(<Auth />)
    
    // Switch to sign up tab
    fireEvent.click(screen.getByText('Sign Up'))
    
    // Fill in form with short password
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(signUpButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Password must be at least 6 characters',
      })
    })
  })
})
