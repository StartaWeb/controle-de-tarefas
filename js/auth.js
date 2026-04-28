/* ===================================================
   StartWeb — Autenticação (Login/Registro)
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const linkRegister = document.getElementById('link-register');
    const linkLogin = document.getElementById('link-login');
    const authError = document.getElementById('auth-error');

    // Inicializa Data para poder usar Data.addPessoa (no registro do admin)
    Data.init();

    let isRegistering = false;

    // Redireciona se já estiver logado (e não estiver no meio do registro)
    auth.onAuthStateChanged(user => {
        if (user && !isRegistering) {
            window.location.href = 'index.html';
        }
    });

    // Alternar entre forms
    if (linkRegister) {
        linkRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            document.getElementById('form-title').textContent = 'Criar Administrador';
            document.getElementById('form-subtitle').textContent = 'Crie a primeira conta do sistema.';
            hideError();
        });
    }

    if (linkLogin) {
        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            document.getElementById('form-title').textContent = 'Acesse sua conta';
            document.getElementById('form-subtitle').textContent = 'Gerencie suas tarefas e prazos.';
            hideError();
        });
    }

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');

        try {
            setLoading(btn, true, 'Entrando...');
            await auth.signInWithEmailAndPassword(email, password);
            // onAuthStateChanged cuidará do redirecionamento
        } catch (err) {
            showError('E-mail ou senha incorretos.');
            setLoading(btn, false, 'Entrar no Sistema');
        }
    });

    // Registro do Primeiro Admin
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('reg-nome').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const btn = document.getElementById('btn-register');

        try {
            isRegistering = true;
            setLoading(btn, true, 'Criando...');

            // 1. Criar usuário no Firebase Auth
            const userCred = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCred.user;

            // 2. Salvar na collection 'usuarios'
            await db.collection('usuarios').doc(user.uid).set({
                email: email,
                perfil: 'admin',
                nome: nome,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 3. Criar uma "Pessoa" associada a este usuário
            await Data.syncFirebase(); // Sincroniza para garantir que não sobrescrevemos dados da nuvem ao salvar
            Data.addPessoa({ nome: nome, cargo: 'Administrador', setor: '', email: email, uid: user.uid });
            // Redirecionamento manual após garantir que tudo salvou
            window.location.href = 'index.html';
        } catch (err) {
            isRegistering = false;
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                showError('Este e-mail já está em uso.');
            } else if (err.code === 'auth/weak-password') {
                showError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                showError('Erro ao criar conta. Tente novamente.');
            }
            setLoading(btn, false, 'Criar Conta de Administrador');
        }
    });

    function showError(msg) {
        authError.textContent = msg;
        authError.style.display = 'block';
    }

    function hideError() {
        authError.style.display = 'none';
    }

    function setLoading(btn, isLoading, text) {
        btn.disabled = isLoading;
        btn.textContent = text;
        if (isLoading) {
            btn.style.opacity = '0.7';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
});
