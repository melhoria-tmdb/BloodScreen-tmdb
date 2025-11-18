<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BreakoutGame from './views/Games/BreakoutGame.vue'
import GatoRunnerGame from './views/Games/GatoRunnerGame.vue'

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
  const menu = document.querySelector('.dropdown-menu')
  const menuButton = document.getElementById('Menu')

  // Se o menu não está aberto, ignora
  if (!openMenu.value) return

  // Se clicou dentro do menu ou no botão do menu → não fecha
  if (menu?.contains(event.target) || menuButton?.contains(event.target)) {
    return
  }

  // Qualquer clique fora → fecha
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

      <div v-if="openMenu" class="dropdown-menu">
        <button @click="toggleTheme" class="color-target">
          <span
            :class="['mdi rotate', isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny', rotating ? 'rotate-rotate' : '']"></span>
        </button>

        <button class="color-target" @click="cor">
          <span class="mdi mdi-palette"></span>
        </button>

        <button class="color-target balada" :class="{ active: baladaAtiva }" @click="balada">
          <span class="mdi mdi-auto-mode"></span>
        </button>

        <button class="color-target reset" @click="resetCor">
          <span class="mdi mdi-refresh"></span>
        </button>
      </div>
    </div>

  </header>

  <main>
    <router-view />
  </main>

  <!-- MENU DE JOGOS -->
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

  <!-- JOGO -->
  <div v-if="currentGame" class="overlay">
    <div class="game-window">
      <button class="close color-target" @click="closeGame"></button>
      <component
  v-if="currentGame"
  :is="currentGame.view"
  @close="closeGame"
  @backToMenu="() => {
    currentGame = null
    showMenu = true
  }"
/>
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
  position: relative;
  height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  z-index: 1000;
  margin-top: 1vw;
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
  left: 50%;
  transform: translate(-50%, -50%);
}

#content a {
  text-decoration: none;
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
   Dropdown
============================================================ */
button {
  background: none;
  border: none;
  font-size: 1.6rem;
  padding-right: 2.5rem;
  color: white;
  cursor: pointer;
}

.menu-container {
  position: relative;
  /* referência pro dropdown */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  /* logo abaixo do botão */
  right: 1.2vw;
  border: 1px solid;
  border-color: var(--text);
  background: var(--bg);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0.5rem;
  z-index: 999;
}

.dropdown-menu button {
  color: white;
  font-size: 1.6rem;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.5rem;
}

.dropdown-menu button:hover {
  background: #bbbaba;
  border-radius: 6px;
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
