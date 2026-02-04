import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  sendPasswordResetEmail
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(userCredential.user);

    status.style.color = "#00ff99";
    status.textContent = "Письмо для подтверждения отправлено на email!";

    await signOut(auth);

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // 🔥 ВОТ ГЛАВНАЯ ПРОВЕРКА
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      status.style.color = "#ff4444";
      status.textContent = "Подтвердите email перед входом!";
      return;
    }

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
/* 🔥 СМЕНА ПАРОЛЯ */
/* ============================= */

window.changePassword = async () => {
  const user = auth.currentUser;
  const status = document.getElementById("status");

  if (!user) {
    status.style.color = "#ff4444";
    status.textContent = "Сначала войдите в аккаунт";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, user.email);
    status.style.color = "#00ff99";
    status.textContent = "Письмо для смены пароля отправлено!";
  } catch (e) {
    showError(status, e);
  }
};

window.resendVerification = async () => {
  const user = auth.currentUser;
  const status = document.getElementById("status");

  if (!user) {
    status.style.color = "#ff4444";
    status.textContent = "Сначала войдите в аккаунт";
    return;
  }

  try {
    await sendEmailVerification(user);
    status.style.color = "#00ff99";
    status.textContent = "Письмо отправлено повторно!";
  } catch (e) {
    showError(status, e);
  }
};

/* ============================= */
/* 🔥 ПРОВЕРКА АВТОРИЗАЦИИ */
/* ============================= */

onAuthStateChanged(auth, async (user) => {

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

    // 🔥 ОБНОВЛЯЕМ данные пользователя
    await user.reload();

    // ❌ Если email НЕ подтверждён
    if (!user.emailVerified) {
      await signOut(auth);
      status.style.color = "#ff4444";
      status.textContent = "Подтвердите email перед входом!";
      return;
    }

    // ====== ДОСТУП РАЗРЕШЁН ======

    hero.style.display = "none";
    status.style.display = "none";
    authBox.style.display = "none";

    marketplace.style.display = "block";
    rightPanel.style.display = "flex";

    if (profileEmail) {
      profileEmail.textContent = user.email;
    }

    openTab("profile");

    // Скрываем всё
    botsTab.style.display = "none";
    purchasesTab.style.display = "none";
    ordersTab.style.display = "none";
    adminTab.style.display = "none";

    if (user.email === ADMIN_EMAIL) {
      botsTab.style.display = "block";
      ordersTab.style.display = "block";
      adminTab.style.display = "block";
    } else {
      purchasesTab.style.display = "block";
    }

  } else {

    hero.style.display = "block";
    status.style.display = "block";
    authBox.style.display = "flex";

    rightPanel.style.display = "none";
    marketplace.style.display = "none";

    botsTab.style.display = "none";
    purchasesTab.style.display = "none";
    ordersTab.style.display = "none";
    adminTab.style.display = "none";
  }

});
