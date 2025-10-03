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
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

function applyTheme() {
  if (isDarkMode.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')

  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

applyTheme()

app.config.globalProperties.$toggleTheme = toggleTheme
Object.defineProperty(app.config.globalProperties, '$isDarkMode', {
  get() {
    return isDarkMode.value
  }
})


