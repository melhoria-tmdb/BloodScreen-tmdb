import 'vue-loading-overlay/dist/css/index.css';
import '@mdi/font/css/materialdesignicons.min.css'; // minificado
import './assets/main.css';

import { createApp, ref } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';


const app = createApp(App);
app.use(router);
app.use(createPinia());

app.mount('#app');

//Função Dark Mode - Change Themes
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const rotating = ref(false); // controle da animação do ícone

function applyTheme() {
  if (isDarkMode.value) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');

  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

function toggleTheme() {
  rotating.value = true;       // inicia a rotação
  isDarkMode.value = !isDarkMode.value;
  applyTheme();

  // termina a rotação após 0.5s
  setTimeout(() => {
    rotating.value = false;
  }, 500);
}

// aplica tema no carregamento
applyTheme();

// expõe globalmente para usar nos componentes
app.config.globalProperties.$toggleTheme = toggleTheme;
app.config.globalProperties.$rotating = rotating;
Object.defineProperty(app.config.globalProperties, '$isDarkMode', {
  get() {
    return isDarkMode.value;
  }
});

