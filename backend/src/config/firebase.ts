import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// You should set FIREBASE_SERVICE_ACCOUNT in your .env file
// The value should be the stringified JSON of the service account key
// Or you can put the service account json file in the project and require it.

let firebaseApp: admin.app.App | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized successfully');
    } else {
       console.error('❌ Error: The provided FIREBASE_SERVICE_ACCOUNT JSON appears to be a client config (google-services.json), not a Service Account Key. The backend requires a Service Account Key with a "private_key" field to send notifications.');
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Fallback to Google Application Credentials path
      firebaseApp = admin.initializeApp();
      console.log('Firebase Admin Initialized via GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS not found. Notifications will not work.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export const messaging = firebaseApp ? firebaseApp.messaging() : null;
export default firebaseApp;
