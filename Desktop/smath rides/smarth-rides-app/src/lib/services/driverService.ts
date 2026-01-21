import { db } from "../firebase";
import { collection, addDoc, getDocs, onSnapshot, query, where, doc, updateDoc, limit, getDoc } from "@firebase/firestore";

export interface DriverData {
    id?: string;
    name: string;
    phone: string;
    password?: string;
    vehicleNumber: string;
    city: string;
    status: 'pending' | 'approved' | 'rejected' | 'offline' | 'online' | 'incomplete';
    isApproved?: boolean;
    documents: {
        licenseUrl?: string;
        rcBookUrl?: string;
        insuranceUrl?: string;
    };
    createdAt: Date;
    pin?: string;
}

const DRIVERS_COLLECTION = "drivers";

export const driverService = {
    // Add new driver (Registration)
    async addDriver(data: Omit<DriverData, 'id' | 'createdAt' | 'status' | 'documents'>) {
        try {
            const docRef = await addDoc(collection(db, DRIVERS_COLLECTION), {
                ...data,
                status: 'pending',
                documents: {},
                createdAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding driver: ", error);
            throw error;
        }
    },

    // Get all drivers (One-time fetch)
    async getAllDrivers() {
        const querySnapshot = await getDocs(collection(db, DRIVERS_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Check if driver exists by phone
    async getDriverByPhone(phone: string): Promise<DriverData | null> {
        const q = query(collection(db, DRIVERS_COLLECTION), where("phone", "==", phone), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as DriverData;
        }
        return null;
    },

    // Get driver by ID 
    async getDriverById(driverId: string): Promise<DriverData | null> {
        const driverDoc = await getDoc(doc(db, DRIVERS_COLLECTION, driverId));
        if (driverDoc.exists()) {
            return { id: driverDoc.id, ...driverDoc.data() } as DriverData;
        }
        return null;
    },

    // Verify Credentials (Login)
    async verifyCredentials(phone: string, password: string): Promise<DriverData | null> {
        const q = query(collection(db, DRIVERS_COLLECTION), where("phone", "==", phone), where("password", "==", password), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as DriverData;
        }
        return null;
    },

    // Listen for real-time updates (For Admin Dashboard)
    listenToDrivers(callback: (drivers: any[]) => void) {
        const q = query(collection(db, DRIVERS_COLLECTION));
        return onSnapshot(q, (snapshot) => {
            const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(drivers);
        });
    },

    // Update Driver Status (Online/Offline)
    async updateDriverStatus(driverId: string, status: string) {
        const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
        await updateDoc(driverRef, { status });
    },

    // Update Driver Documents
    async updateDriverDocuments(driverId: string, documents: any) {
        const driverRef = doc(db, DRIVERS_COLLECTION, driverId);

        // CRITICAL: Explicitly extract fields to ensure no circular refs or 
        // complex entities (like File pointers) are passed to Firestore.
        const cleanedDocs = {
            licenseUrl: typeof documents.licenseUrl === 'string' ? documents.licenseUrl : "",
            rcBookUrl: typeof documents.rcBookUrl === 'string' ? documents.rcBookUrl : "",
            insuranceUrl: typeof documents.insuranceUrl === 'string' ? documents.insuranceUrl : ""
        };

        await updateDoc(driverRef, {
            documents: cleanedDocs,
            status: 'pending'
        });
    },

    // Approve/Reject Driver (Admin function)
    async verifyDriver(driverId: string, status: 'approved' | 'rejected') {
        const driverRef = doc(db, DRIVERS_COLLECTION, driverId);
        await updateDoc(driverRef, {
            status: status,
            isApproved: status === 'approved'
        });
    }
};
