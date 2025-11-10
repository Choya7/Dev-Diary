// 간단한 localStorage 기반 인증 (데모용)
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    alert('로그아웃되었습니다.');
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-password-confirm').value;

            if (password !== confirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                alert('이미 가입된 이메일입니다.');
                return;
            }

            const newUser = { id: Date.now(), name, email, password };
            users.push(newUser);
            saveUsers(users);
            setCurrentUser({ id: newUser.id, name, email });
            alert('회원가입이 완료되었습니다.');
            window.location.href = './login.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                alert('이메일 또는 비밀번호가 올바르지 않습니다.');
                return;
            }

            setCurrentUser({ id: user.id, name: user.name, email: user.email });
            alert('로그인 성공!');
            window.location.href = '../index.html';
        });
    }
});


