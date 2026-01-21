import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, writeBatch } from "@firebase/firestore";

export const dataPurgeService = {
    /**
     * Purges all data from specific collections to start fresh.
     * WARNING: This is a destructive operation.
     */
    async clearAllAppData() {
        const collectionsToClear = ["rides", "drivers", "passengers", "admins"];

        console.log("Starting full data purge...");
        const batch = writeBatch(db);

        for (const collName of collectionsToClear) {
            try {
                const snapshot = await getDocs(collection(db, collName));
                console.log(`Clearing ${snapshot.size} documents from ${collName}...`);

                snapshot.docs.forEach((document) => {
                    batch.delete(doc(db, collName, document.id));
                });
            } catch (error) {
                console.error(`Error fetching collection ${collName}:`, error);
            }
        }

        await batch.commit();
        console.log("Full data purge complete. Systems reset.");

        // Re-initialize clean admin if needed (Optional: Logic can be added here)
        return true;
    }
};
