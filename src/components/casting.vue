<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';

const isLoading = ref(false);
const actorsAll = ref([]); // Todos os atores
const actorsPage = ref([]); // Atores visíveis na página

// Paginação
const page = ref(1);
const perPage = 22; // atores por página
const totalPages = computed(() => Math.ceil(actorsAll.value.length / perPage));

// Atualiza slice da página atual
const updatePage = () => {
  const start = (page.value - 1) * perPage;
  actorsPage.value = actorsAll.value.slice(start, start + perPage);
};
onMounted(async () => {
  await listHorrorActors();

  // expõe globalmente para teste no console
  window.actorsAll = actorsAll.value;
  console.log('Atores carregados:', window.actorsAll.map(a => a.name));
});

// 🔹 Lista de filmes e séries como antes...
const fetchHorrorMovies = async () => {
  const allResults = [];
  const totalPagesFetch = 3;
  for (let p = 1; p <= totalPagesFetch; p++) {
    const resp = await api.get('discover/movie', {
      params: { with_genres: '27', language: 'pt-BR', sort_by: 'popularity.desc', include_adult: false, page: p }
    });
    allResults.push(...(resp.data.results || []));
  }
  return allResults.filter(m => m.poster_path);
};

const horrorKeywords = [ 12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 33505,];
const fetchHorrorShows = async () => {
  const allResults = [];
  for (const kw of horrorKeywords) {
    const resp = await api.get('discover/tv', {
      params: { with_keywords: kw, language: 'pt-BR', sort_by: 'popularity.desc', include_adult: false, page: 1 }
    });
    allResults.push(...(resp.data.results || []));
  }
  return Array.from(new Map(allResults.map(s => [s.id, s])).values())
    .filter(s => s.poster_path);
};

// 🔹 Função principal
const listHorrorActors = async () => {
  isLoading.value = true;
  const actorMap = new Map();

  try {
    const movies = await fetchHorrorMovies();
    const shows = await fetchHorrorShows();

    // Filmes
    await Promise.all(movies.map(async (movie) => {
      const credits = await api.get(`movie/${movie.id}/credits`, { params: { language: 'pt-BR' } });
      credits.data.cast.forEach(actor => {
        if (!actorMap.has(actor.id)) {
          actorMap.set(actor.id, {
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            popularity: actor.popularity ?? 0, // salva popularidade
            credits: []
          });
        }
        actorMap.get(actor.id).credits.push({ type: 'movie', title: movie.title, character: actor.character });
      });
    }));

    // Séries
    await Promise.all(shows.map(async (show) => {
      const credits = await api.get(`tv/${show.id}/credits`, { params: { language: 'pt-BR' } });
      credits.data.cast.forEach(actor => {
        if (!actorMap.has(actor.id)) {
          actorMap.set(actor.id, {
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            popularity: actor.popularity ?? 0,
            credits: []
          });
        }
        actorMap.get(actor.id).credits.push({ type: 'tv', title: show.name, character: actor.character });
      });
    }));

    // Ordena por popularidade decrescente e filtra sem imagem
    actorsAll.value = Array.from(actorMap.values())
      .filter(a => a.profile_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    page.value = 1;
    updatePage();

  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
  console.log('Atores carregados:', actorsAll.value.map(a => a.name));

  if (actorsAll.value.some(a => a.name === 'Jenna Ortega')) {
    console.log('Jenna Ortega está presente!');
  } else {
    console.log('Jenna Ortega não foi encontrada.');
  }
};

// Navegação da página
const nextPage = () => {
  isLoading.value = true;
  if (page.value < totalPages.value) {
    page.value++;
    updatePage();
    isLoading.value = false;
  }

};
const prevPage = () => {
  isLoading.value = true;
  if (page.value > 1) {
    page.value--;
    updatePage();
    isLoading.value = false;
  }

};

onMounted(async () => await listHorrorActors());
</script>

<template>
  <div>
    <h1>Atores de Terror</h1>
    <loading v-model:active="isLoading" is-full-page />

    <div class="actors-list">
      <div v-for="actor in actorsPage" :key="actor.id" class="actor-card">
        <img :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`" :alt="actor.name" />
        <p class="actor-name">{{ actor.name }}</p>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="page === 1">Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Próximo</button>
    </div>
  </div>
</template>

<style scoped>
.actors-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.actor-card {
  width: 140px;
  text-align: center;
}

.actor-card img {
  width: 140px;
  border-radius: 10px;
}

.actor-name {
  font-weight: bold;
  margin-top: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
