import admin from 'firebase-admin';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

export function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

// (async () => {
//     const categories = await firestore.collection('categories').get()
//     categories.docs.forEach(async doc => {
//         const data = doc.data()
//         await firestore.collection('categories').doc(doc.id).update({ slug: generateSlug(data.name) })
//         console.log("Updated:", data.slug, generateSlug(data.name))
//     })
// })();

(async () => {
    const categories = await firestore.collection('posts').get()
    categories.docs.forEach(async doc => {
        const data = doc.data()
        await firestore.collection('posts').doc(doc.id).update({ slug: generateSlug(data.title) })
        console.log("Updated:", data.slug, generateSlug(data.title))
    })
})();