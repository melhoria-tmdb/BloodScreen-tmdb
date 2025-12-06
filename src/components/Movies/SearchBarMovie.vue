<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'

const emit = defineEmits(['select'])

const query = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
let searchTimeout = null

const handleInput = () => {
  clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  searchTimeout = setTimeout(fetchSuggestions, 400)
}

const fetchSuggestions = async () => {
  try {
    const res = await api.get('/search/movie', {
      params: { query: query.value, include_adult: false, language: 'pt-BR' },
    })
    suggestions.value = (res.data.results || [])
      .filter((m) => m.poster_path && m.genre_ids.includes(27))
      .slice(0, 10)
    showSuggestions.value = suggestions.value.length > 0
  } catch (err) {
    console.error('Erro ao buscar sugestões:', err)
  }
}

const selectSuggestion = (movie) => {
  query.value = movie.title
  showSuggestions.value = false
  emit('select', movie.id)
}

const searchAndSelect = async () => {
  if (!query.value.trim()) return;

  try {
    const res = await api.get('/search/movie', {
      params: {
        query: query.value,
        include_adult: false,
        language: 'pt-BR',
      },
    });

    let results = res.data.results || [];

    // 🔥 Filtro apenas filmes de terror (gênero 27)
    results = results.filter((m) => m.genre_ids?.includes(27));

    if (results.length === 0) return;

    // Tenta achar correspondência exata com o nome digitado
    const exact = results.find(
      (m) => m.title.toLowerCase() === query.value.toLowerCase()
    );

    const selected = exact || results[0]; // caso não exista exato, pega o mais relevante

    emit("select", selected.id);
    showSuggestions.value = false;
  } catch (err) {
    console.error("Erro ao buscar filme:", err);
  }
};

const clearSearch = () => {
  query.value = ''
  suggestions.value = []
  showSuggestions.value = false
  clearTimeout(searchTimeout)
}

</script>

<template>
  <div class="input-wrap">
    <input type="text" v-model="query" @input="handleInput" @keyup.enter="searchAndSelect"
      placeholder="Pesquisar em filmes..." class="pesquisa" @focus="showSuggestions = suggestions.length > 0"
      @blur="setTimeout(() => (showSuggestions = false), 150)" />
    <i v-if="query" class="mdi mdi-close-thick" @click="clearSearch"></i>
    <i class="mdi mdi-magnify" @click="searchAndSelect"></i>


    <ul v-if="showSuggestions" class="suggestion-list">
      <li v-for="s in suggestions" :key="s.id" @click="selectSuggestion(s)" class="suggestion-item">
        <img :src="`https://image.tmdb.org/t/p/w92${s.poster_path}`" />
        <span>{{ s.title }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.input-wrap {
  position: fixed;
  left: 51.7%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: inline-block;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.input-wrap i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--text);
  cursor: pointer;
}

/* Ícone X – alinhado e com padding menor */
.input-wrap .mdi-close-thick {
  right: 12%;
  padding: 2px 6px;
  border-radius: 12px;
  transition: 0.2s;
}

.input-wrap .mdi-close-thick:hover {
  background: #e5e5e5;
  color: var(--text);
}

/* Ícone lupa */
.input-wrap .mdi-magnify {
  right: 5%;
  padding: 2px 6px;
  border-radius: 12px;
  transition: 0.2s;
}

.input-wrap .mdi-magnify:hover {
  background: #e5e5e5;
  color: var(--text);
}

.pesquisa {
  width: 100%;
  padding: 10px 40px 10px 15px;
  background-color: transparent;
  height: 40px;
  border: 1px solid var(--text);
  color: var(--text);
  border-radius: 20px;
  font-size: 16px;

}

.pesquisa:focus {
  outline: none;
  box-shadow: none;
}
.pesquisa::placeholder {
  color: var(--text);
}

.pesquisa:focus-visible {
  outline: 2px solid transparent;
}

.suggestion-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--bg);
  border-radius: 0.5rem;
  margin-top: 4px;
  list-style: none;
  padding: 0;
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #7a0b0b #111;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #7a0b0b;
}

.suggestion-item img {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
