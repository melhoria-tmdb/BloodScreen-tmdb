<script setup>
import { ref, provide, watch } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter, useRoute } from 'vue-router';

import ShowList from '@/components/Shows/ShowList.vue';

const isLoading = ref(false);
const router = useRouter();
const route = useRoute();
const shows = ref([]);

const topRatedShows = ref([]);
const currentFeaturedIndex = ref(0);

const currentPage = ref(1);
const totalPagesAvailable = ref(1);
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


// 🧠 Keywords principais de terror (TMDB)
const horrorKeywordList = [
  12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 33505,
];

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: horrorKeywordList },

  { id: 'zombie', name: 'Zumbi', keywords: [12377, 186565], imagePath: '/public/imgs/subgeneros_series/Zumbi.png', synopsis: 'Subgênero do horror que envolve zumbis ou infectados que são cadáveres reanimados', bannerPath: '/imgs/subgeneros_series/Zumbi banner.png' },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714], imagePath: '/public/imgs/subgeneros_series/Slasher.jpg', synopsis: 'Subgênero focado em assassinos que perseguem e eliminam vítimas de forma violenta e direta', bannerPath: '/imgs/subgeneros_series/Slasher banner.png' },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [9853, 172808, 161261, 251874, 256183], imagePath: '/public/imgs/subgeneros_series/Supernatural.jpg', synopsis: 'Subgênero centrado em forças além da compreensão humana, como espíritos, demônios e fenômenos paranormais', bannerPath: '/imgs/subgeneros_series/Supernatural banner.png' },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377], imagePath: '/public/imgs/subgeneros_series/Psicologico.png', synopsis: 'Subgênero que explora a mente humana, destacando paranoia, trauma e distorções da realidade', bannerPath: '/imgs/subgeneros_series/Psicologico banner.jpg' },
];

const selectableSubgenres = subgenres.slice(1);

const getSubgenreDetails = (id) => {
  return subgenres.find(sub => sub.id === id);
};

// ➡️ Função de navegação para o próximo item
const nextShow = () => {
  if (topRatedShows.value.length > 0) {
    currentFeaturedIndex.value = (currentFeaturedIndex.value + 1) % topRatedShows.value.length;
  }
};

// ⬅️ Função de navegação para o item anterior
const prevShow = () => {
  if (topRatedShows.value.length > 0) {
    const total = topRatedShows.value.length;
    currentFeaturedIndex.value = (currentFeaturedIndex.value - 1 + total) % total;
  }
};

