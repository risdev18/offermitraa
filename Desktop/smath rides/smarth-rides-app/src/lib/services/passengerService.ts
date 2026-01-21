import { db } from "../firebase";
import { collection, addDoc, getDocs, onSnapshot, query, where, doc, updateDoc, limit } from "@firebase/firestore";

export interface PassengerData {
    id?: string;
    name: string;
    phone: string;
    password?: string;
    createdAt: Date;
    savedLocations?: any[];
}

const PASSENGERS_COLLECTION = "passengers";

export const passengerService = {
    // Add new passenger (Registration)
    async addPassenger(data: Omit<PassengerData, 'id' | 'createdAt'>) {
        try {
            const docRef = await addDoc(collection(db, PASSENGERS_COLLECTION), {
                ...data,
                createdAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding passenger: ", error);
            throw error;
        }
    },

    // Check if passenger exists by phone
    async getPassengerByPhone(phone: string): Promise<PassengerData | null> {
        const q = query(collection(db, PASSENGERS_COLLECTION), where("phone", "==", phone), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as PassengerData;
        }
        return null;
    },

    // Verify Credentials (Login)
    async verifyCredentials(phone: string, password: string): Promise<PassengerData | null> {
        const q = query(
            collection(db, PASSENGERS_COLLECTION),
            where("phone", "==", phone),
            where("password", "==", password),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as PassengerData;
        }
        return null;
    }
};
