/* ===================================================
   Firebase DB — Configuração e operações Firestore
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
const db = firebase.firestore();

// Habilitar persistência offline
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err.code === 'failed-precondition') {
        console.warn('Firebase: persistência offline indisponível (múltiplas abas).');
    } else if (err.code === 'unimplemented') {
        console.warn('Firebase: este navegador não suporta persistência offline.');
    }
});

/**
 * DB — Camada de acesso ao Firestore
 * Armazena cada coleção como um único documento na collection "startweb_data"
 * para simplicidade e menor número de operações.
 */
const DB = {
    COLLECTION: 'startweb_data',

    /**
     * Carrega os itens de um documento Firestore.
     * @param {string} docName - Nome do documento (ex: 'setores')
     * @returns {Array|null} Array de itens ou null se o documento não existir
     */
    async load(docName) {
        try {
            const snap = await db.collection(this.COLLECTION).doc(docName).get();
            if (snap.exists) {
                return snap.data().items || [];
            }
            return null; // null = documento ainda não existe no Firestore
        } catch (err) {
            console.error(`[Firebase] Erro ao carregar "${docName}":`, err);
            return null;
        }
    },

    /**
     * Salva um array de itens em um documento Firestore.
     * @param {string} docName - Nome do documento
     * @param {Array} items - Array de itens a salvar
     */
    async save(docName, items) {
        try {
            await db.collection(this.COLLECTION).doc(docName).set({
                items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.error(`[Firebase] Erro ao salvar "${docName}":`, err);
        }
    },

    /**
     * Verifica se o Firebase está conectado
     */
    isOnline() {
        return navigator.onLine;
    }
};
