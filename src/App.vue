<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BreakoutGame from './views/BreakoutGame.vue'
import GatoRunnerGame from './views/GatoRunnerGame.vue'

// ======== Tema ========
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const rotating = ref(false)

function toggleTheme() {
  rotating.value = true
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  setTimeout(() => (rotating.value = false), 500)
}

// ======== Cores ========
function cor() {
  document.body.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 70%)`
}

// ======== Balada ========
let intervaloBalada = null
const baladaAtiva = ref(false) // <--- REATIVO agora

function balada() {
  const fundo = document.getElementById('balada-bg')
  const elementos = [
    document.querySelector('.balada'),
    document.querySelector('.reset'),
    document.querySelector('.cor'),
    document.querySelector('.mdi-white-balance-sunny'),
    document.querySelector('.mdi rotate'),
    document.querySelector('.mdi-weather-night'),
    document.querySelector('.rotate-rotate'),
    ...document.querySelectorAll('nav a')
  ]
  if (!fundo) return

  if (!baladaAtiva.value) {
    // Liga a balada
    baladaAtiva.value = true
    fundo.style.display = 'block'

    intervaloBalada = setInterval(() => {
      const hue = Math.floor(Math.random() * 360)
      const cor = `hsl(${hue}, 70%, 60%)`

      fundo.style.backgroundColor = cor
      elementos.forEach(el => {
        if (el) el.style.color = cor
      })
    }, 600)
  } else {
    // Desliga a balada com transição suave
    baladaAtiva.value = false
    clearInterval(intervaloBalada)
    intervaloBalada = null

    // Coloca a cor final para a transição
    fundo.style.backgroundColor = ''
    elementos.forEach(el => {
      if (el) el.style.color = ''
    })

    // Esconde o fundo depois da transição (tempo da transição)
    setTimeout(() => {
      if (!baladaAtiva.value) { // só esconde se ainda estiver desligada
        fundo.style.display = 'none'
      }
    }, 800) // tempo deve ser igual à transition do CSS
  }
}

// ======== Reset ========
function resetCor() {
  const fundo = document.getElementById('balada-bg')
  const elementos = [
    document.querySelector('.balada'),
    document.querySelector('.reset'),
    document.querySelector('.cor'),
    document.querySelector('.mdi-white-balance-sunny'),
    document.querySelector('.mdi rotate'),
    document.querySelector('.mdi-weather-night'),
    document.querySelector('.rotate-rotate'),
    ...document.querySelectorAll('nav a')
  ]
  document.body.style.backgroundColor = ''
  baladaAtiva.value = false
  clearInterval(intervaloBalada)
  intervaloBalada = null

  // Coloca a cor final para a transição
  fundo.style.backgroundColor = ''
  elementos.forEach(el => {
    if (el) el.style.color = ''
  })

  // Esconde o fundo depois da transição (tempo da transição)
  setTimeout(() => {
    if (!baladaAtiva.value) { // só esconde se ainda estiver desligada
      fundo.style.display = 'none'
    }
  }, 800) // tempo deve ser igual à transition do CSS
}

// ======== MENU DE JOGOS ========
const showMenu = ref(false)
const currentGame = ref(null)

const games = [
  { name: 'Breakout', view: BreakoutGame },
  { name: 'GatoRunner', view: GatoRunnerGame },
  // { name: 'Snake', component: SnakeGame },
  // { name: 'Tetris', component: TetrisGame },
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


//MENU DO HEADER
const openMenu = ref(false)
function Menu() {
  openMenu.value = !openMenu.value
}
</script>

<template>
  <div id="balada-bg"></div>

  <header>
 
    <nav>
      <div id="bloodscreen">
      <router-link to="/">BloodScreen</router-link>
      </div>
    </nav>

    <nav>
      <div id="content">
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Séries</router-link>
      </div>
    </nav>
    
  <div class="menu-container">
    <button @click="Menu" class="p-2 border rounded text-3xl text-white" id="Menu">
      <span class="mdi mdi-menu"></span>
    </button>

    <div v-if="openMenu" class="dropdown-menu">
      <button @click="toggleTheme()" class="p-2 border rounded text-3xl text-yellow-500">
        <span
          :class="['mdi rotate', isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny', rotating ? 'rotate-rotate' : '']">
        </span>
      </button>

      <button class="cor" @click="cor()">
        <span class="mdi mdi-palette"></span>
      </button>

      <button class="balada" :class="{ active: baladaAtiva }" @click="balada()">
        <span class="mdi mdi-auto-mode"></span>
      </button>

      <button class="reset" @click="resetCor()">
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
      <p>Escolha um jogo para começar:</p>

      <div class="menu-buttons">
        <button v-for="game in games" :key="game.name" @click="openGame(game)">
          🕹️ {{ game.name }}
        </button>

        <button class="close-menu" @click="showMenu = false">Fechar</button>
      </div>
    </div>
  </div>

  <!-- JOGO SELECIONADO -->
  <div v-if="currentGame" class="overlay">
    <div class="game-window">
      <button class="close" @click="closeGame"></button>
      <component :is="currentGame.view" @close="closeGame" />
    </div>
  </div>
</template>

<style>
header {
  position: relative; 
  height: 3rem;
  display: flex;
  background-color: transparent;
  color: #fff;
  font-size: 1.2rem;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}
/* Logo */
#bloodscreen a {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}

/* CONTEÚDO CENTRAL (links) */
#content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3vw; /* espaçamento fluido */
}

#content a {
  text-decoration: none;
  color: #fff;
  font-weight: 500;
  transition: color 0.3s;
}

#content a:hover {
  color: #ff4d4d;
}
nav {
  display: flex;
  align-items: center;
}

/* Transições suaves */
header button,
header nav a {
  transition: color 0.4s ease;
}

.menu-container {
  position: relative; /* referência pro dropdown */
}
.menu-container button {
  font-size: 1.8rem;
}
.dropdown-menu {
  position: absolute;
  top: 100%; /* logo abaixo do botão */
  right: 1.2vw;
  background-color: #111;
  border: 1px solid #444;
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
  background: #222;
  border-radius: 6px;
}


button {
  background: none;
  border: none;
  font-size: 1.6rem;
  padding-right: 2.5rem;
  color: white;
  cursor: pointer;
}

.rotate {
  display: inline-block;
  transition: transform 0.5s ease;
}

.rotate-rotate {
  transform: rotate(360deg);
}

.cores {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
}

/* Overlays */
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
}

.game-window {
  background: #111;
  padding: 24px;
  border-radius: 12px;
  position: relative;
  width: 720px;
  max-width: calc(100% - 32px);
  color: white;
  text-align: center;
}

.close {
  position: absolute;
  right: 8px;
  top: 8px;
  background: transparent;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* Menu */
.menu h2 {
  margin-bottom: 12px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.menu-buttons button {
  background: #333;
  border: 1px solid #666;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  font-size: 1rem;
  transition: background 0.3s;
}

.menu-buttons button:hover {
  background: #555;
}

.close-menu {
  margin-top: 10px;
  background: #a22;
  border-color: #c44;
}

.close-menu:hover {
  background: #c33;
}

/* Balada*/

/* Fundo da balada */
#balada-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  display: none;
  transition: background-color 0.8s ease;
  /* suaviza a mudança de cor */
}

/* Elementos que mudam de cor */
header button,
header nav a {
  transition: color 0.8s ease;
  /* suaviza a cor dos botões e links */
}

/* Piscar do botão da balada */
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
    transform: scale(1.12);
  }
}

/*MENU*/
#menu {
  
}
option {
  display: flex;
  flex-direction: column;
  position: fixed; 
}
</style>
