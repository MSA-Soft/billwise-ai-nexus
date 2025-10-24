import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCollections } from '@/hooks/useCollections'

// Mock the database service
const mockDatabaseService = {
  getCollectionsAccounts: vi.fn(),
  createCollectionAccount: vi.fn(),
  updateCollectionAccount: vi.fn(),
  deleteCollectionAccount: vi.fn(),
  getCollectionActivities: vi.fn(),
  createCollectionActivity: vi.fn(),
  updateCollectionActivity: vi.fn(),
  deleteCollectionActivity: vi.fn(),
}

vi.mock('@/services/databaseService', () => ({
  databaseService: mockDatabaseService,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCollections Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch collections accounts on mount', async () => {
    const mockAccounts = [
      {
        id: '1',
        patient_name: 'John Doe',
        current_balance: 1000,
        days_overdue: 30,
        status: 'active',
      },
    ]
    
    mockDatabaseService.getCollectionsAccounts.mockResolvedValue(mockAccounts)
    
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.accounts).toEqual(mockAccounts)
    })
    
    expect(mockDatabaseService.getCollectionsAccounts).toHaveBeenCalled()
  })

  it('should create a new collection account', async () => {
    const newAccount = {
      patient_name: 'Jane Doe',
      current_balance: 500,
      days_overdue: 15,
      status: 'active',
    }
    
    const createdAccount = { id: '2', ...newAccount }
    mockDatabaseService.createCollectionAccount.mockResolvedValue(createdAccount)
    
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.createAccount).toBeDefined()
    })
    
    await result.current.createAccount(newAccount)
    
    expect(mockDatabaseService.createCollectionAccount).toHaveBeenCalledWith(newAccount)
  })

  it('should update a collection account', async () => {
    const updatedData = { status: 'settled' }
    const updatedAccount = { id: '1', ...updatedData }
    
    mockDatabaseService.updateCollectionAccount.mockResolvedValue(updatedAccount)
    
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.updateAccount).toBeDefined()
    })
    
    await result.current.updateAccount('1', updatedData)
    
    expect(mockDatabaseService.updateCollectionAccount).toHaveBeenCalledWith('1', updatedData)
  })

  it('should delete a collection account', async () => {
    mockDatabaseService.deleteCollectionAccount.mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.deleteAccount).toBeDefined()
    })
    
    await result.current.deleteAccount('1')
    
    expect(mockDatabaseService.deleteCollectionAccount).toHaveBeenCalledWith('1')
  })

  it('should handle errors gracefully', async () => {
    const error = new Error('Database error')
    mockDatabaseService.getCollectionsAccounts.mockRejectedValue(error)
    
    const { result } = renderHook(() => useCollections(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })
})
