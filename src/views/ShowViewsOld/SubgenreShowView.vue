<script setup>
import { ref, provide, watch, computed } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter, useRoute } from 'vue-router';

import ShowList from '@/components/Shows/ShowList.vue';

const isLoading = ref(false);
const router = useRouter();
const route = useRoute();
const shows = ref([]);

const totalShows = ref([]);
const showsPerPage = 20;

const topRatedShows = ref([]);
const currentFeaturedIndex = ref(0);

const currentPage = ref(1);
const totalPages = ref(1);
const hasMoreShows = ref(true);

const currentSubgenreDetails = ref(null);
const currentSubgenreName = ref('');
const currentSubgenreBanner = ref('');

const props = defineProps({
  subgenreId: {
    type: String,
    required: true,
  },
});

const displayedShows = computed(() => {
  const start = (currentPage.value - 1) * showsPerPage;
  const end = start + showsPerPage;

  return totalShows.value.slice(start, end);
});

const showsTopHalf = computed(() => {
  return displayedShows.value.slice(0, 10);
});

const showsBottomHalf = computed(() => {
  return displayedShows.value.slice(10);
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

const horrorKeywordList = [
  12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 33505,
];

const subgenres = [
  { id: null, name: 'Todos', keywords: horrorKeywordList },

  { id: 'zombie', name: 'Zumbi', keywords: [12377, 186565], imagePath: '/imgs/subgeneros_series/Zumbi.png', synopsis: 'Subgênero do horror que envolve zumbis ou infectados que são cadáveres reanimados', bannerPath: '/imgs/subgeneros_series/Zumbi banner.png' },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714], imagePath: '/imgs/subgeneros_series/Slasher.jpg', synopsis: 'Subgênero focado em assassinos que perseguem e eliminam vítimas de forma violenta e direta', bannerPath: '/imgs/subgeneros_series/Slasher banner.png' },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [9853, 172808, 161261, 251874, 256183], imagePath: '/imgs/subgeneros_series/Supernatural.jpg', synopsis: 'Subgênero centrado em forças além da compreensão humana, como espíritos, demônios e fenômenos paranormais', bannerPath: '/imgs/subgeneros_series/Supernatural banner.png' },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377], imagePath: '/imgs/subgeneros_series/Psicologico.png', synopsis: 'Subgênero que explora a mente humana, destacando paranoia, trauma e distorções da realidade', bannerPath: '/imgs/subgeneros_series/Psicologico banner.jpg' },
];

const selectableSubgenres = subgenres.slice(1);

const getSubgenreDetails = (id) => {
  return subgenres.find(sub => sub.id === id);
};

const nextShow = () => {
  if (topRatedShows.value.length > 0) {
    currentFeaturedIndex.value = (currentFeaturedIndex.value + 1) % topRatedShows.value.length;
  }
};

const prevShow = () => {
  if (topRatedShows.value.length > 0) {
    const total = topRatedShows.value.length;
    currentFeaturedIndex.value = (currentFeaturedIndex.value - 1 + total) % total;
  }
};

const listShows = async (sub) => {
  if (!sub) return;

  try {
    isLoading.value = true;
    totalShows.value = [];
    topRatedShows.value = [];
    currentFeaturedIndex.value = 0;

    currentPage.value = 1;
    totalPages.value = 1;

    currentSubgenreDetails.value = sub;
    currentSubgenreName.value = sub.name;
    currentSubgenreBanner.value = sub.bannerPath;

    const allResults = [];
    const pagesToLoad = 15;
    const keywordsToUse = sub.keywords;
    const pagePromises = [];

    for (const kw of keywordsToUse) {
      for (let page = 1; page <= pagesToLoad; page++) {
        pagePromises.push(
          api.get('discover/tv', {
            params: {
              with_keywords: kw,
              language: 'pt-BR',
              sort_by: 'popularity.desc',
              include_adult: false,
              page: page,
            },
          })
            .then((r) => r.data.results || [])
            .catch(() => [])
        );
      }
    }

    const responses = await Promise.all(pagePromises);

    for (const list of responses) allResults.push(...list);

    const uniqueShows = Array.from(new Map(allResults.map((s) => [s.id, s])).values());

    const sortedShows = uniqueShows
      .filter((s) => s.poster_path)
      .sort((a, b) => {
        return (b.popularity - a.popularity) || (b.popularity - a.popularity);
      });

    totalShows.value = sortedShows;

    totalPages.value = Math.ceil((totalShows.value.length - 5) / showsPerPage);

    const featuredCount = 5;
    topRatedShows.value = totalShows.value.slice(0, featuredCount);

    const paginatedShows = totalShows.value.slice(featuredCount);
    totalShows.value = paginatedShows;


  } catch (err) {
    console.error('Erro listShows:', err);
    totalShows.value = [];
    shows.value = [];
    topRatedShows.value = [];
    totalPages.value = 1;
  } finally {
    isLoading.value = false;
  }
};

