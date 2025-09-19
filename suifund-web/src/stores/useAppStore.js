import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentView: 'home',
  currentCampaign: null,
  campaigns: [],
  userCampaigns: [],
  userContributions: [],
  isLoading: false,
  
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setUserCampaigns: (userCampaigns) => set({ userCampaigns }),
  setUserContributions: (userContributions) => set({ userContributions }),
  setLoading: (isLoading) => set({ isLoading }),
  
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
  }))
}))