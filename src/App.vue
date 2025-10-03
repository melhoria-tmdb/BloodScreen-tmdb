<script setup>
import { ref } from 'vue'

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

  setTimeout(() => rotating.value = false, 500) // remove classe de rotação após 0.5s
}
</script>

<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Programas de TV</router-link>
    </nav>

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
</style>
