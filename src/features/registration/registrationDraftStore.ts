import { create } from 'zustand'

interface RegistrationDraft {
  name: string
  email: string
  phone: string
}

interface RegistrationDraftState {
  draft: RegistrationDraft | null
  setDraft: (draft: RegistrationDraft) => void
  clearDraft: () => void
}

export const useRegistrationDraftStore = create<RegistrationDraftState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}))
