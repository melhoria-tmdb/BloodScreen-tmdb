<script setup>
import { ref, onMounted, provide, watch, computed } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

// ⚠️ Mudei para os componentes de Filme
import SubgenreListMovie from '@/components/Movies/SubgenreListMovie.vue';
import MovieList from '@/components/Movies/MovieList.vue';

const isLoading = ref(false);
const router = useRouter();

const handleMovieSelect = (movieId) => {
    console.log('NAVEGAÇÃO LOCAL (MovieList): Tentando ir para MovieDetails com ID:', movieId);
    router.push({ name: 'MovieDetails', params: { movieId } });
};

// --- Variáveis de Dados e Paginação ---
const totalMovies = ref([]); // Array mestre com todos os resultados únicos
const moviesPerPage = 20; // Limitação de 20 filmes por página

const topRatedMovies = ref([]); // Os 20 melhores filmes para o carrossel (ajustado de 5 para 20 no carrossel)
const currentFeaturedIndex = ref(0); // Índice atual do carrossel

const currentPage = ref(1);
const totalPages = ref(1);

const currentSubgenre = ref(null); // Usado para destacar o item na SubgenreListMovie

// 🎬 Subgêneros com keywords (mantidos do seu arquivo)
const subgenres = [
    { id: null, name: 'Todos', keywords: [], bannerPath: '/imgs/subgeneros_filmes/filme banner.png' },

    { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714], imagePath: '/public/imgs/subgeneros_filmes/Slasher.png', synopsis: 'Subgênero focado em assassinos que perseguem e eliminam vítimas de forma violenta e direta' },

    { id: 'monster', name: 'Monstro', keywords: [1299, 238534, 210614, 33696, 214881, 252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193, 183787, 289108, 215790], imagePath: '/public/imgs/subgeneros_filmes/Monstro.png', synopsis: 'Filmes centrados em criaturas grandes, mutantes ou mitológicas que causam terror' },

    { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377], imagePath: '/public/imgs/subgeneros_filmes/Psicologico.jpg', synopsis: 'Subgênero que explora a mente humana, destacando paranoia, trauma e distorções da realidade' },
    { id: 'zombie', name: 'Zumbi', keywords: [8624, 12377, 186565, 9925, 304449, 310175, 312469, 357193, 4884, 10349], imagePath: '/public/imgs/subgeneros_filmes/Zumbi.png', synopsis: 'Subgênero do horror que envolve zumbis ou infectados que são cadáveres reanimados' },
    { id: 'supernatural', name: 'Sobrenatural', keywords: [344360, 162846, 351863, 166701, 3358, 2626, 13153, 15043, 241827, 256183, 323566, 212661, 249694, 33630, 240377, 4720, 161270, 162745, 167890, 10541], imagePath: '/public/imgs/subgeneros_filmes/Supernatural.jpg', synopsis: 'Subgênero centrado em forças além da compreensão humana, como espíritos, demônios e fenômenos paranormais' },
    { id: 'gore', name: 'Gore', keywords: [10292, 351656, 157758, 14546, 306196, 325798, 280075, 284439, 157676, 10714, 447], imagePath: '/public/imgs/subgeneros_filmes/Gore.png', synopsis: 'Subgênero que foca em violência explícita, sangue e ferimentos gráficos' },
    { id: 'found_footage', name: 'Found Footage', keywords: [163053, 319819, 340385, 342857, 345179], imagePath: '/public/imgs/subgeneros_filmes/Found Footage.jpg', synopsis: 'Filmes apresentados como gravações "encontradas" ou amadoras, criando um senso de realismo' },
];


const selectableSubgenres = subgenres.slice(1);

// --- Lógica de Paginação (Adaptado de TvView) ---

// Retorna 20 filmes da página atual
const displayedMovies = computed(() => {
    const start = (currentPage.value - 1) * moviesPerPage;
    const end = start + moviesPerPage;

    return totalMovies.value.slice(start, end);
});

// Primeira metade da lista de 20 (10 filmes)
const moviesTopHalf = computed(() => {
    return displayedMovies.value.slice(0, 10);
});

