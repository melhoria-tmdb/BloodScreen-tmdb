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
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183,
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
      params: {
        query: query.value,
        include_adult: false,
        language: 'pt-BR',
      },
    });
    const results = res.data.results || [];

    const checks = await Promise.all(
      results.slice(0, 15).map(async (show) =>
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
</script>

<template>
  <div class="input-wrap">
    <input
      type="text"
      v-model="query"
      @input="handleInput"
      @keyup.enter="emit('select', query)"
      placeholder="Pesquisar em séries..."
      class="pesquisa"
      @focus="showSuggestions = suggestions.length > 0"
      @blur="setTimeout(() => (showSuggestions = false), 150)"
    />
    <i class="mdi mdi-magnify" @click="emit('select', query)"></i>

    <ul v-if="showSuggestions" class="suggestion-list">
      <li
        v-for="s in suggestions"
        :key="s.id"
        @click="selectSuggestion(s)"
        class="suggestion-item"
      >
        <img :src="`https://image.tmdb.org/t/p/w92${s.poster_path}`" />
        <span>{{ s.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.input-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 400px;
}
.input-wrap i {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
  cursor: pointer;
}
.pesquisa {
  width: 100%;
  padding: 10px 40px 10px 15px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
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
