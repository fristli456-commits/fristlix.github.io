import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyBYXn3CBVRWocJW6V8nqqZyeHSTrmVwvcw",
  authDomain: "fristlix.firebaseapp.com",
  projectId: "fristlix",
  storageBucket: "fristlix.firebasestorage.app",
  messagingSenderId: "161841516321",
  appId: "1:161841516321:web:db2fe4d40047a99807f860",
  measurementId: "G-SRR2SFHGYF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ADMIN_EMAIL = "fristli456@gmail.com";

let isLoading = false;

/* ============================= */
/* 🔥 ЖДЁМ ЗАГРУЗКУ DOM */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ===== ТЕМА ===== */
  const themeBtn = document.getElementById("theme-toggle");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");

      if (document.body.classList.contains("light-mode")) {
        themeBtn.textContent = "☀";
        localStorage.setItem("theme", "light");
      } else {
        themeBtn.textContent = "🌙";
        localStorage.setItem("theme", "dark");
      }
    });

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
      themeBtn.textContent = "☀";
    }
  }

});

/* ============================= */
/* 🔥 ОШИБКИ */
/* ============================= */

function showError(status, e) {
  status.style.color = "#ff4444";

  switch (e.code) {
    case "auth/invalid-credential":
      status.textContent = "Неверная почта или пароль";
      break;
    case "auth/email-already-in-use":
      status.textContent = "Этот email уже зарегистрирован";
      break;
    case "auth/weak-password":
      status.textContent = "Пароль минимум 6 символов";
      break;
    case "auth/too-many-requests":
      status.textContent = "Слишком много попыток. Подождите ⏳";
      break;
    default:
      status.textContent = "Ошибка входа";
      console.error(e);
  }
}

/* ============================= */
/* 🔥 РЕГИСТРАЦИЯ */
/* ============================= */

window.register = async () => {
  if (isLoading) return;
  isLoading = true;

  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const status = document.getElementById("status");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    status.style.color = "#00ff99";
    status.textContent = "Регистрация успешна!";
  } catch (e) {
    showError(status, e);
  } finally {
    isLoading = false;
  }
};

/* ============================= */
/* 🔥 ВХОД */
/* ============================= */

window.login = async () => {
  if (isLoading) return;
  isLoading = true;

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const status = document.getElementById("status");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.style.color = "#00ff99";
    status.textContent = "Вы вошли!";
  } catch (e) {
    showError(status, e);
  } finally {
    isLoading = false;
  }
};

/* ============================= */
/* 🔥 ВЫХОД */
/* ============================= */

window.logout = async () => {
  await signOut(auth);
};

/* ============================= */
/* 🔥 ВКЛАДКИ */
/* ============================= */

window.openTab = (tab) => {
  document.querySelectorAll(".panel-content").forEach(panel => {
    panel.style.display = "none";
  });

  const active = document.getElementById(tab);
  if (active) active.style.display = "block";
};

window.openSettings = () => {
  document.getElementById("profile").style.display = "none";
  document.getElementById("settings").style.display = "block";
};

/* ============================= */
/* 🔥 СМЕНА EMAIL */
/* ============================= */

window.changeEmail = async () => {
  const user = auth.currentUser;
  const status = document.getElementById("status");
  const newEmail = document.getElementById("new-email").value;

  if (!user) return;

  try {
    await updateEmail(user, newEmail);
    status.style.color = "#00ff99";
    status.textContent = "Email обновлён!";
  } catch (e) {
    showError(status, e);
  }
};

/* ============================= */
/* 🔥 СМЕНА ПАРОЛЯ */
/* ============================= */

window.changePassword = async () => {
  const user = auth.currentUser;
  const newPassword = document.getElementById("new-password").value;
  const status = document.getElementById("status");

  if (!user) return;

  try {
    await updatePassword(user, newPassword);
    status.style.color = "#00ff99";
    status.textContent = "Пароль обновлён!";
  } catch (e) {
    showError(status, e);
  }
};

/* ============================= */
/* 🔥 ПРОВЕРКА АВТОРИЗАЦИИ */
/* ============================= */

onAuthStateChanged(auth, (user) => {

  const status = document.getElementById("status");
  const profileEmail = document.getElementById("profile-email");
  const rightPanel = document.getElementById("right-panel");
  const marketplace = document.getElementById("marketplace");
  const hero = document.querySelector(".hero");

  const authBox = document.getElementById("auth");

  const botsTab = document.getElementById("bots-tab");
  const purchasesTab = document.getElementById("purchases-tab");
  const ordersTab = document.getElementById("orders-tab");
  const adminTab = document.getElementById("admin-tab");

  if (user) {

    // 🔥 Скрываем приветствие и форму входа
    hero.style.display = "none";
    status.style.display = "none";
    authBox.style.display = "none";

    // 🔥 Показываем маркетплейс и правую панель
    marketplace.style.display = "block";
    rightPanel.style.display = "flex";

    // Email в профиль
    if (profileEmail) {
      profileEmail.textContent = user.email;
    }

    // Открываем профиль по умолчанию
    openTab("profile");

    // Сначала всё скрываем
    botsTab.style.display = "none";
    purchasesTab.style.display = "none";
    ordersTab.style.display = "none";
    adminTab.style.display = "none";

    if (user.email === ADMIN_EMAIL) {
      // 👑 Админ
      botsTab.style.display = "block";
      ordersTab.style.display = "block";
      adminTab.style.display = "block";
    } else {
      // 👤 Пользователь
      purchasesTab.style.display = "block";
    }

  } else {

    // 🔥 Показываем приветствие и форму входа
    hero.style.display = "block";
    status.style.display = "block";
    authBox.style.display = "flex";

    // 🔥 Скрываем всё приватное
    rightPanel.style.display = "none";
    marketplace.style.display = "none";

    botsTab.style.display = "none";
    purchasesTab.style.display = "none";
    ordersTab.style.display = "none";
    adminTab.style.display = "none";
  }

});