const handleShowSelect = (showId) => {
  router.push({ name: 'ShowDetails', params: { showId } });
};

provide('handleSearchSelect', handleShowSelect);

watch(
  () => props.subgenreId,
  async (newId) => {
    const sub = getSubgenreDetails(newId);
    if (sub) {
      await listShows(sub);
    } else {
      console.warn(`Subgênero ID "${newId}" não encontrado.`);
      router.replace({ name: 'TvView' });
    }
  },
  { immediate: true }
);

</script>

<template>
  <div id="banner">
    <img :src="currentSubgenreBanner" :alt="`Banner ${currentSubgenreBanner}`" class="banner-image">
  </div>

  <div id="body">

    <h1 class="subgenre-title">{{ currentSubgenreName }}</h1>

    <loading v-model:active="isLoading" is-full-page />

    <div id="shows">
      <h2 v-if="displayedShows.length > 0">Recomendados (Pág. {{ currentPage }})</h2>

      <ShowList :shows="showsTopHalf" @select="handleShowSelect" />

      <div v-if="topRatedShows.length > 0" class="top-rated-carousel-wrapper">

        <div class="featured-show-card" @click="handleShowSelect(topRatedShows[currentFeaturedIndex].id)">
          <div class="poster-and-controls-column">
            <div class="featured-poster-wrapper">
              <img :src="`https://image.tmdb.org/t/p/w500${topRatedShows[currentFeaturedIndex].poster_path}`"
                :alt="topRatedShows[currentFeaturedIndex].name" class="featured-poster" />
            </div>
            <div class="carousel-controls">
              <div class="arrows">
                <button @click.stop="prevShow" class="nav-button prev-button">
                  &lt;
                </button>
                <button @click.stop="nextShow" class="nav-button next-button">
                  &gt;
                </button>
              </div>
              <div class="numbers">
                <span class="carousel-counter">
                  {{ currentFeaturedIndex + 1 }}/{{ topRatedShows.length }}
                </span>
              </div>
            </div>
          </div>

          <div class="featured-info">
            <h3 class="featured-name">
              {{ topRatedShows[currentFeaturedIndex].name }}
              <span class="featured-year">({{ new Date(topRatedShows[currentFeaturedIndex].first_air_date).getFullYear()
              }})</span>
            </h3>

            <p class="featured-synopsis">{{ topRatedShows[currentFeaturedIndex].overview }}</p>

            <div class="featured-meta">
              <p class="featured-rating">Avaliação: {{ topRatedShows[currentFeaturedIndex].vote_average.toFixed(1) }}
                /
                10.0</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <ShowList :shows="showsBottomHalf" @select="handleShowSelect" />

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

      #310101 40%,
      #310101 50%,
      #310101 60%,

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

#shows h2 {
  font-family: 'K2D', thin;
  font-size: 38px;
  text-align: center;
  color: var(--text);
}

.top-rated-carousel-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 5rem auto 5rem auto;
}

.poster img {
  border-radius: 6px;
  overflow: hidden;
}

.top-rated-container {
  width: 85%;
  max-width: 1400px;
  margin: 5rem auto 5rem auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.featured-show-card {
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
  margin-top: 2rem;
  margin-bottom: 2rem;

  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  overflow: hidden;

  width:120%;
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
  color :#ADADAD;
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
  /* Cor de destaque */
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
