<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import BreakoutGame from './views/Games/BreakoutGame.vue'
import GatoRunnerGame from './views/Games/GatoRunnerGame.vue'

// ⬅️ NOVO: Inicializar a rota para checagem de página
const route = useRoute()

/* ============================================================
   TEMA (Light/Dark)
============================================================ */
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const rotating = ref(false)

function toggleTheme() {
  rotating.value = true
  isDarkMode.value = !isDarkMode.value

  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')

  setTimeout(() => (rotating.value = false), 500)
}

/* ============================================================
   GERAR COR ALEATÓRIA (apenas para ícones/links)
============================================================ */
function cor() {
  const hue = Math.floor(Math.random() * 360)
  const corNova = `hsl(${hue}, 70%, 60%)`

  document.documentElement.style.setProperty('--custom-color', corNova)
}

/* ============================================================
   BALADA (muda apenas cor dos elementos, sem fundo)
============================================================ */
const baladaAtiva = ref(false)
let intervaloBalada = null

function balada() {
  const elementos = document.querySelectorAll('.color-target')

  if (!baladaAtiva.value) {
    baladaAtiva.value = true

    intervaloBalada = setInterval(() => {
      const hue = Math.floor(Math.random() * 360)
      const corNova = `hsl(${hue}, 75%, 60%)`
      document.documentElement.style.setProperty('--custom-color', corNova)
    }, 400)
  } else {
    // desligar balada
    baladaAtiva.value = false
    clearInterval(intervaloBalada)
    intervaloBalada = null

    // voltar à cor original do tema (light/dark)
    document.documentElement.style.removeProperty('--custom-color')
  }
}

/* ============================================================
   RESET (volta aos padrões do tema)
============================================================ */
function resetCor() {
  baladaAtiva.value = false
  clearInterval(intervaloBalada)
  intervaloBalada = null

  document.documentElement.style.removeProperty('--custom-color')
}

/* ============================================================
   MENU DE JOGOS
============================================================ */
const showMenu = ref(false)
const currentGame = ref(null)

const games = [
  { name: 'Breakout', view: BreakoutGame },
  { name: 'GatoRunner', view: GatoRunnerGame }
]

const code = ['t', 'e', 'r', 'r', 'o', 'r']
let inputSequence = []

function handleKey(e) {
  inputSequence.push(e.key)
  if (inputSequence.length > code.length) inputSequence.shift()

  if (JSON.stringify(inputSequence) === JSON.stringify(code)) {
    showMenu.value = true
    inputSequence = []
  }
}

function openGame(game) {
  currentGame.value = game
  showMenu.value = false
}

function closeGame() {
  currentGame.value = null
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))

/* ============================================================
   LÓGICA DO MENU
============================================================ */
// ⬅️ NOVO: Propriedade computada para saber se estamos na Home
const isHome = computed(() => route.path === '/')

/* ============================================================
   MENU HEADER MOBILE
============================================================ */
const openMenu = ref(false)
function Menu() {
  openMenu.value = !openMenu.value
}
/* ============================================================
   DETECTOR ClIQUE
============================================================ */
function handleClickOutside(event) {
  const menuSidebar = document.querySelector('.sidebar-menu')
  const menuButton = document.getElementById('Menu')


  if (!openMenu.value) return

  if (menuSidebar?.contains(event.target) || menuButton?.contains(event.target)) {
    return
  }
  openMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
  <header>

    <nav>
      <div id="bloodscreen">
        <router-link to="/" class="color-target">BLOODSCREEN</router-link>
      </div>
    </nav>

    <nav>
      <div id="content">
        <router-link to="/filmes" class="color-target">FILMES</router-link>
        <router-link to="/tv" class="color-target">SÉRIES</router-link>
      </div>
    </nav>

    <div class="menu-container">
      <button @click="Menu" class="p-2 border rounded text-3xl color-target" id="Menu">
        <span class="mdi mdi-menu"></span>
      </button>

    </div>

  </header>

  <main>
    <router-view />
  </main>

  <transition name="slide-in">
    <div v-if="openMenu" class="sidebar-overlay" @click.self="Menu"
      :style="{ backgroundColor: isHome ? `rgba(var(--slide-theme-color), 0.5)` : 'rgba(0, 0, 0, 0.5)' }">
      <div class="sidebar-menu" :style="{ backgroundColor: isHome ? `rgb(var(--slide-theme-color))` : 'var(--bg)' }">
        <div class="sidebar-header">
          <router-link to="/" class="color-target" @click="Menu">BLOODSCREEN</router-link>
        </div>

        <div class="sidebar-content">
          <router-link to="/" class="menu-item color-target" @click="Menu">
            <span class="mdi mdi-home-variant-outline"></span> Home
          </router-link>

          <div class="menu-item color-target" @click="cor">
            <span class="mdi mdi-palette"></span> Aparência
          </div>

          <div class="menu-item color-target" @click="toggleTheme">
            <span
              :class="['mdi rotate', isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny', rotating ? 'rotate-rotate' : '']"></span>
            Modo
          </div>

          <div class="menu-item color-target balada" :class="{ active: baladaAtiva }" @click="balada">
            <span class="mdi mdi-auto-mode"></span> Automático
          </div>

          <div class="menu-item color-target" @click="cor">
            <span class="mdi mdi-account-star"></span> Celebridades
          </div>

          <div class="menu-item color-target" @click="resetCor">
            <span class="mdi mdi-reload"></span> Resetar
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="menu-item color-target" @click="Menu">
            <span class="mdi mdi-arrow-left-circle"></span> Voltar
          </div>
        </div>
      </div>
    </div>
  </transition>


  <div v-if="showMenu" class="overlay">
    <div class="game-window menu">
      <h2>🎮 Arcade Secreto</h2>
      <p>Escolha um jogo:</p>

      <div class="menu-buttons">
        <div class="game-buttons">
          <button v-for="game in games" :key="game.name" @click="openGame(game)">
            🕹️ {{ game.name }}
          </button>
        </div>
        <div class="close-button">
          <button class="close-menu" @click="showMenu = false">Fechar</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="currentGame" class="overlay">
    <div class="game-window">
      <button class="close color-target" @click="closeGame"></button>

      <component v-if="currentGame" :is="currentGame.view" @close="closeGame" @backToMenu="() => {
        currentGame = null
        showMenu = true
      }" />

    </div>
  </div>
