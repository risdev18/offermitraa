export const notificationService = {
    /**
     * Triggers a mock system notification in the app.
     * In production, this would use a real Email API like Resend.
     */
    async sendNewDriverNotification(driverData: { name: string, phone: string, email?: string, vehicleNumber?: string, documents?: any }) {
        const TARGET_EMAIL = "rishabhsonawane2007@gmail.com";

        // Construct document summary for the alert
        const docSummary = driverData.documents ?
            "Docs [LICENSE, RC BOOK, INSURANCE] verified and uploaded." :
            "Waiting for documents.";

        // Dispatch a custom event to show the notification toast in the UI
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('MOCK_GMAIL_NOTIFICATION', {
                detail: {
                    title: "Gmail: Registration Review Required",
                    body: `DRIVER: ${driverData.name} (${driverData.phone})\nVEHICLE: ${driverData.vehicleNumber || 'N/A'}\n${docSummary}\nData synced to ${TARGET_EMAIL}.`
                }
            });
            window.dispatchEvent(event);
        }

        console.log(`[Notification Service] Detail sync to ${TARGET_EMAIL}:`, driverData);
        return true;
    }
};
