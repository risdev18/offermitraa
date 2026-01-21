# 🔔 SmarthRides Push Notification Setup Guide

## Overview
This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in SmarthRides.

---

## 📋 Prerequisites
- Firebase project already created ✅
- Firebase config already in `src/lib/firebase.ts` ✅

---

## 🚀 Step-by-Step Setup

### Step 1: Generate VAPID Key in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **smarth-ride-c146e**
3. Click on **Project Settings** (gear icon)
4. Go to **Cloud Messaging** tab
5. Scroll down to **Web Push certificates**
6. Click **Generate key pair**
7. Copy the generated VAPID key

### Step 2: Update the VAPID Key

Open `src/lib/services/pushNotificationService.ts` and replace:

```typescript
vapidKey: 'YOUR_VAPID_KEY_HERE'
```

With your actual VAPID key:

```typescript
vapidKey: 'YOUR_ACTUAL_VAPID_KEY_FROM_FIREBASE'
```

### Step 3: Enable Firebase Cloud Messaging API

1. In Firebase Console, go to **Cloud Messaging** tab
2. Make sure **Firebase Cloud Messaging API** is **enabled**
3. If not enabled, click **Enable** button

### Step 4: Add Notification Icons

Create these icon files in the `public` folder:

- `icon-192x192.png` - App icon (192x192px)
- `badge-72x72.png` - Notification badge (72x72px)

You can use your SmarthRides logo for these.

### Step 5: Register Service Worker

The service worker is already created at `public/firebase-messaging-sw.js`.

To register it, add this to your root layout (`src/app/layout.tsx`):

```typescript
useEffect(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
}, []);
```

### Step 6: Request Permission on Login

Add this to your authentication flow (after successful login):

```typescript
import { requestNotificationPermission } from '@/lib/services/pushNotificationService';

// After user logs in successfully
const userId = user.id; // Get from your auth response
await requestNotificationPermission(userId);
```

### Step 7: Add Toast Component to Layout

Add the `PushNotificationToast` component to your root layout:

```typescript
import PushNotificationToast from '@/components/notifications/PushNotificationToast';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <PushNotificationToast />
            </body>
        </html>
    );
}
```

---

## 🧪 Testing Push Notifications

### Test Locally (Foreground Notifications)

```typescript
import { showLocalNotification, sendRideNotification, NotificationTypes } from '@/lib/services/pushNotificationService';

// Test basic notification
showLocalNotification('Test Title', 'Test message body');

// Test ride notification
sendRideNotification(NotificationTypes.NEW_RIDE_REQUEST, {
    pickupLocation: 'Pune Station',
    dropLocation: 'Hinjewadi Phase 1'
});
```

### Test via Firebase Console

1. Go to Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Enter your FCM token (you'll see it in browser console after requesting permission)
6. Click **Test**

---

## 📱 Notification Types Implemented

### For Drivers:
- ✅ **NEW_RIDE_REQUEST** - When passenger books a ride
- ✅ **RIDE_COMPLETED** - When ride ends
- ✅ **DRIVER_APPROVED** - When admin approves driver
- ✅ **DOCUMENT_REJECTED** - When documents need resubmission

### For Passengers:
- ✅ **RIDE_ACCEPTED** - When driver accepts ride
- ✅ **DRIVER_ARRIVED** - When driver reaches pickup
- ✅ **RIDE_STARTED** - When journey begins
- ✅ **RIDE_COMPLETED** - When ride ends
- ✅ **PAYMENT_RECEIVED** - Payment confirmation

### For Admins:
- ✅ **SYSTEM_ALERT** - Important system notifications

---

## 🔐 Security Best Practices

1. **Never expose VAPID key in client code** - It's okay for web apps
2. **Store FCM tokens securely** - Already saved in Firestore
3. **Validate tokens server-side** - Implement in Cloud Functions
4. **Use HTTPS** - Required for service workers

---

## 🚀 Production Deployment

### Option 1: Send from Backend (Recommended)

Create a Cloud Function to send notifications:

```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';

export const sendNotification = functions.https.onCall(async (data, context) => {
    const { userIds, title, body, type } = data;
    
    // Get FCM tokens from Firestore
    const tokens = await getTokensForUsers(userIds);
    
    const message = {
        notification: { title, body },
        data: { type },
        tokens
    };
    
    return admin.messaging().sendMulticast(message);
});
```

### Option 2: Use Firebase Admin SDK

Install in your backend:

```bash
npm install firebase-admin
```

Send notifications:

```typescript
import admin from 'firebase-admin';

await admin.messaging().send({
    token: userFcmToken,
    notification: {
        title: '🚖 New Ride Request',
        body: 'Pickup: Pune Station'
    },
    data: {
        type: 'new_ride_request',
        rideId: 'ride_123'
    }
});
```

---

## 📊 Monitoring

Track notification delivery in Firebase Console:
1. Go to **Cloud Messaging** → **Reports**
2. View delivery rates, open rates, and errors

---

## 🐛 Troubleshooting

### Notifications not showing?

1. **Check browser permissions**: `chrome://settings/content/notifications`
2. **Verify service worker**: Open DevTools → Application → Service Workers
3. **Check console logs**: Look for FCM token and errors
4. **Test VAPID key**: Make sure it's correctly copied

### Service worker not registering?

1. Must be served over HTTPS (or localhost)
2. Check file path: `/firebase-messaging-sw.js`
3. Clear browser cache and reload

### Token not saving?

1. Check Firestore rules allow writes to `users/{userId}`
2. Verify user is authenticated
3. Check console for errors

---

## ✅ Checklist

- [ ] Generated VAPID key from Firebase Console
- [ ] Updated VAPID key in `pushNotificationService.ts`
- [ ] Enabled Firebase Cloud Messaging API
- [ ] Added notification icons to `public` folder
- [ ] Registered service worker in root layout
- [ ] Added permission request after login
- [ ] Added `PushNotificationToast` component to layout
- [ ] Tested local notifications
- [ ] Tested via Firebase Console
- [ ] Implemented backend notification sending (optional)

---

## 📞 Support

If you need help:
- **Email**: saffarlabs@gmail.com
- **Phone**: +91 84689 43268

---

## 🎉 You're All Set!

Once completed, your SmarthRides app will have:
- ✅ Real-time push notifications
- ✅ Background notification support
- ✅ Beautiful toast UI for foreground notifications
- ✅ Automatic token management
- ✅ Ride-specific notification templates

Happy coding! 🚀🛺
