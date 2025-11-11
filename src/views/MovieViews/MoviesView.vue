<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

import SearchBarMovie from '@/components/Movies/SearchBarMovie.vue'
import SubgenreListMovie from '@/components/Movies/SubgenreListMovie.vue'
import MovieList from '@/components/Movies/MovieList.vue'

const isLoading = ref(false);
const router = useRouter();
const movies = ref([]);
const currentSubgenre = ref(null);

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: [] },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714] },
  { id: 'monster', name: 'Monstro', keywords: [1299, 238534, 210614, 33696, 214881, 252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193, 183787, 289108, 215790] },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377] },
  { id: 'zombie', name: 'Zumbi', keywords: [8624, 12377, 186565, 9925, 304449, 310175, 312469, 357193, 4884, 10349] },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [344360, 162846, 351863, 166701, 3358, 2626, 13153, 15043, 241827, 256183, 323566, 212661, 249694, 33630, 240377, 4720, 161270, 162745, 167890, 10541] },
  { id: 'gore', name: 'Gore', keywords: [10292, 351656, 157758, 14546, 306196, 325798, 280075, 284439, 157676, 10714, 447] },
  { id: 'found_footage', name: 'Found Footage', keywords: [163053, 319819, 340385, 342857, 345179] },
];

const listMovies = async (sub) => {
  try {
    isLoading.value = true;
    movies.value = [];
    currentSubgenre.value = sub?.id ?? null;

    // 🧠 Caso "Todos" (sem keywords)
    if (!sub || !Array.isArray(sub.keywords) || sub.keywords.length === 0) {
      const allResults = [];
      const totalPages = 6; // 🔁 busca mais páginas para pegar mais filmes

      for (let page = 1; page <= totalPages; page++) {
        const resp = await api.get('discover/movie', {
          params: {
            with_genres: '27',
            sort_by: 'popularity.desc',
            language: 'pt-BR',
            include_adult: false,
            page,
          },
        });
        allResults.push(...(resp.data.results || []));
      }

      const uniqueMovies = Array.from(
        new Map(allResults.map(m => [m.id, m])).values()
      );

      // 🔥 FILTRA filmes sem poster
      movies.value = uniqueMovies
        .filter(m => m.poster_path) // remove filmes sem imagem
        .sort((a, b) => {
          const da = a.release_date ? new Date(a.release_date).getTime() : 0;
          const db = b.release_date ? new Date(b.release_date).getTime() : 0;
          return db - da;
        });

      return;
    }

    // 🧩 Para subgêneros com keywords
    const responses = await Promise.all(
      sub.keywords.map((kw) =>
        api
          .get(`keyword/${kw}/movies`, {
            params: { language: 'pt-BR', page: 1 },
          })
          .then((r) => r.data.results || [])
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

    // 🔥 FILTRA filmes sem poster também aqui
    movies.value = Array.from(mapById.values())
      .filter(m => m.poster_path) // 👈 evita filmes sem imagem
      .sort((a, b) => {
        const da = a.release_date ? new Date(a.release_date).getTime() : 0;
        const db = b.release_date ? new Date(b.release_date).getTime() : 0;
        return db - da;
      });

  } catch (err) {
    console.error('Erro listMovies:', err);
    movies.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleMovieSelect = (movieId) => {
  router.push({ name: 'MovieDetails', params: { movieId } });
};

onMounted(async () => {
  await listMovies(subgenres[0]); // "Todos"
});
</script>

<template>
  <div id="top">
    <h1>Filmes de Terror</h1>

    <SearchBarMovie @select="handleMovieSelect" />
  </div>

  <SubgenreListMovie :subgenres="subgenres" :current="currentSubgenre" @change="listMovies" />

  <loading v-model:active="isLoading" is-full-page />

  <MovieList :movies="movies" @select="handleMovieSelect" />
</template>


<style scoped>
#top {
  display: flex;
  justify-content: space-between;
  padding: 2vw;
  align-items: center;
}
</style>
