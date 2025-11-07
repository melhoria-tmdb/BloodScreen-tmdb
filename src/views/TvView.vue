<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();
const shows = ref([]);
const currentSubgenre = ref(null);

const query = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);
let searchTimeout = null;

// 🔥 Verifica se a série possui keywords de terror
const isHorrorShow = async (tvId) => {
  try {
    const res = await api.get(`/tv/${tvId}`, {
      params: { language: 'pt-BR' },
    });
    const keywordsRes = await api.get(`/tv/${tvId}/keywords`);
    const keywords = keywordsRes.data.results?.map((k) => k.id) || [];
    return keywords.some((id) => horrorKeywordList.includes(id));
  } catch (err) {
    console.error('Erro ao verificar série de terror:', err);
    return false;
  }
};

// 🔍 Pesquisa principal (ao apertar Enter)
const searchShow = async () => {
  if (!query.value.trim()) return;

  try {
    isLoading.value = true;

    const res = await api.get('/search/tv', {
      params: {
        query: query.value,
        include_adult: false,
        language: 'pt-BR',
      },
    });

    const results = res.data.results || [];
    if (results.length === 0) {
      alert('Nenhuma série encontrada 😢');
      return;
    }

    // 🔥 Filtra apenas séries de terror
    const checks = await Promise.all(
      results.slice(0, 10).map(async (show) =>
        (await isHorrorShow(show.id)) ? show : null
      )
    );

    const filtered = checks.filter(Boolean);

    if (filtered.length > 0) {
      const chosen = filtered[0];
      router.push({ name: 'ShowDetails', params: { tvId: chosen.id } });
    } else {
      alert('Nenhuma série de terror encontrada 😢');
    }
  } catch (err) {
    console.error('Erro na pesquisa:', err);
  } finally {
    isLoading.value = false;
  }
};

// 🧠 Sugestões enquanto o usuário digita
const handleInput = () => {
  clearTimeout(searchTimeout);
  if (!query.value.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  searchTimeout = setTimeout(fetchSuggestions, 400);
};

// 🩸 Busca sugestões roláveis e relevantes
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

    // 🔥 Verifica se as séries têm relação com terror
    const checks = await Promise.all(
      results.slice(0, 15).map(async (show) =>
        (await isHorrorShow(show.id)) ? show : null
      )
    );

    // 🩸 Exibe até 10 sugestões roláveis e com poster
    suggestions.value = checks
      .filter((s) => s && s.poster_path)
      .slice(0, 10);

    showSuggestions.value = suggestions.value.length > 0;
  } catch (err) {
    console.error('Erro ao buscar sugestões:', err);
  }
};

// 🎯 Ao clicar em uma sugestão
const selectSuggestion = (show) => {
  query.value = show.name;
  showSuggestions.value = false;
  router.push({ name: 'ShowDetails', params: { showId: show.id } });
};

// 🧠 Keywords principais de terror (TMDB)
const horrorKeywordList = [
  12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 1299, 238534, 210614, 33696, 214881,
  252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193,
  183787, 289108, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 10292, 351656,
];

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: horrorKeywordList },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714] },
  { id: 'monster', name: 'Monstro', keywords: [1299, 238534, 210614, 33696, 214881, 252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193, 183787, 289108, 215790] },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377] },
  { id: 'zombie', name: 'Zumbi', keywords: [12377, 186565] },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [9853, 172808, 161261, 251874, 256183] },
  { id: 'gore', name: 'Gore', keywords: [10292, 351656] },
];

