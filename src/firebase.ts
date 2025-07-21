import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Substitua este objeto pelas suas próprias credenciais do Firebase
// que você copiou do console do Firebase ao registrar o app.
const firebaseConfig = {
  apiKey: "AIzaSyC-vgPlRx7JBvDOaAU5Rz8YzkIYDlWLBg0",
  authDomain: "appmeutreino-6ea19.firebaseapp.com",
  projectId: "appmeutreino-6ea19",
  storageBucket: "appmeutreino-6ea19.firebasestorage.app",
  messagingSenderId: "114739604424",
  appId: "1:114739604424:web:11ef6215471d985f2f2efd",
  measurementId: "G-D5MF8HQD5Q"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar no resto do app
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configura o provedor de login do Google
const provider = new GoogleAuthProvider();

// Função para iniciar o processo de login com o pop-up do Google
export const loginComGoogle = () => {
  return signInWithPopup(auth, provider);
};

// Função para fazer logout
export const logout = () => {
  return signOut(auth);
};