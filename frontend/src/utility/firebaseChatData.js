import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app,"chat-data");

export { db };