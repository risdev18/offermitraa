export interface Coordinates {
    lat: number
    lng: number
}

// Haversine formula to calculate distance in km
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lng - coord1.lng)
    const lat1 = toRad(coord1.lat)
    const lat2 = toRad(coord2.lat)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(val: number): number {
    return (val * Math.PI) / 180
}

export interface DriverCandidate {
    id: string
    location: Coordinates
    rating: number
    lastActiveTime: number // Timestamp
    status: 'online' | 'busy' | 'offline'
    verificationStatus: 'approved' | 'pending' | 'rejected' | 'incomplete'
}

// Sort drivers by: Distance -> Rating -> Idle Time
export function findNearbyDrivers(
    passengerLocation: Coordinates,
    drivers: DriverCandidate[],
    radiusKm: number = 5
): DriverCandidate[] {
    // 1. Filter by radius, status, and verification
    const eligibleDrivers = drivers.filter((driver) => {
        if (driver.status !== 'online') return false
        if (driver.verificationStatus !== 'approved') return false
        const dist = calculateDistance(passengerLocation, driver.location)
        return dist <= radiusKm
    })

    // 2. Sort
    return eligibleDrivers.sort((a, b) => {
        const distA = calculateDistance(passengerLocation, a.location)
        const distB = calculateDistance(passengerLocation, b.location)

        // Primary: Distance (Ascending)
        if (Math.abs(distA - distB) > 0.1) {
            return distA - distB
        }

        // Secondary: Rating (Descending)
        if (a.rating !== b.rating) {
            return b.rating - a.rating
        }

        // Tertiary: Idle Time (Ascending - longer idle time first? No, Plan says "Idle time (fair distribution)")
        // Actually typically longer idle time = higher priority. If 'lastActiveTime' is "when they finished last ride", smaller timestamp = longer idle.
        return a.lastActiveTime - b.lastActiveTime
    })
}
