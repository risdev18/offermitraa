import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
    id: string
    name: string
    phone: string
    role: 'passenger' | 'driver' | 'admin'
    password?: string
    vehicleNumber?: string
    isApproved?: boolean
    status?: 'pending' | 'approved' | 'rejected' | 'incomplete' | 'offline' | 'online'
    items?: any[]
}

interface UserState {
    user: User | null
    language: string | null
    setUser: (user: User | null) => void
    setLanguage: (lang: string) => void
    logout: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            language: 'en',
            setUser: (user) => set({ user }),
            setLanguage: (lang) => set({ language: lang }),
            logout: () => {
                set({ user: null });
                // Aggressive cleanup
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user-storage');
                    localStorage.removeItem('smarth-driver-storage');
                    sessionStorage.clear();
                    window.location.href = "/";
                }
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
