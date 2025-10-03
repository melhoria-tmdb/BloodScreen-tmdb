<script setup>
import { ref } from 'vue'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}
</script>

<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Programas de TV</router-link>
    </nav>

    <button
      @click="toggleTheme()"
      class="p-2 border rounded text-3xl text-yellow-500"
    >
      <span :class="['mdi', isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny']"></span>
    </button>
  </header>

  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  height: 3rem;
  display: flex;
  background-color: black;
  color: #fff;
  font-size: 1.2rem;
  padding-left: 2rem;
  display: flex;
  justify-content: space-between;
}

nav {
  column-gap: 2rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #fff;
}

button {
  background: none;
  border: none;
  font-size: 1.4rem;
  padding-right: 2.5rem;
  color:#fff
}
</style>
