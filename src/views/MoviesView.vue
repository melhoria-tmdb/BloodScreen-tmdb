<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();
const movies = ref([]);
const currentSubgenre = ref(null);

// Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: [] },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714] },
  { id: 'monster', name: 'Monstro', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992] },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701] },
  { id: 'zombie', name: 'Zumbi', keywords: [8624, 12377, 186565, 9925, 304449, 310175, 312469, 357193, 4884] },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [344360, 162846, 351863, 166701] },
  { id: 'gore', name: 'Gore', keywords: [10292, 351656, 157758] },
];

const listMovies = async (sub) => {
  try {
    isLoading.value = true;
    movies.value = [];
    currentSubgenre.value = sub?.id ?? null;

    if (!sub || !Array.isArray(sub.keywords) || sub.keywords.length === 0) {
      const resp = await api.get('discover/movie', {
        params: { with_genres: '27', sort_by: 'popularity.desc', language: 'pt-BR', page: 1 },
      });
      movies.value = resp.data.results || [];
      return;
    }

    // Para subgênero -> busca cada keyword separadamente
    const responses = await Promise.all(
      sub.keywords.map((kw) =>
        api.get(`keyword/${kw}/movies`, { params: { language: 'pt-BR', page: 1 } })
          .then(r => r.data.results || [])
          .catch(() => [])
      )
    );

    // Junta resultados, filtra terror e deduplica
    const mapById = new Map();
    for (const list of responses) {
      for (const m of list) {
        if (Array.isArray(m.genre_ids) && m.genre_ids.includes(27)) {
          mapById.set(m.id, m);
        }
      }
    }

    movies.value = Array.from(mapById.values()).sort((a, b) => {
      const da = a.release_date ? new Date(a.release_date).getTime() : 0;
      const db = b.release_date ? new Date(b.release_date).getTime() : 0;
      return db - da;
    });

  } catch (err) {
    console.error(err);
    movies.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await listMovies(subgenres[0]); // "Todos"
});
</script>


<template>
  <h1>Filmes de Terror</h1>

  <!-- subgêneros -->
  <ul class="genre-list">
    <li
      v-for="sub in subgenres"
      :key="sub.id || 'all'"
      @click="listMovies(sub)"
      class="genre-item"
      :class="{ active: sub.id === currentSubgenre }"
    >
      {{ sub.name }}
    </li>
  </ul>

  <loading v-model:active="isLoading" is-full-page />

  <div class="movie-list">
    <div v-for="movie in movies" :key="movie.id" class="movie-card">
      <img
        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
        :alt="movie.title"
        @click="router.push({ name: 'MovieDetails', params: { movieId: movie.id } })"
      />
      <div class="movie-details">
        <p class="movie-title">{{ movie.title }}</p>
        <p class="movie-release-date">
          {{ new Date(movie.release_date).toLocaleDateString('pt-BR') }}
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  list-style: none;
  padding: 0.5vw;
}

.genre-item {
  background-color: #387250;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  color: #fff;
}

.genre-item:hover {
  cursor: pointer;
  background-color: #4e9e5f;
  box-shadow: 0 0 0.5rem #387250;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 3vw;
}

.movie-card {
  width: 15rem;
  height: 30rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 0.5rem #000;
}

.movie-card:hover {
  transform: scale(1.05);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.movie-card img {
  width: 100%;
  height: 20rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem #000;
}

.movie-details {
  padding: 0 0.5rem;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1.3rem;
  height: 3.2rem;
}

.movie-genres {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 0.2rem;
  margin-top: 0.5vw;
}

.movie-genres span {
  background-color: #387250;
  border-radius: 0.5rem;
  padding: 0.2rem 0.5rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: bold;
}

.movie-genres span:hover {
  cursor: pointer;
  background-color: #1d4e31;
  box-shadow: 0 0 0.5rem #63c48b;
}

.active {
  background-color: #67b086;
  font-weight: bolder;
}

.movie-genres span.active {
  background-color: #1d4e31;
  color: #000;
  font-weight: bolder;
}
.movie-genres span.active:hover {
  background-color: #387250;
  box-shadow: 0 0 0.5rem #83e7ad;
}
</style>
