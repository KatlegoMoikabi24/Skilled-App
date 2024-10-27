import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyAA5fHv4TaqaCl0yt5Lz0vO6zYSHSt5fdk',
    authDomain: 'skill-led-app.firebaseapp.com',
    projectId: 'skill-led-app',
    storageBucket: 'skill-led-app.appspot.com',
    messagingSenderId: '756650331201',
    appId: '1:756650331201:web:65cf92fcfff1ef85584ac0',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
