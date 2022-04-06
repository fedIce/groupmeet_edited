import * as firebase from 'firebase';
import * as c from '../constants/store/utils/constanats'
import 'firebase/firestore';

// Initialize Firebase
const config = {
    apiKey: c.FIREBASE_API_KEY,
    authDomain: c.FIREBASE_AUTH_DOMAIN,
    databaseURL: c.FIREBASE_DATABASE_URL,
    projectId: c.FIREBASE_PROJECT_ID,
    storageBucket: c.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: c.FIREBASE_MESSAGING_SENDER_ID,
    appID: c.FIREBASE_PROJECT_ID,
    measurementId: c.FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(config);
firebase.firestore();


export const database = firebase.database();
export const auth = firebase.auth();
export const uid = async () => { return await firebase.auth().currentUser.uid }
export const provider = new firebase.auth.FacebookAuthProvider();
export const storage = firebase.storage();
export default firebase
