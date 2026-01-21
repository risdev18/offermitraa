import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { db } from './firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

let messaging: Messaging | null = null;

// Initialize Firebase Messaging
export const initializeMessaging = () => {
    if (typeof window === 'undefined') return null;

    try {
        const { app } = require('./firebase');
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Error initializing messaging:', error);
        return null;
    }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Initialize messaging if not already done
        if (!messaging) {
            messaging = initializeMessaging();
        }

        if (!messaging) {
            console.error('Failed to initialize messaging');
            return null;
        }

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY_HERE' // You'll need to generate this in Firebase Console
        });

        if (token) {
            console.log('FCM Token obtained:', token);

            // Save token to Firestore
            await saveTokenToDatabase(userId, token);

            return token;
        } else {
            console.log('No registration token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

/**
 * Save FCM token to user's document in Firestore
 */
const saveTokenToDatabase = async (userId: string, token: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdatedAt: new Date().toISOString()
        });
        console.log('FCM token saved to database');
    } catch (error) {
        console.error('Error saving token to database:', error);
    }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) {
        messaging = initializeMessaging();
    }

    if (!messaging) {
        console.error('Messaging not initialized');
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        callback(payload);
    });
};

/**
 * Send notification to specific user(s)
 * This should be called from your backend/Cloud Functions
 */
export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, any>;
    userIds: string[];
}

/**
 * Trigger local notification (for testing)
 */
export const showLocalNotification = (title: string, body: string, data?: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: data?.type || 'general',
            data,
            vibrate: [200, 100, 200],
            requireInteraction: data?.requireInteraction || false
        });

        notification.onclick = () => {
            window.focus();
            notification.close();

            // Handle notification click based on type
            if (data?.url) {
                window.location.href = data.url;
            }
        };

        return notification;
    }
    return null;
};

/**
 * Notification types for SmarthRides
 */
export const NotificationTypes = {
    NEW_RIDE_REQUEST: 'new_ride_request',
    RIDE_ACCEPTED: 'ride_accepted',
    RIDE_STARTED: 'ride_started',
    RIDE_COMPLETED: 'ride_completed',
    DRIVER_ARRIVED: 'driver_arrived',
    PAYMENT_RECEIVED: 'payment_received',
    DRIVER_APPROVED: 'driver_approved',
    DOCUMENT_REJECTED: 'document_rejected',
    SYSTEM_ALERT: 'system_alert'
} as const;

/**
 * Send ride-specific notifications
 */
export const sendRideNotification = (type: string, data: any) => {
    const notifications = {
        [NotificationTypes.NEW_RIDE_REQUEST]: {
            title: '🚖 New Ride Request!',
            body: `Pickup: ${data.pickupLocation}\nDestination: ${data.dropLocation}`,
            url: '/driver/dashboard'
        },
        [NotificationTypes.RIDE_ACCEPTED]: {
            title: '✅ Ride Accepted!',
            body: `Driver ${data.driverName} is on the way`,
            url: '/passenger/tracking'
        },
        [NotificationTypes.DRIVER_ARRIVED]: {
            title: '📍 Driver Arrived',
            body: `${data.driverName} has arrived at pickup location`,
            url: '/passenger/tracking'
        },
        [NotificationTypes.RIDE_STARTED]: {
            title: '🚗 Ride Started',
            body: 'Your journey has begun. Track live location.',
            url: '/passenger/tracking'
        },
        [NotificationTypes.RIDE_COMPLETED]: {
            title: '🎉 Ride Completed',
            body: `Fare: ₹${data.fare}. Thank you for riding with us!`,
            url: '/passenger/payment'
        },
        [NotificationTypes.DRIVER_APPROVED]: {
            title: '✅ Driver Approved!',
            body: 'Congratulations! You can now start accepting rides.',
            url: '/driver/dashboard'
        },
        [NotificationTypes.DOCUMENT_REJECTED]: {
            title: '⚠️ Document Issue',
            body: `${data.documentType} needs resubmission. Check details.`,
            url: '/driver/documents'
        }
    };

    const notification = notifications[type as keyof typeof notifications];

    if (notification) {
        showLocalNotification(notification.title, notification.body, {
            type,
            url: notification.url,
            ...data
        });
    }
};