</template>

<style>
/* ============================================================
Cores globais
============================================================ */
:root {
  --custom-color: unset;
}

.color-target {
  transition: color 0.8s ease !important;
  color: var(--custom-color, var(--text)) !important;
}

/* ============================================================
Header
============================================================ */

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: var(--header-bg) !important;
  height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.3vw;
  padding: 0 4rem;
}

#bloodscreen a {
  font-size: 30px;
  font-weight: bold;
  font-family: 'Metal Mania', regular;
}

#content {
  display: flex;
  gap: 3vw;
  position: absolute;
  top: 50%;
  left: 52%;
  transform: translate(-50%, -50%);
}

#content a {
  text-decoration: none;
  color: white !important;
  font-family: 'K2D', thin;
  font-weight: 100;
  font-size: 20px;
}

#content a:hover {
  color: red !important;
}

#content a.router-link-active {
  color: rgb(240, 29, 29) !important;
}

/* ============================================================
 SIDEBAR / DRAWER
============================================================ */
button {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: white;
  cursor: pointer;
}

.menu-container {
  position: relative;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;

  /* Transição de cor para suavizar (mantida) */
  transition: background-color 0.8s ease;

  z-index: 10000;
  /* Fundo definido no style inline (template) */
}

.sidebar-menu {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  /* Transição de cor para suavizar (mantida) */
  transition: background-color 0.8s ease;

  /* Fundo definido no style inline (template) */
  color: var(--text);
  /* 💥 AJUSTE: Redução do padding superior para subir o cabeçalho */
  padding: 20px 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.3);
}

.sidebar-header {
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
  /* (Removido margin-top negativa, já que o padding superior foi ajustado) */
}

.sidebar-header a {
  font-size: 30px;
  font-weight: bold;
  font-family: 'Metal Mania', regular;
  text-decoration: none;
  color: inherit;
}

.sidebar-content,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 1.2rem;
  font-family: 'K2D', sans-serif;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
}

.menu-item span.mdi {
  font-size: 1.4rem;
  margin-right: 15px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  /* Ajuste para o valor padrão, 20px era muito arredondado */
}

/* Estilo para "Voltar" (Footer) */
.sidebar-footer {
  border-top: 1px solid var(--text);
  padding-top: 20px;
  margin-top: 20px;
}

.sidebar-footer .menu-item {
  color: var(--nav-link-hover, red);
  /* Destaca a cor do botão Voltar */
}


/* ============================================================
 SIDEBAR ANIMAÇÃO
============================================================ */
/* Define a transição para ambos: o menu e o overlay */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: opacity 0.5s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
}

/* Transição do Drawer (barra lateral) */
.slide-in-enter-active .sidebar-menu,
.slide-in-leave-active .sidebar-menu {
  transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
}

/* Posição inicial (escondida) */
.slide-in-enter-from .sidebar-menu,
.slide-in-leave-to .sidebar-menu {
  transform: translateX(100%);
  /* Move para fora da tela (direita) */
}

/* Posição final (visível) */
.slide-in-enter-to .sidebar-menu,
.slide-in-leave-from .sidebar-menu {
  transform: translateX(0);
  /* Posição normal na tela */
}

/* ============================================================
Balada animação
============================================================ */
.balada.active {
  animation: pisca 0.3s infinite alternate;
}

@keyframes pisca {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

/* ============================================================
 Jogos
============================================================ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.game-window {
  background: #111;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: white;
  padding: 24px;
  width: 720px;
  max-width: calc(100% - 32px);
  border-radius: 12px;
}

.game-window h2 {
  font-size: 2rem;
}

.game-window p {
  font-size: 1.4rem;
  margin-bottom: 1.4vw;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1vw;
}

.menu-buttons .game-buttons {
  display: flex;
  flex-direction: column;
  gap: 1vw;
  margin-bottom: 1.4vw;
}

.menu-buttons .game-buttons button {
  background-color: red;
  border-radius: 12px;
  padding: 1.4vw;
}

.close {
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>