// 🔥 Função para listar séries
const listShows = async (sub) => {
  try {
    isLoading.value = true;
    shows.value = [];
    currentSubgenre.value = sub?.id ?? null;

    const totalPages = 3;
    const allResults = [];

    if (!sub || !Array.isArray(sub.keywords) || sub.keywords.length === 0) {
      for (let page = 1; page <= totalPages; page++) {
        const resp = await api.get('discover/tv', {
          params: {
            language: 'pt-BR',
            sort_by: 'popularity.desc',
            include_adult: false,
            page,
          },
        });
        allResults.push(...(resp.data.results || []));
      }
    } else {
      const responses = await Promise.all(
        sub.keywords.map((kw) =>
          api
            .get('discover/tv', {
              params: {
                with_keywords: kw,
                language: 'pt-BR',
                sort_by: 'popularity.desc',
                include_adult: false,
                page: 1,
              },
            })
            .then((r) => r.data.results || [])
            .catch(() => [])
        )
      );
      for (const list of responses) allResults.push(...list);
    }

    const uniqueShows = Array.from(new Map(allResults.map((s) => [s.id, s])).values());

    shows.value = uniqueShows
      .filter((s) => s.poster_path)
      .sort((a, b) => {
        const da = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
        const db = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
        return db - da;
      });
  } catch (err) {
    console.error('Erro listShows:', err);
    shows.value = [];
  } finally {
    isLoading.value = false;
  }
};

function openShow(showId) {
  router.push({ name: 'ShowDetails', params: { showId } });
}

onMounted(async () => {
  await listShows(subgenres[0]);
});
</script>

<template>
  <div id="top">
    <h1>Séries de Terror</h1>
    <div class="input-wrap">
      <input
        type="text"
        v-model="query"
        @input="handleInput"
        @keyup.enter="searchShow"
        placeholder="Pesquisar em séries..."
        class="pesquisa"
        @focus="showSuggestions = suggestions.length > 0"
        @blur="setTimeout(() => (showSuggestions = false), 150)"
      />
      <i class="mdi mdi-magnify" @click="searchShow"></i>

      <!-- 🔥 Sugestões roláveis -->
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
  </div>

  <!-- Subgêneros -->
  <ul class="genre-list">
    <li
      v-for="sub in subgenres"
      :key="sub.id || 'all'"
      @click="listShows(sub)"
      class="genre-item"
      :class="{ active: sub.id === currentSubgenre }"
    >
      {{ sub.name }}
    </li>
  </ul>

  <loading v-model:active="isLoading" is-full-page />

  <!-- Lista -->
  <div class="show-list">
    <div v-for="show in shows" :key="show.id" class="show-card">
      <img
        :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`"
        :alt="show.name"
        @click="openShow(show.id)"
      />
      <div class="show-details">
        <p class="show-title">{{ show.name }}</p>
        <p class="show-release-date">
          {{ new Date(show.first_air_date).toLocaleDateString('pt-BR') }}
        </p>
      </div>
    </div>
  </div>
</template>



<style scoped>
#top {
  display: flex;
  justify-content: space-between;
  padding: 2vw;
  align-items: center;
}
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0.5rem;
  margin-top: 1.5rem;
}

.genre-item {
  background-color: #7a0b0b;
  border-radius: 1rem;
  padding: 0.5rem 1.2rem;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.4);
}

.genre-item:hover {
  cursor: pointer;
  background-color: #a31313;
  box-shadow: 0 0 0.8rem #ff2a2a;
  transform: translateY(-2px);
}

.genre-item.active {
  background-color: #c71616;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 1rem #ff4747;
  transform: scale(1.08);
  border: 2px solid #fff;
}

.show-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 3vw;
}

.show-card {
  width: 15rem;
  height: 30rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.show-card:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
  cursor: pointer;
}

.show-card img {
  width: 100%;
  height: 21rem;
  object-fit: cover;
  border-bottom: 2px solid #220000;
}

.show-details {
  flex: 1;
  width: 100%;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

.show-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 1.3rem;
  margin-bottom: 0.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.show-release-date {
  font-size: 0.85rem;
  color: #bfbfbf;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
}

/* PESQUISA */
.input-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 400px; /* limite opcional — pode aumentar ou remover */
}

.input-wrap i {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
}

.pesquisa {
  width: 100%; /* faz o input se ajustar ao .input-wrap */
  padding: 10px 40px 10px 15px; /* espaço extra à direita pro ícone */
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}
.pesquisa:focus {
  outline: none;
  border-color: transparent;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);

  /* 🧭 Adiciona rolagem */
  max-height: 300px; /* altura máxima visível */
  overflow-y: auto; /* ativa scroll vertical */

  /* Opcional: scroll suave e estilizado */
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
