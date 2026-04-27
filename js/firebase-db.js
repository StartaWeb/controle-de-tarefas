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

// Nota: persistência offline não habilitada para evitar conflitos em múltiplas abas.

/**
 * DB — Camada de acesso ao Firestore
 * Armazena cada coleção como um único documento na collection "startweb_data"
 * para simplicidade e menor número de operações.
 */
const DB = {
    COLLECTION: 'startweb_data',

    /**
     * Carrega os itens de um documento Firestore.
     * Retorna:
     *   Array com dados → documento existe e tem dados
     *   []              → Firebase conectado mas documento ainda não existe (banco novo)
     *   null            → timeout ou erro (Firebase inacessível)
     */
    async load(docName) {
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

            // Timeout → Firebase inacessível
            if (result === '__timeout__') return null;

            // Documento existe → retornar dados
            if (result.exists) {
                return result.data().items || [];
            }

            // Documento não existe ainda (banco novo/vazio) → [] indica Firebase OK
            return [];
        } catch (err) {
            console.error(`[Firebase] Erro ao carregar "${docName}":`, err);
            return null; // null = Firebase inacessível
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
