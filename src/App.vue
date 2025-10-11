<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BreakoutGame from './views/BreakoutGame.vue'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const rotating = ref(false)

//Temas
function toggleTheme() {
  rotating.value = true
  isDarkMode.value = !isDarkMode.value

  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')

  setTimeout(() => rotating.value = false, 500) // remove classe de rotação após 0.5s
}

//Cores
function cor() {
  document.body.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 70%)`
}
function resetCor() {
  document.body.style.backgroundColor = '' // remove o estilo inline e volta ao CSS padrão
}


//Jogo
const showGame = ref(false)

const code = [
  'h', 'a',
  'n', 'n', 'a'
]

let inputSequence = []

function handleKey(e) {
  inputSequence.push(e.key)
  // Mantém apenas as últimas N teclas
  if (inputSequence.length > code.length) {
    inputSequence.shift()
  }

  if (JSON.stringify(inputSequence) === JSON.stringify(code)) {
    showGame.value = true
    inputSequence = []
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})

</script>

<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Programas de TV</router-link>
    </nav>

    <div class="cores">
    <button class="reset" @click="resetCor()">
      <span class="mdi mdi-refresh"></span>
    </button>

    <button class="cor" @click="cor()">
      <span class="mdi mdi-palette"></span>
    </button>
    </div>

<div v-if="showGame" class="overlay">
  <div class="game-window">
    <button class="close" @click="showGame = false"></button>
    <breakout-game @close="showGame = false" />
  </div>
</div>
    <button @click="toggleTheme()" class="p-2 border rounded text-3xl text-yellow-500">
      <span
        :class="['mdi rotate', isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny', rotating ? 'rotate-rotate' : '']">
      </span>
    </button>
  </header>

  <main>
    <router-view />
  </main>

</template>

<style>
header {
  height: 3rem;
  display: flex;
  background-color: black;
  color: #fff;
  font-size: 1.2rem;
  padding-left: 2rem;
  justify-content: space-between;
  align-items: center;
}

nav {
  column-gap: 2rem;
  display: flex;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #fff;
}

/* botão tema */
button {
  background: none;
  border: none;
  font-size: 1.6rem;
  padding-right: 2.5rem;
  color: white;
}

.rotate {
  display: inline-block;
  transition: transform 0.5s ease;
}

.rotate-rotate {
  transform: rotate(360deg);
}

.cores{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: -1rem;
}

.cor {
  padding: 0;
}

/*Jogo*/
.overlay {
  position: fixed; inset: 0; display:flex; align-items:center; justify-content:center;
  background: rgba(0,0,0,0.75); z-index:9999;
}
.game-window {
  background: #111; padding: 12px; border-radius: 12px; position: relative;
  width: 720px; max-width: calc(100% - 32px);
}
.close {
  position: absolute; right: 8px; top: 8px; background: transparent; color: white; border: none;
  font-size: 18px; cursor: pointer;
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>