// Segunda metade da lista de 20 (10 filmes)
const moviesBottomHalf = computed(() => {
    return displayedMovies.value.slice(10);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};


const prevPage = () => {
    goToPage(currentPage.value - 1);
};

const nextPage = () => {
    goToPage(currentPage.value + 1);
};

const pageNumbers = computed(() => {
    const pages = [];
    const maxVisible = 7;
    const half = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage.value - half);
    let endPage = Math.min(totalPages.value, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (startPage > 1) {
        pages.unshift(1, '...');
    }
    if (endPage < totalPages.value) {
        pages.push('...', totalPages.value);
    }

    return Array.from(new Set(pages));
});

// --- Lógica do Carrossel (Adaptado de TvView) ---

// ➡️ Função de navegação para o próximo item
const nextMovie = () => {
    if (topRatedMovies.value.length > 0) {
        currentFeaturedIndex.value = (currentFeaturedIndex.value + 1) % topRatedMovies.value.length;
    }
};

// ⬅️ Função de navegação para o item anterior
const prevMovie = () => {
    if (topRatedMovies.value.length > 0) {
        const total = topRatedMovies.value.length;
        currentFeaturedIndex.value = (currentFeaturedIndex.value - 1 + total) % total;
    }
};


const listMovies = async (sub) => {
    if (sub && sub.id !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
        router.push({
            name: 'SubgenreMovie',
            params: { subgenreId: sub.id }
        });
        return;
    }


    if (!sub || sub.id !== null) return;

    try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        isLoading.value = true;
        totalMovies.value = [];
        topRatedMovies.value = [];
        currentFeaturedIndex.value = 0;
        currentPage.value = 1;
        totalPages.value = 1;

        currentSubgenre.value = sub.id;

        const allResults = [];
        // 🚨 Lógica de listagem para 'Todos' usando Genre ID 27 (Horror)
        const pagesToLoad = 29;

        for (let page = 1; page <= pagesToLoad; page++) {
            // Buscamos os filmes de terror (Gênero ID 27) ordenados por vote_average.desc
            // para garantir que os melhores apareçam primeiro.
            const resp = await api.get('discover/movie', {
                params: {
                    with_genres: '27',
                    sort_by: 'popularity.desc', // ⚠️ Mudança de 'popularity.desc' para 'vote_average.desc'
                    language: 'pt-BR',
                    include_adult: false,
                    page,
                },
            });
            allResults.push(...(resp.data.results || []));
        }

        // 1. 🗑️ Remove duplicatas
        const uniqueMovies = Array.from(new Map(allResults.map(m => [m.id, m])).values());

        // 2. 🧹 Filtra sem poster_path e ordena
        const sortedMovies = uniqueMovies
            .filter(m => m.poster_path)
            .sort((a, b) => {
                // Prioriza vote_average, depois popularity
                return (b.popularity - a.popularity) || (b.popularity - a.popularity);
            });


        // 3. ✂️ SEPARA OS 20 MELHORES para o carrossel (ajustado de 5 para 20 no carrossel)
        const featuredCount = 20;
        topRatedMovies.value = sortedMovies.slice(0, featuredCount);

        // 4. 🔪 AS DEMAIS VÃO PARA PAGINAÇÃO
        const paginatedMovies = sortedMovies.slice(featuredCount);
        totalMovies.value = paginatedMovies;

        // 5. 🔢 CALCULA O TOTAL DE PÁGINAS (do conteúdo paginável)
        totalPages.value = Math.ceil(totalMovies.value.length / moviesPerPage);
        if (totalPages.value === 0 && totalMovies.value.length > 0) totalPages.value = 1;


    } catch (err) {
        console.error('Erro listMovies:', err);
        totalMovies.value = [];
        topRatedMovies.value = [];
        totalPages.value = 1;
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
   window.scrollTo({ top: 0, behavior: 'smooth' });
    // Carrega o subgênero 'Todos' ao montar a view
    const allSubgenre = subgenres.find(sub => sub.id === null);
    if (allSubgenre) {
        await listMovies(allSubgenre);
    }
});

</script>

<template>
    <div id="banner">
        <img :src="subgenres[0].bannerPath" :alt="`Banner ${subgenres[0].name}`" class="banner-image">
    </div>

    <div id="body" class="page-container custom-scrollbar">

        <div id="genres">
            <SubgenreListMovie :subgenres="selectableSubgenres" :current="currentSubgenre" @change="listMovies" />
        </div>

        <loading v-model:active="isLoading" is-full-page />

        <div id="movies">
            <h2 v-if="moviesTopHalf.length > 0">Recomendados (Pág. {{ currentPage }})</h2>
            <MovieList :movies="moviesTopHalf" @select="handleMovieSelect" />

            <div v-if="topRatedMovies.length > 0" class="top-rated-carousel-wrapper">

                <div class="featured-movie-card" @click="handleMovieSelect(topRatedMovies[currentFeaturedIndex].id)">
                    <div class="poster-and-controls-column">
                        <div class="featured-poster-wrapper">
                            <img :src="`https://image.tmdb.org/t/p/w500${topRatedMovies[currentFeaturedIndex].poster_path}`"
                                :alt="topRatedMovies[currentFeaturedIndex].title" class="featured-poster" />
                        </div>
                        <div class="carousel-controls">
                            <div class="arrows">
                                <button @click.stop="prevMovie" class="nav-button prev-button">
                                    &lt;
                                </button>
                                <button @click.stop="nextMovie" class="nav-button next-button">
                                    &gt;
                                </button>
                            </div>
                            <div class="numbers">
                                <span class="carousel-counter">
                                    {{ currentFeaturedIndex + 1 }}/{{ topRatedMovies.length }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="featured-info">
                        <h3 class="featured-name">
                            {{ topRatedMovies[currentFeaturedIndex].title }}
                            <span class="featured-year">({{ new Date(topRatedMovies[currentFeaturedIndex].release_date).getFullYear()
                            }})</span>
                        </h3>

                        <p class="featured-synopsis">{{ topRatedMovies[currentFeaturedIndex].overview }}</p>

                        <div class="featured-meta">
                            <p class="featured-rating">Avaliação: {{ topRatedMovies[currentFeaturedIndex].vote_average.toFixed(1) }}
                                /
                                10.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <MovieList :movies="moviesBottomHalf" @select="handleMovieSelect" />

        <div class="pagination-container" v-if="totalPages > 1">

            <button @click="prevPage" :disabled="currentPage === 1 || isLoading" class="pagination-button nav-arrow">
                &lt; Anterior
            </button>

            <template v-for="(page, index) in pageNumbers" :key="index">

                <span v-if="page === '...'" class="page-ellipsis">...</span>

                <button v-else @click="goToPage(page)" :class="['pagination-button', { 'active-page': page === currentPage }]"
                    :disabled="isLoading">
                    {{ page }}
                </button>

            </template>

            <button @click="nextPage" :disabled="currentPage === totalPages || isLoading" class="pagination-button nav-arrow">
                Próxima &gt;
            </button>

        </div>
    </div>
</template>

<style scoped>
/* 🎨 Estilos mantidos de TvView.vue / SubgenreShowView.vue */
#banner {
    line-height: 0;
    background-color: var(--bg);
}

