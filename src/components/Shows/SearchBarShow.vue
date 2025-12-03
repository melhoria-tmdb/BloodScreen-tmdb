<script setup>
import { ref } from 'vue';
import api from '@/plugins/axios';

const emit = defineEmits(['select']);

const query = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);
let searchTimeout = null;

// 🔥 Keywords principais de terror (TMDB)
const horrorKeywordList = [
  12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 1299, 238534, 210614, 33696, 214881,
  252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193,
  183787, 289108, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 33505,
];

// 🔎 Checa se uma série é de terror
const isHorrorShow = async (tvId) => {
  try {
    const keywordsRes = await api.get(`/tv/${tvId}/keywords`);
    const keywords = keywordsRes.data.results?.map((k) => k.id) || [];
    return keywords.some((id) => horrorKeywordList.includes(id));
  } catch {
    return false;
  }
};

// 🧠 Sugestões automáticas
const handleInput = () => {
  clearTimeout(searchTimeout);
  if (!query.value.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  searchTimeout = setTimeout(fetchSuggestions, 400);
};

// 🔍 Busca sugestões
const fetchSuggestions = async () => {
  try {
    const res = await api.get('/search/tv', {
      params: { query: query.value, include_adult: false, language: 'pt-BR' },
    });

    const results = res.data.results || [];

    const checks = await Promise.all(
      results.slice(0, 80).map(async (show) =>
        (await isHorrorShow(show.id)) ? show : null
      )
    );

    suggestions.value = checks.filter((s) => s && s.poster_path).slice(0, 10);
    showSuggestions.value = suggestions.value.length > 0;

  } catch (err) {
    console.error('Erro nas sugestões:', err);
  }
};

// 🎯 Selecionar série
const selectSuggestion = (show) => {
  query.value = show.name;
  showSuggestions.value = false;
  emit('select', show.id);
};

// 🔍 Buscar e selecionar manualmente
const searchAndSelect = async () => {
  if (!query.value.trim()) return;

  try {
    const res = await api.get('/search/tv', {
      params: { query: query.value, include_adult: false, language: 'pt-BR' },
    });

    const results = res.data.results || [];
    if (results.length === 0) return;

    const horrorResults = await Promise.all(
      results.slice(0, 20).map(async (show) =>
        (await isHorrorShow(show.id)) ? show : null
      )
    );

    const valid = horrorResults.filter((s) => s);
    if (valid.length === 0) return;

    const selected =
      valid.find((s) => s.name.toLowerCase() === query.value.toLowerCase()) ||
      valid[0];

    emit("select", selected.id);
    showSuggestions.value = false;

  } catch (err) {
    console.error("Erro ao buscar série:", err);
  }
};

// 🔥 LIMPAR BUSCA (igual filmes)
const clearSearch = () => {
  query.value = '';
  suggestions.value = [];
  showSuggestions.value = false;
  clearTimeout(searchTimeout);
};
</script>


<template>
  <div class="input-wrap">
    <input type="text" v-model="query" @input="handleInput" @keyup.enter="searchAndSelect()"
      placeholder="Pesquisar em séries..." class="pesquisa" @focus="showSuggestions = suggestions.length > 0"
      @blur="setTimeout(() => (showSuggestions = false), 150)" />

    <!-- Ícone de limpar -->
    <i v-if="query" class="mdi mdi-close-thick" @click="clearSearch"></i>

    <!-- Ícone de lupa -->
    <i class="mdi mdi-magnify" @click="searchAndSelect()"></i>

    <ul v-if="showSuggestions" class="suggestion-list">
      <li v-for="s in suggestions" :key="s.id" @click="selectSuggestion(s)" class="suggestion-item">
        <img :src="`https://image.tmdb.org/t/p/w92${s.poster_path}`" />
        <span>{{ s.name }}</span>
      </li>
    </ul>
  </div>
</template>


<style scoped>
.input-wrap {
  position: fixed;
  left: 50%;
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
  color: #666;
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
  color: #333;
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
  color: #333;
}

.pesquisa {
  width: 100%;
  /* faz o input se ajustar ao .input-wrap */
  padding: 10px 40px 10px 15px;
  /* espaço extra à direita pro ícone */
  height: 40px;
  border: 1px solid var(--text);
  border-radius: 6px;
  font-size: 16px;
}

.pesquisa:focus {
  outline: none;
  box-shadow: none;
}

.pesquisa:focus-visible {
  outline: 2px solid transparent;
}

.suggestion-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #111;
  border: 1px solid #333;
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
  color: #fff;
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
