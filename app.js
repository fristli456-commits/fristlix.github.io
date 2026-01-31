<script type="module">
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

/* Красивые ошибки */
function showError(status, e) {
  status.style.color = "#ff4444";

  switch (e.code) {
    case "auth/invalid-credential":
      status.textContent = "Неверная почта или пароль";
      break;
    case "auth/wrong-password":
      status.textContent = "Неверный пароль";
      break;
    case "auth/user-not-found":
      status.textContent = "Аккаунт с такой почтой не найден";
      break;
    case "auth/email-already-in-use":
      status.textContent = "Этот email уже зарегистрирован";
      break;
    case "auth/weak-password":
      status.textContent = "Пароль слишком простой (минимум 6 символов)";
      break;
    case "auth/too-many-requests":
      status.textContent = "Слишком много попыток. Подождите пару минут ⏳";
      break;
    case "auth/invalid-email":
      status.textContent = "Неверный формат email";
      break;
    case "auth/missing-password":
      status.textContent = "Введите пароль";
      break;
    case "auth/missing-email":
      status.textContent = "Введите email";
      break;
    default:
      status.textContent = "Ошибка входа. Проверьте данные.";
      console.error(e);
      break;
  }
}

/* Регистрация */
window.register = async () => {
  if (isLoading) return;
  isLoading = true;

  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const status = document.getElementById("status");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    status.style.color = "#00ff99";
    status.textContent = "Вы успешно зарегистрировались!";
  } catch (e) {
    showError(status, e);
  } finally {
    isLoading = false;
  }
};

/* Вход */
window.login = async () => {
  if (isLoading) return;
  isLoading = true;

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const status = document.getElementById("status");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.style.color = "#00ff99";
    status.textContent = "Вы успешно вошли!";
  } catch (e) {
    showError(status, e);
  } finally {
    isLoading = false;
  }
};

/* Выход */
window.logout = async () => {
  await signOut(auth);
};

window.openTab = (tab) => {
  const panels = document.querySelectorAll(".panel-content");

  panels.forEach(panel => {
    panel.style.display = "none";
  });

  const activePanel = document.getElementById(tab);
  if (activePanel) {
    activePanel.style.display = "block";
  }
};

/* Открыть настройки */
window.openSettings = () => {
  document.getElementById("profile").style.display = "none";
  document.getElementById("settings").style.display = "block";
};

/* Закрыть настройки */
window.closeSettings = () => {
  document.getElementById("settings").style.display = "none";
  document.getElementById("profile").style.display = "block";
};

/* Смена email */
window.changeEmail = async () => {
  const user = auth.currentUser;
  const status = document.getElementById("status");
  const newEmail = document.getElementById("new-email").value;

  if (!user) {
    status.style.color = "#ff4444";
    status.textContent = "Сначала войдите в аккаунт";
    return;
  }

  if (!newEmail) {
    status.style.color = "#ff4444";
    status.textContent = "Введите новый email";
    return;
  }

  try {
    await updateEmail(user, newEmail);
    status.style.color = "#00ff99";
    status.textContent = "Email успешно изменён!";
  } catch (e) {
    if (e.code === "auth/requires-recent-login") {
      status.style.color = "#ff4444";
      status.textContent = "Для изменения email нужно войти заново";
    } else {
      showError(status, e);
    }
  }
};



/* Смена пароля */
window.changePassword = async () => {
  const user = auth.currentUser;
  const newPassword = document.getElementById("new-password").value;
  const status = document.getElementById("status");

  if (!user) {
    status.style.color = "#ff4444";
    status.textContent = "Сначала войдите в аккаунт";
    return;
  }

  if (newPassword.length < 6) {
    status.style.color = "#ff4444";
    status.textContent = "Пароль должен быть минимум 6 символов";
    return;
  }

  try {
    await updatePassword(user, newPassword);
    status.style.color = "#00ff99";
    status.textContent = "Пароль успешно изменён!";
  } catch (e) {
    if (e.code === "auth/requires-recent-login") {
      status.style.color = "#ff4444";
      status.textContent = "Для изменения данных нужно войти заново";
    } else {
      showError(status, e);
    }
  }
};


/* Проверка авторизации */
onAuthStateChanged(auth, (user) => {
  const status = document.getElementById("status");
  const profileEmail = document.getElementById("profile-email");
  const rightPanel = document.getElementById("right-panel");

  if (user) {

    status.innerHTML = `Вы вошли как: <b>${user.email}</b>`;
    status.style.color = "#00ff99";

    if (profileEmail) profileEmail.textContent = user.email;

    document.getElementById("auth").style.display = "none";

    // 🔥 ПОКАЗЫВАЕМ правую панель
    rightPanel.style.display = "flex";

    // Открываем профиль по умолчанию
    openTab("profile");

    // Админ кнопка
    if (user.email === ADMIN_EMAIL) {
      document.getElementById("admin-tab").style.display = "block";
    }

  } else {

    status.textContent = "Вы не вошли";
    status.style.color = "#ccc";

    document.getElementById("auth").style.display = "flex";

    // 🔥 СКРЫВАЕМ правую панель
    rightPanel.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("theme-toggle");

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

  // Сохранение темы
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    themeBtn.textContent = "☀";
  }
});

</script>
