// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBxzz7cNapozDrO-wlyodwD5lwi6lU9kIU",
    authDomain: "smarth-ride-c146e.firebaseapp.com",
    projectId: "smarth-ride-c146e",
    storageBucket: "smarth-ride-c146e.firebasestorage.app",
    messagingSenderId: "221137767728",
    appId: "1:221137767728:web:39a2a5c518d981a81e8cf5",
    measurementId: "G-5GCBQ8PJBY"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'SmarthRides Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.type || 'general',
        data: payload.data,
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        // Open the app or focus existing window
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window open
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // If no window is open, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});