// 🔥 Função para listar séries
const listShows = async (sub) => {
  if (!sub) return;

  try {
    isLoading.value = true;
    shows.value = [];
    topRatedShows.value = [];
    currentFeaturedIndex.value = 0;

    currentPage.value = 1;
    hasMoreShows.value = true;

    currentSubgenreDetails.value = sub;
    currentSubgenreName.value = sub.name;
    currentSubgenreBanner.value = sub.bannerPath; // Corrigido o banner

    const allResults = [];
    const pagesToLoadInitially = 3;
    const keywordsToUse = sub.keywords;
    const pagePromises = [];

    for (const kw of keywordsToUse) {
      for (let page = 1; page <= pagesToLoadInitially; page++) {
        pagePromises.push(
          api.get('discover/tv', {
            params: {
              with_keywords: kw,
              language: 'pt-BR',
              sort_by: 'vote_average.desc',
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

    // Processamento para encontrar séries únicas
    const uniqueShows = Array.from(new Map(allResults.map((s) => [s.id, s])).values());

    // 🔑 CORREÇÃO DA LÓGICA DE PAGINAÇÃO: Presume que há mais se encontrou pelo menos uma página de resultados únicos.
    currentPage.value = pagesToLoadInitially;
    if (uniqueShows.length < 20) {
        hasMoreShows.value = false;
    } else {
        hasMoreShows.value = true;
    }

    const sortedShows = uniqueShows
      .filter((s) => s.poster_path)
      .sort((a, b) => {
        return (b.vote_average - a.vote_average) || (b.popularity - a.popularity);
      });

    const featuredCount = 5;
    topRatedShows.value = sortedShows.slice(0, featuredCount);

    shows.value = sortedShows.slice(featuredCount);

  } catch (err) {
    console.error('Erro listShows:', err);
    shows.value = [];
    topRatedShows.value = [];
    hasMoreShows.value = false;
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

const loadMoreShows = async () => {
  if (isLoading.value || !hasMoreShows.value) return;

  isLoading.value = true;
  currentPage.value++;

  const sub = currentSubgenreDetails.value;
  if (!sub) {
    isLoading.value = false;
    return;
  }

  const keywordsToUse = sub.keywords;
  const pageToLoad = currentPage.value;
  const newResults = [];

  try {
    const responses = await Promise.all(
      keywordsToUse.map((kw) =>
        api.get('discover/tv', {
          params: {
            with_keywords: kw,
            language: 'pt-BR',
            sort_by: 'vote_average.desc', // Padronizado com listShows
            include_adult: false,
            page: pageToLoad,
          },
        })
          .then((r) => r.data.results || [])
          .catch(() => [])
      )
    );

    for (const list of responses) newResults.push(...list);

    // 1. Filtra resultados duplicados
    const currentIds = new Set(shows.value.map(s => s.id));
    const uniqueNewShows = newResults
      .filter(s => s.poster_path && !currentIds.has(s.id));

    // 2. Anexa os novos resultados
    shows.value.push(...uniqueNewShows);

    // 3. Verifica se há mais para carregar
    if (uniqueNewShows.length === 0) {
      hasMoreShows.value = false;
    }

  } catch (err) {
    console.error('Erro loadMoreShows:', err);
    hasMoreShows.value = false;
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div id="banner">
    <img :src="currentSubgenreBanner" :alt="`Banner ${currentSubgenreBanner}`" class="banner-image">
  </div>

  <div id="body">

    <h1 class="subgenre-title">{{ currentSubgenreName }}</h1>

    <loading v-model:active="isLoading" is-full-page />

    <div v-if="topRatedShows.length > 0" class="top-rated-carousel-wrapper">
      <h2 class="top-rated-title">As Melhores Avaliações</h2>

      <div class="featured-show-card" @click="handleShowSelect(topRatedShows[currentFeaturedIndex].id)">
        <div class="featured-poster-wrapper">
          <img :src="`https://image.tmdb.org/t/p/w500${topRatedShows[currentFeaturedIndex].poster_path}`"
            :alt="topRatedShows[currentFeaturedIndex].name" class="featured-poster" />

          <div class="carousel-controls">
            <button @click.stop="prevShow" class="nav-button prev-button">
              &lt;
            </button>

            <span class="carousel-counter">
              {{ currentFeaturedIndex + 1 }}/{{ topRatedShows.length }}
            </span>

            <button @click.stop="nextShow" class="nav-button next-button">
              &gt;
            </button>
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
            <p class="featured-rating">⭐ Avaliação: {{ topRatedShows[currentFeaturedIndex].vote_average.toFixed(1) }} /
              10</p>
          </div>
        </div>
      </div>
    </div>
    <div id="shows">
      <h2 v-if="shows.length > 0">Mais Recomendados de {{ currentSubgenreName }}</h2>
      <ShowList :shows="shows" @select="handleShowSelect" />

      <div class="load-more-container">
        <button v-if="hasMoreShows" @click="loadMoreShows" :disabled="isLoading" class="load-more-button">
          {{ isLoading ? 'Carregando...' : 'Carregar Mais Séries' }}
        </button>
        <p v-else-if="shows.length > 0" class="no-more-shows">
          Você chegou ao fim da lista de séries deste subgênero.
        </p>
      </div>
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

  background-image: linear-gradient(to bottom,
      var(--bg) 0%,
      var(--bg) 15%,

      #310101 50%,

      var(--bg) 85%,
      var(--bg) 100%);

  min-height: 100vh;
}

.subgenre-title {
  font-family: 'K2D', bold;
  font-size: 4rem;
  color: white;
  text-align: center;
  margin-top: -100px;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
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

/* 🌟 ESTILOS DA LISTA DE SÉRIES BEM AVALIADAS 🌟 */

.top-rated-carousel-wrapper {
  width: 85%;
  max-width: 1400px;
  margin: 0 auto 5rem auto;
}

.top-rated-container {
  width: 85%;
  max-width: 1400px;
  margin: 0 auto 5rem auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  /* Espaço entre cada item de destaque */
}

.top-rated-title {
  font-family: 'K2D', sans-serif;
  font-size: 2.5rem;
  color: #ff4747;
  margin-bottom: 1.5rem;
  text-align: left;
  /* Alinhamos à esquerda, acima do carrossel */
  /* Centraliza o título da seção */
  border-bottom: 2px solid #310101;
  width: 80%;
  /* Alinha com a largura do cartão */
  padding-bottom: 0.5rem;
  margin: 0 auto 2rem auto;
}

.featured-show-card {
  display: flex;
  align-items: flex-start;
  padding: 2rem;
  background-color: #1a1a1a;
  /* Cor ligeiramente diferente do fundo para contraste */
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 80%;
  /* Ajuste a largura do cartão */
  margin: 0 auto;
  cursor: pointer;
}

.featured-show-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 71, 71, 0.2);
}

.featured-poster-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 200px;
  /* Um pouco menor que antes */
  height: 300px;
  margin-right: 2rem;
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
}

.featured-name {
  font-family: 'K2D', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
  line-height: 1.1;
}

.featured-year {
  font-size: 1.2rem;
  font-weight: 300;
  color: #aaa;
}

.featured-synopsis {
  font-size: 1rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 1rem;
  /* Mantém o limite de linhas para evitar textos gigantescos */
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-rating {
  font-size: 1.1rem;
  color: #ff4747;
  font-weight: 600;
}

/* ⬅️➡️ CONTROLES DE CARROSSEL 1/3 (Estilo Figma) ⬅️➡️ */

.carousel-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  color: var(--text);
}

.nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.2s;
  line-height: 1;
  /* Alinhamento vertical do chevron */
}

.nav-button:hover {
  color: #ff4747;
  /* Cor de destaque ao passar o mouse */
}

.carousel-counter {
  font-size: 0.9rem;
  font-family: monospace;
}

/* 🚨 NOVOS ESTILOS: Botão Carregar Mais */

.load-more-container {
  text-align: center;
  margin-top: 3rem;
  margin-bottom: 5rem;
}

.load-more-button {
  background-color: #ff4747;
  /* Cor de destaque */
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;
  box-shadow: 0 4px 15px rgba(255, 71, 71, 0.4);
}

.load-more-button:hover:not(:disabled) {
  background-color: #c71616;
  transform: translateY(-2px);
}

.load-more-button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.7;
}

.no-more-shows {
  color: #aaa;
  font-size: 1rem;
  padding: 1rem;
}
</style>
