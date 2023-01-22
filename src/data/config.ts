import admin from 'firebase-admin';

const serviceAccount = JSON.parse(import.meta.env.FIREBASE_SERVICE_ACCOUNT)

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore()

export default app
export { firestore }
