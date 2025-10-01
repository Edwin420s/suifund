import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // State
  currentView: 'home',
  currentCampaign: null,
  campaigns: [],
  userCampaigns: [],
  userContributions: [],
  isLoading: false,
  error: null,
  toasts: [],
  transactions: [],

  // Setters
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setUserCampaigns: (userCampaigns) => set({ userCampaigns }),
  setUserContributions: (userContributions) => set({ userContributions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Actions
  addCampaign: (campaign) => set((state) => ({ 
    campaigns: [...state.campaigns, campaign],
    userCampaigns: [...state.userCampaigns, campaign]
  })),
  
  updateCampaign: (updatedCampaign) => set((state) => ({
    campaigns: state.campaigns.map(campaign => 
      campaign.id === updatedCampaign.id ? updatedCampaign : campaign
    ),
    userCampaigns: state.userCampaigns.map(campaign =>
      campaign.id === updatedCampaign.id ? updatedCampaign : campaign
    ),
    currentCampaign: state.currentCampaign?.id === updatedCampaign.id 
      ? updatedCampaign 
      : state.currentCampaign
  })),
  
  addContribution: (campaignId, amount) => set((state) => ({
    campaigns: state.campaigns.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, raised: campaign.raised + amount, backers: campaign.backers + 1 }
        : campaign
    ),
    currentCampaign: state.currentCampaign?.id === campaignId
      ? { ...state.currentCampaign, raised: state.currentCampaign.raised + amount, backers: state.currentCampaign.backers + 1 }
      : state.currentCampaign
  })),

  // Toast management
  addToast: (toast) => set((state) => ({ 
    toasts: [...state.toasts, { ...toast, id: Date.now() }] 
  })),
  
  removeToast: (id) => set((state) => ({ 
    toasts: state.toasts.filter(toast => toast.id !== id) 
  })),

  // Transaction tracking
  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, { ...transaction, id: Date.now(), status: 'pending' }]
  })),

  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map(tx => 
      tx.id === id ? { ...tx, ...updates } : tx
    )
  })),

  // Error handling
  clearError: () => set({ error: null }),

  // Async action wrapper with error handling
  executeAsync: async (asyncFn, options = {}) => {
    const { showLoading = true, successMessage, errorMessage } = options
    
    try {
      if (showLoading) set({ isLoading: true, error: null })
      const result = await asyncFn()
      
      if (successMessage) {
        get().addToast({ message: successMessage, type: 'success' })
      }
      
      return result
    } catch (error) {
      console.error('Async operation failed:', error)
      
      const message = errorMessage || error.message || 'Something went wrong'
      set({ error: message })
      get().addToast({ message, type: 'error' })
      
      throw error
    } finally {
      if (showLoading) set({ isLoading: false })
    }
  }
}))