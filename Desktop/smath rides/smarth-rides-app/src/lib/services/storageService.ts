import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";

export const storageService = {
    /**
     * Converts a File to a compressed Base64 string to fit within Firestore's 1MB limit.
     * Higher-resolution phone photos can be 5MB+, which Firestore rejects.
     */
    async uploadFile(file: File, path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    // Create a canvas to resize the image
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions for verification (Premium but efficient)
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Export as JPEG with 0.6 quality (Good balance for 1MB doc limit)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    console.log("Image compressed and converted to Base64 successfully");
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(new Error("Image Load Failed"));
            };
            reader.onerror = (error) => reject(error);
        });
    },

    // Upload driver document (Now returns compressed Base64 string)
    async uploadDriverDocument(driverId: string, docType: string, file: File): Promise<string> {
        // Enforce basic validation
        if (!file.type.startsWith('image/')) {
            throw new Error("Invalid file type. Please upload an image.");
        }
        return this.uploadFile(file, "");
    }
};
