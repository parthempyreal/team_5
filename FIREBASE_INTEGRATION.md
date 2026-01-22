# Firebase Notification Integration Guide

This guide explains how to complete the Firebase Cloud Messaging (FCM) integration for the SmartHire application.

## 1. Backend Configuration (Sending Notifications)

The backend has been updated to support sending push notifications using `firebase-admin`.

### Prerequisites
To enable the backend to send notifications, you need to provide the Firebase Service Account credentials.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **smarthire-application**.
3. Go to **Project Settings** > **Service accounts**.
4. Click **Generate new private key**.
5. Save the JSON file.

### Setup Options
You have two options to configure the backend:

**Option A: Environment Variable (Recommended for Production)**
1. Open the JSON file you downloaded.
2. Minify/Stringify the content (remove newlines).
3. Add it to your `.env` file in the `backend` directory:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
   ```

**Option B: File Path (Dev/Local)**
1. Place the JSON file in `backend/src/config/` (e.g., `service-account.json`).
2. Set `GOOGLE_APPLICATION_CREDENTIALS` in your `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./src/config/service-account.json"
   ```

## 2. Mobile App Configuration (Receiving Notifications)

The `google-services.json` file you provided is for the Android client.

### React Native Setup
1. Place `google-services.json` in `android/app/`.
2. Install dependencies:
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```
3. Configure `android/build.gradle` and `android/app/build.gradle` as per React Native Firebase documentation.

### Client-Side Implementation
Add this logic to your root component (e.g., `App.js`) to handle tokens and notifications:

```javascript
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

async function getFcmToken() {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
      // Send token to backend
      updateBackendToken(fcmToken);
    }
  } catch (error) {
    console.log('Failed to get FCM token:', error);
  }
}

// Update backend with new token
async function updateBackendToken(fcmToken) {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (!accessToken) return;

  try {
    await fetch('http://YOUR_BACKEND_URL/api/auth/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
  } catch (error) {
    console.error('Error updating backend token:', error);
  }
}

// Listen for token refresh
messaging().onTokenRefresh(token => {
  updateBackendToken(token);
});
```

## 3. Testing

1. Start the backend server.
2. Login from the mobile app.
3. Check the database; the User document should now have an `fcmToken` field.
4. You can manually trigger a notification using the `NotificationService` in the backend code or via a test script.
