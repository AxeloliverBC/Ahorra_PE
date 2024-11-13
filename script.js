// Gestión de usuarios y datos
let currentUser = null;
let userBalance = 0;
let goals = [];
const users = [];

// Elementos DOM
const authPages = document.getElementById('auth-pages');
const appContent = document.getElementById('app-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const balanceDisplay = document.getElementById('total-balance');

// Navegación
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Funciones de autenticación
function register(e) {
    e.preventDefault();
    const form = e.target;
    const name = form[0].value;
    const email = form[1].value;
    const password = form[2].value;
    
    if (users.find(u => u.email === email)) {
        alert('Este correo ya está registrado');
        return;
    }

    users.push({ name, email, password, balance: 0, goals: [] });
    showLoginPage();
    form.reset();
}

function login(e) {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        userName.textContent = user.name;
        balanceDisplay.textContent = user.balance.toFixed(2);
        showApp();
        loadGoals();
        e.target.reset();
    } else {
        alert('Credenciales incorrectas');
    }
}

// Navegación y UI
function showLoginPage() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('register-page').classList.remove('active');
}

function showRegisterPage() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('register-page').classList.add('active');
}

function showApp() {
    authPages.classList.add('hidden');
    appContent.classList.remove('hidden');
    showPage('home');
}

function logout() {
    currentUser = null;
    authPages.classList.remove('hidden');
    appContent.classList.add('hidden');
    showLoginPage();
}

function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${pageId}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// Gestión de dinero
function addMoney(amount) {
    if (amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    currentUser.balance += amount;
    balanceDisplay.textContent = currentUser.balance.toFixed(2);
    addActivity(`Depósito de S/. ${amount.toFixed(2)}`);
    closeModal('add-money-modal');
}

function withdrawMoney(amount) {
    if (amount <= 0 || amount > currentUser.balance) {
        alert('Monto inválido o insuficiente');
        return;
    }
    
    currentUser.balance -= amount;
    balanceDisplay.textContent = currentUser.balance.toFixed(2);
    addActivity(`Retiro de S/. ${amount.toFixed(2)}`);
}

// Juego de Memoria
let gameInProgress = false;
let sequence = [];
let playerSequence = [];
let gameLevel = 1;

function startMemoryGame() {
    gameInProgress = true;
    sequence = [];
    playerSequence = [];
    gameLevel = 1;
    generateSequence();
    showSequence();
}

function generateSequence() {
    for (let i = 0; i < gameLevel + 2; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }
}

function showSequence() {
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = '';
    
    // Crear tarjetas
    for (let i = 0; i < 9; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.number = i + 1;
        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    }
    
    // Mostrar secuencia
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            enablePlayerInput();
            return;
        }
        
        const number = sequence[i];
        const card = gameBoard.querySelector(`[data-number="${number}"]`);
        card.classList.add('flipped');
        card.textContent = number;
        
        setTimeout(() => {
            card.classList.remove('flipped');
            card.textContent = '';
        }, 500);
        
        i++;
    }, 1000);
}

function handleCardClick(e) {
    if (!gameInProgress) return;
    
    const number = parseInt(e.target.dataset.number);
    playerSequence.push(number);
    e.target.classList.add('flipped');
    e.target.textContent = number;
    
    setTimeout(() => {
        e.target.classList.remove('flipped');
        e.target.textContent = '';
        checkSequence();
    }, 300);
}

function checkSequence() {
    const currentIndex = playerSequence.length - 1;
    
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameInProgress = false;
        alert('¡Secuencia incorrecta! Intenta de nuevo');
        startMemoryGame();
        return;
    }
    
    if (playerSequence.length === sequence.length) {
        if (gameLevel === 3) {
            gameInProgress = false;
            alert('¡Felicitaciones! Has completado el reto. Ahora puedes retirar dinero.');
            document.getElementById('withdraw-form').classList.remove('hidden');
            document.getElementById('withdraw-btn').disabled = false;
        } else {
            gameLevel++;
            playerSequence = [];
            sequence = [];
            setTimeout(() => {
                alert(`¡Nivel ${gameLevel} completado!`);
                generateSequence();
                showSequence();
            }, 500);
        }
    }
}

function enablePlayerInput() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.style.cursor = 'pointer');
}

// Gestión de Metas
function addGoal(name, amount, description) {
    const goal = {
        id: Date.now(),
        name,
        targetAmount: amount,
        currentAmount: 0,
        description,
        completed: false
    };
    
    currentUser.goals.push(goal);
    displayGoal(goal);
    closeModal('new-goal-modal');
}

function displayGoal(goal) {
    const goalsList = document.getElementById('goals-list');
    const goalElement = document.createElement('div');
    goalElement.className = 'goal-card';
    goalElement.innerHTML = `
        <h3>${goal.name}</h3>
        <p>${goal.description}</p>
        <p>Meta: S/. ${goal.targetAmount.toFixed(2)}</p>
        <p>Progreso: S/. ${goal.currentAmount.toFixed(2)}</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(goal.currentAmount / goal.targetAmount * 100)}%"></div>
        </div>
        <button onclick="addToGoal(${goal.id})" class="action-button">
            <i class="fas fa-plus"></i> Agregar ahorro
        </button>
    `;
    goalsList.appendChild(goalElement);
}

function addToGoal(goalId) {
    const goal = currentUser.goals.find(g => g.id === goalId);
    const amount = parseFloat(prompt('¿Cuánto deseas ahorrar para esta meta?'));
    
    if (isNaN(amount) || amount <= 0 || amount > currentUser.balance) {
        alert('Monto inválido o insuficiente');
        return;
    }
    
    goal.currentAmount += amount;
    currentUser.balance -= amount;
    balanceDisplay.textContent = currentUser.balance.toFixed(2);
    
    if (goal.currentAmount >= goal.targetAmount) {
        goal.completed = true;
        alert('¡Felicitaciones! Has alcanzado tu meta de ahorro');
    }
    
    loadGoals();
    addActivity(`Ahorro de S/. ${amount.toFixed(2)} para meta: ${goal.name}`);
}

function loadGoals() {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    currentUser.goals.forEach(displayGoal);
}

// Gestión de actividad reciente
function addActivity(description) {
    const activityList = document.getElementById('activity-list');
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    activity.innerHTML = `
        <p>${description}</p>
        <small>${new Date().toLocaleString()}</small>
    `;
    activityList.prepend(activity);
}

// Gestión de modales
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', login);
    registerForm.addEventListener('submit', register);
    showRegisterLink.addEventListener('click', showRegisterPage);
    showLoginLink.addEventListener('click', showLoginPage);
    logoutBtn.addEventListener('click', logout);
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => showPage(btn.dataset.page));
    });
    
    document.getElementById('add-money').addEventListener('click', () => showModal('add-money-modal'));
    document.getElementById('new-goal-btn').addEventListener('click', () => showModal('new-goal-modal'));
    
    document.getElementById('add-money-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(e.target[0].value);
        addMoney(amount);
        e.target.reset();
    });
    
    document.getElementById('new-goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target[0].value;
        const amount = parseFloat(e.target[1].value);
        const description = e.target[2].value;
        addGoal(name, amount, description);
        e.target.reset();
    });
    
    document.getElementById('start-game').addEventListener('click', startMemoryGame);
    
    document.getElementById('withdraw-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(e.target[0].value);
        withdrawMoney(amount);
        e.target.reset();
        e.target.classList.add('hidden');
        document.getElementById('withdraw-btn').disabled = true;
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});