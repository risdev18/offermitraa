import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DriverStatus = 'offline' | 'online' | 'busy'
export type VerificationStatus = 'incomplete' | 'pending' | 'approved' | 'rejected'

export interface Driver {
    id: string
    name: string
    phone: string
    password?: string // Added for Auth
    vehicleNumber?: string // Added for registration
    vehicleType: string
    verificationStatus: VerificationStatus
    documents: Record<string, { status: string, url: string }>
}

export type RideStatus = 'idle' | 'request' | 'navigating' | 'arrived' | 'in_progress' | 'completed'

interface DriverState {
    driver: Driver | null
    status: DriverStatus
    location: { lat: number; lng: number } | null
    // New Ride Props
    rideStatus: RideStatus
    setDriver: (driver: Driver) => void
    setStatus: (status: DriverStatus) => void
    setRideStatus: (status: RideStatus) => void
    updateLocation: (lat: number, lng: number) => void
    logout: () => void
}

export const useDriverStore = create<DriverState>()(
    persist(
        (set) => ({
            driver: null,
            status: 'offline',
            location: null,
            rideStatus: 'idle',
            setDriver: (driver) => set({ driver }),
            setStatus: (status) => set({ status }),
            setRideStatus: (status) => set({ rideStatus: status }),
            updateLocation: (lat, lng) => set({ location: { lat, lng } }),
            logout: () => set({ driver: null, status: 'offline', rideStatus: 'idle' }),
        }),
        {
            name: 'smarth-driver-storage',
        }
    )
)