.banner-image {
    width: 100%;
    mask-image: linear-gradient(to bottom, var(--bg) 60%, transparent 95%);
}

#body {
    background-color: var(--bg);
    color: var(--text);

    background-image: linear-gradient(to bottom,
        var(--bg) 0%,
        var(--bg) 5%,

        #310101 55%,
        #310101 65%,


        var(--bg) 95%,
        var(--bg) 100%);

    min-height: 100vh;
    padding-top: 50px;
}

.subgenre-title {
    font-family: 'K2D', bold;
    font-size: 4rem;
    color: var(--text);
    text-align: center;
    position: relative;
    z-index: 2;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    margin-top: -100px;
    margin-bottom: 50px;
}

#genres {
    margin: 6vw 0 6vw 0;
}

#movies h2 {
    font-family: 'K2D', thin;
    font-size: 38px;
    text-align: center;
    color: var(--text);
}

/* 🌟 ESTILOS DO CARROSSEL DE FILMES BEM AVALIADOS 🌟 */

.top-rated-carousel-wrapper {
    width: 100%;
    max-width: 1400px;
    margin: 5rem auto 5rem auto;
}

.featured-movie-card {
    display: flex;
    align-items: center;
    padding: 4rem;
    background-color: transparent;
    border-radius: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 80%;
    margin: 0 auto;
    cursor: pointer;
    gap: 20rem;
}


.featured-poster-wrapper {
    position: relative;
    width: 300px;
    height: 500px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    overflow: hidden;
}

.featured-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.featured-info {
    flex-grow: 1;
    color: var(--text);
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.featured-name {
    font-family: 'K2D', thin;
    font-size: 3rem;
    width: 130%;
    font-weight: 400;
    color: white;
    line-height: 1.1;
}

.featured-year {
    font-size: 1.2rem;
    font-weight: 300;
    color: white;
}

.featured-synopsis {
  font-size: 1.3rem;
  line-height: 1.6;
  color: white;
  margin-top: 1rem;
  margin-bottom: 0rem;
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  overflow: hidden;

  width: 120%;
}

.featured-rating {
    font-size: 1.1rem;
    color: #ff4747;
    font-weight: 600;
}

.poster-and-controls-column {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 300px;
}

/* ⬅️➡️ CONTROLES DE CARROSSEL ⬅️➡️ */

.carousel-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: transparent;
    color: #ADADAD;
    font-family: 'K2D', regular;
    margin-top: 10px;
}

.nav-button {
    background: none;
    border: none;
    color: #ADADAD;
    font-size: 1.1rem;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1;
    font-weight: 10;
    font-family: 'K2D', regular;
}

.nav-button:hover {
    color: #ff4747;
}

.carousel-counter {
    font-size: 0.9rem;
    font-family: 'K2D', thin;
}


/* 🚨 ESTILOS: Paginação Numerada */

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 3rem;
    margin-bottom: 4rem;
}

.pagination-button {
    background-color: #333;
    color: white;
    border: 1px solid #444;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    min-width: 40px;
    margin-bottom: 1.5rem;
}

.pagination-button:hover:not(:disabled):not(.active-page) {
    background-color: #444;
    border-color: #ff4747;
}

.pagination-button:disabled {
    background-color: #222;
    color: #666;
    cursor: not-allowed;
    border-color: #333;
}

.active-page {
    background-color: #ff4747;
    color: white;
    font-weight: bold;
    border-color: #ff4747;
    cursor: default;
}

.active-page:hover {
    background-color: #ff4747;
}

.nav-arrow {
    background-color: #1a1a1a;
    border-color: #ff4747;
}

.nav-arrow:hover:not(:disabled) {
    background-color: #ff4747;
    color: white;
}

.page-ellipsis {
    color: #aaa;
    padding: 10px 5px;
    font-size: 1.2rem;
}
</style>
