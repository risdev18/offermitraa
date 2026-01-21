import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "@firebase/firestore";

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface UnifiedUser {
    id?: string;
    name: string;
    phone: string;
    password?: string;
    role: UserRole;
    createdAt: any;
    // Driver specific
    vehicleNumber?: string;
    isApproved?: boolean;
    // Passenger specific
    savedLocations?: any[];
}

const COLLECTIONS = {
    passenger: "passengers",
    driver: "drivers",
    admin: "admins"
};

export const authService = {
    // Signup
    async register(data: Omit<UnifiedUser, 'id' | 'createdAt'>) {
        console.log("Starting registration for:", data.phone, "as", data.role);
        try {
            const collectionName = COLLECTIONS[data.role];

            // Check if user already exists in THAT specific collection
            const existing = await authService.getUserByPhone(data.phone, data.role);
            if (existing) throw new Error(`User with this phone number already exists as a ${data.role}.`);

            // Filter out undefined values
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            const payload: any = {
                ...cleanData,
                createdAt: serverTimestamp(),
                isApproved: data.role === 'driver' ? false : true, // Only drivers need manual approval
                status: data.role === 'driver' ? 'incomplete' : 'approved', // Drivers start incomplete
            };

            if (data.role === 'driver') {
                payload.documents = {}; // Empty documents object for drivers
            }

            const registrationPromise = addDoc(collection(db, collectionName), payload);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Registration timed out (30s). Please check your internet connection or Firestore rules.")), 30000)
            );

            const docRef: any = await Promise.race([registrationPromise, timeoutPromise]);
            console.log("Registration Successful in", collectionName, "ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error registering user: ", error);
            throw error;
        }
    },

    // Login
    async login(phoneOrUser: string, password: string, role: UserRole): Promise<UnifiedUser | null> {
        console.log("Login attempt for:", phoneOrUser, "as", role);

        // 1. Check for SPECIAL ADMIN LOGIN
        if (role === 'admin') {
            if (phoneOrUser === "Rishabh@41@45" && password === "5676") {
                return {
                    id: "admin_1",
                    name: "Rishabh Admin",
                    phone: "Rishabh@41@45",
                    role: 'admin',
                    createdAt: new Date()
                };
            }
            return null;
        }

        // 2. Standard Login - Query ONLY the specific collection
        const q = query(
            collection(db, COLLECTIONS[role]),
            where("phone", "==", phoneOrUser),
            where("password", "==", password),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as UnifiedUser;
        }

        return null;
    },

    // Fetch user by phone within a specific role
    async getUserByPhone(phone: string, role: UserRole): Promise<UnifiedUser | null> {
        const q = query(collection(db, COLLECTIONS[role]), where("phone", "==", phone), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as UnifiedUser;
        }
        return null;
    }
};
