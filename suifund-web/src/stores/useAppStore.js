import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentView: 'home',
  currentCampaign: null,
  campaigns: [],
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
  setCampaigns: (campaigns) => set({ campaigns }),
}))