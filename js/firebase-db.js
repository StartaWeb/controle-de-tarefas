/* ===================================================
   Firebase DB — Configuração, Auth Anônima e Firestore
   =================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyBSDR7PIMpM4yh8rcydAtbXHub3edYKrf8",
    authDomain: "startweb-tarefas.firebaseapp.com",
    projectId: "startweb-tarefas",
    storageBucket: "startweb-tarefas.firebasestorage.app",
    messagingSenderId: "211694947881",
    appId: "1:211694947881:web:89607b9ae4f488152b1638",
    measurementId: "G-5SLD1QCNBL"
};

// Inicializar Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db         = firebase.firestore();
const auth       = firebase.auth();

/**
 * authReady — Promise que resolve quando o estado de autenticação for determinado.
 */
const authReady = new Promise((resolve) => {
    // Observar mudança de estado de autenticação
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            console.log(`[Firebase Auth] Autenticado: ${user.email} (UID: ${user.uid})`);
            resolve(user);
        } else {
            console.log('[Firebase Auth] Nenhum usuário logado.');
            resolve(null);
        }
        unsubscribe(); // Resolvemos a promise na primeira verificação
    });
});

/**
 * DB — Camada de acesso ao Firestore
 * Cada coleção é armazenada como um único documento com array "items".
 *
 * Retorno de DB.load():
 *   Array   → documento existe com dados
 *   []      → Firebase OK, documento não existe ainda (banco novo)
 *   null    → timeout ou erro (Firebase inacessível / sem auth)
 */
const DB = {
    COLLECTION: 'startweb_data',

    async load(docName) {
        // Aguardar autenticação antes de acessar o banco
        await authReady;

        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => {
                console.warn(`[Firebase] Timeout ao carregar "${docName}" — usando fallback.`);
                resolve('__timeout__');
            }, 8000)
        );

        try {
            const result = await Promise.race([
                db.collection(this.COLLECTION).doc(docName).get(),
                timeoutPromise
            ]);

            if (result === '__timeout__') return null;

            if (result.exists) {
                return result.data().items || [];
            }

            return []; // Documento não existe ainda — Firebase OK
        } catch (err) {
            console.error(`[Firebase] Erro ao carregar "${docName}":`, err);
            return null;
        }
    },

    async save(docName, items) {
        // Aguardar autenticação antes de salvar
        await authReady;

        try {
            await db.collection(this.COLLECTION).doc(docName).set({
                items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.error(`[Firebase] Erro ao salvar "${docName}":`, err);
        }
    },

    isOnline() {
        return navigator.onLine;
    }
};
