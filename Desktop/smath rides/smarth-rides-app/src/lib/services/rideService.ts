import { db } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    orderBy,
    limit,
    getDoc
} from "@firebase/firestore";

export interface RideRequest {
    id?: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    pickup: {
        address: string;
        lat: number;
        lng: number;
    };
    drop: {
        address: string;
        lat: number;
        lng: number;
    };
    fare: number;
    status: 'pending' | 'accepted' | 'arrived' | 'started' | 'completed' | 'cancelled';
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    createdAt: any;
    otp: string;
}

const RIDES_COLLECTION = "rides";

export const rideService = {
    // Passenger: Create a new ride request
    async createRideRequest(data: Omit<RideRequest, 'id' | 'createdAt' | 'status' | 'otp'>) {
        try {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const docRef = await addDoc(collection(db, RIDES_COLLECTION), {
                ...data,
                status: 'pending',
                otp,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating ride request:", error);
            throw error;
        }
    },

    // Driver: Listen for available rides (pending)
    listenForAvailableRides(callback: (rides: RideRequest[]) => void) {
        const q = query(
            collection(db, RIDES_COLLECTION),
            where("status", "==", "pending"),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
            // Sort client-side to avoid Firestore index requirement
            const sortedRides = rides.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            callback(sortedRides);
        });
    },

    // Driver: Accept a ride
    async acceptRide(rideId: string, driverId: string, driverName: string, driverPhone: string) {
        const rideRef = doc(db, RIDES_COLLECTION, rideId);
        await updateDoc(rideRef, {
            status: 'accepted',
            driverId,
            driverName,
            driverPhone
        });
    },

    // Passenger: Cancel ride
    async cancelRide(rideId: string) {
        const rideRef = doc(db, RIDES_COLLECTION, rideId);
        await updateDoc(rideRef, {
            status: 'cancelled'
        });
    },

    // Driver: Update ride status
    async updateRideStatus(rideId: string, status: RideRequest['status']) {
        const rideRef = doc(db, RIDES_COLLECTION, rideId);
        await updateDoc(rideRef, { status });
    },

    // Passenger/Driver: Listen to a specific ride
    listenToRide(rideId: string, callback: (ride: RideRequest) => void) {
        return onSnapshot(doc(db, RIDES_COLLECTION, rideId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...doc.data() } as RideRequest);
            }
        });
    },

    // Driver: Listen to earnings and stats
    listenToDriverStats(driverId: string, callback: (stats: { today: number, trips: number }) => void) {
        const q = query(
            collection(db, RIDES_COLLECTION),
            where("driverId", "==", driverId),
            where("status", "==", "completed")
        );

        return onSnapshot(q, (snapshot) => {
            let totalEarnings = 0;
            snapshot.docs.forEach(doc => {
                totalEarnings += (doc.data().fare || 0);
            });
            callback({
                today: totalEarnings,
                trips: snapshot.size
            });
        });
    }
};
