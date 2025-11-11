<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();
const movies = ref([]);
const currentSubgenre = ref(null);

const query = ref('');

const suggestions = ref([]);
const showSuggestions = ref(false);
let searchTimeout = null;


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

const searchMovie = async () => {
  if (!query.value.trim()) return;

  try {
    isLoading.value = true;
    const res = await api.get('/search/movie', {
      params: {
        query: query.value,
        include_adult: false,
        language: 'pt-BR',
      },
    });

    // 🔥 mantém só filmes de terror
    const results = (res.data.results || []).filter(
      (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(27)
    );

    if (results.length > 0) {
      const normalizedQuery = query.value.toLowerCase().trim();

      // tenta achar correspondência exata (sem acentos)
      const exactMatch = results.find(
        (m) =>
          m.title.toLowerCase() === normalizedQuery ||
          m.title.toLowerCase().includes(normalizedQuery)
      );

      const chosen = exactMatch || results[0];
      const movieId = chosen.id;

      router.push({ name: 'MovieDetails', params: { movieId } });
    } else {
      alert('Nenhum filme de terror encontrado 😢');
    }
  } catch (err) {
    console.error('Erro na pesquisa:', err);
  } finally {
    isLoading.value = false;
  }
};

// dispara busca enquanto o usuário digita
const handleInput = () => {
  clearTimeout(searchTimeout);
  if (!query.value.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  searchTimeout = setTimeout(fetchSuggestions, 400); // debounce
};

const fetchSuggestions = async () => {
  try {
    const res = await api.get('/search/movie', {
      params: {
        query: query.value,
        include_adult: false,
        language: 'pt-BR',
      },
    });

    // 🩸 filtra apenas filmes do gênero terror
    suggestions.value = (res.data.results || [])
      .filter((m) => m.poster_path && m.genre_ids.includes(27))
      .slice(0, 10); // mostra até 10 sugestões roláveis

    showSuggestions.value = suggestions.value.length > 0;
  } catch (err) {
    console.error('Erro ao buscar sugestões:', err);
  }
};

const selectSuggestion = (movie) => {
  query.value = movie.title;
  showSuggestions.value = false;
  router.push({ name: 'MovieDetails', params: { movieId: movie.id } });
};

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

onMounted(async () => {
  await listMovies(subgenres[0]); // "Todos"
});
</script>

<template>

   <div id="top">
    <h1>Filmes de Terror</h1>
    <div class="input-wrap">
  <input
    type="text"
    v-model="query"
    @input="handleInput"
    @keyup.enter="searchMovie"
    placeholder="Pesquisar em filmes..."
    class="pesquisa"
    @focus="showSuggestions = suggestions.length > 0"
    @blur="setTimeout(() => (showSuggestions = false), 150)"
  />
  <i class="mdi mdi-magnify" @click="searchMovie"></i>

  <ul v-if="showSuggestions" class="suggestion-list">
    <li
      v-for="s in suggestions"
      :key="s.id"
      @click="selectSuggestion(s)"
      class="suggestion-item"
    >
      <img :src="`https://image.tmdb.org/t/p/w92${s.poster_path}`" />
      <span>{{ s.title }}</span>
    </li>
  </ul>
</div>
  </div>


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
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title"
        @click="router.push({ name: 'MovieDetails', params: { movieId: movie.id } })" />
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

/* Botões dos subgêneros */
.genre-item {
  background-color: #7a0b0b; /* vermelho escuro base */
  border-radius: 1rem;
  padding: 0.5rem 1.2rem;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.4);
}

.genre-item:hover {
  cursor: pointer;
  background-color: #a31313; /* vermelho mais vibrante */
  box-shadow: 0 0 0.8rem #ff2a2a; /* brilho vermelho */
  transform: translateY(-2px);
}

/* Subgênero ativo */
.genre-item.active {
  background-color: #c71616; /* vermelho sangue intenso */
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 1rem #ff4747;
  transform: scale(1.08);
  border: 2px solid #fff;
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
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
  cursor: pointer;
}

.movie-card img {
  width: 100%;
  height: 21rem;
  object-fit: cover;
  border-bottom: 2px solid #220000;
}

/* Container de texto */
.movie-details {
  flex: 1;
  width: 100%;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

/* Título do filme */
.movie-title {
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

/* Data de lançamento */
.movie-date {
  font-size: 0.85rem;
  color: #bfbfbf;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
}

/* Gêneros */
.movie-genres {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.movie-genres span {
  background-color: #7a0b0b;
  border-radius: 0.4rem;
  padding: 0.25rem 0.6rem;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.movie-genres span:hover {
  background-color: #a31313;
  box-shadow: 0 0 0.4rem #ff3030;
  cursor: pointer;
}

.movie-genres span.active {
  background-color: #c71616;
  color: #fff;
  box-shadow: 0 0 0.5rem #ff4d4d;
}

.movie-genres span.active:hover {
  background-color: #a31313;
  box-shadow: 0 0 0.7rem #ff6666;
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
