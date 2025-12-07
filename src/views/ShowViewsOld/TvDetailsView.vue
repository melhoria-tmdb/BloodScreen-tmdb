<script setup>
import { defineProps, onMounted, ref, computed, nextTick } from 'vue';
import { useShowStore } from '@/stores/tv';
import Loading from 'vue-loading-overlay';

const isLoading = ref(true); // Começa como true

// 💡 MUDANÇA: Usar o novo Store
const showStore = useShowStore();

const props = defineProps({
  // 💡 MUDANÇA: showId em vez de movieId
  showId: {
    type: Number,
    required: true,
  },
});

// 💡 MUDANÇA: Nome da variável para showTrailerUrl
const showTrailerUrl = ref('');

// Variáveis para o Slideshow (MANTIDAS)
const currentBackgroundImage = ref('');
const nextImageURL = ref('');
const backdropImages = ref([]);
let imageIndex = 0;
let isFading = ref(false);

// Função para buscar as imagens de fundo
const getShowBackdrops = async (showId) => {
  // 💡 MUDANÇA: Usar getShowImages do Store de séries
  const imagesData = await showStore.getShowImages(showId);

  if (imagesData && imagesData.backdrops && imagesData.backdrops.length > 0) {
    backdropImages.value = imagesData.backdrops.map(
      (image) => `https://image.tmdb.org/t/p/w1280${image.file_path}`
    );

    // URL da primeira imagem que será carregada
    const firstImageUrl = backdropImages.value[0];
    currentBackgroundImage.value = firstImageUrl;

    if (backdropImages.value.length > 1) {
      nextImageURL.value = backdropImages.value[1];
    } else {
      nextImageURL.value = backdropImages.value[0];
    }

    // --- NOVA LÓGICA: Aguardar a carga da primeira imagem ---
    return new Promise((resolve) => {
      // Cria um elemento Image (DOM element) em memória
      const img = new Image();
      // O evento 'onload' dispara quando a imagem é baixada e pronta para exibição
      img.onload = resolve;
      img.onerror = resolve; // Se der erro, resolve do mesmo jeito para não travar
      // Define a source para iniciar o download
      img.src = firstImageUrl;
    });
  } else {
    console.warn("Nenhum backdrop encontrado para esta série.");
    currentBackgroundImage.value = '';
    nextImageURL.value = '';
    // Resolve imediatamente se não houver imagens
    return Promise.resolve();
  }
};
// Função para iniciar o Slideshow (MANTIDA)
const startSlideshow = () => {
  if (backdropImages.value.length < 2) {
    return;
  }

  const transitionDuration = 2000;
  const visibleDuration = 6000;

  setInterval(() => {
    isFading.value = true;

    setTimeout(async () => {
      imageIndex = (imageIndex + 1) % backdropImages.value.length;

      currentBackgroundImage.value = backdropImages.value[imageIndex];

      await nextTick();

      isFading.value = false;

      nextImageURL.value = backdropImages.value[(imageIndex + 1) % backdropImages.value.length];
    }, transitionDuration);

  }, visibleDuration + transitionDuration);
};

// Funções de formatação e busca de detalhes
const getShowTrailer = async (showId) => {
  // 💡 MUDANÇA: Usar getShowVideos do Store de séries
  const videosData = await showStore.getShowVideos(showId);

  if (videosData && videosData.results) {
    const trailer = videosData.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      // 💡 MUDANÇA: showTrailerUrl
      showTrailerUrl.value = `https://www.youtube.com/embed/${trailer.key}?controls=0&modestbranding=1`;
    }
  }
};

const formattedGenres = computed(() => {
  // 💡 MUDANÇA: showStore.currentShow.genres
  if (showStore.currentShow.genres && showStore.currentShow.genres.length > 0) {
    const genreNames = showStore.currentShow.genres.map(genre => genre.name);
    return genreNames.join(', ');
  }
  return 'N/A';
});

const formattedSeasonsAndEpisodes = computed(() => {
  const show = showStore.currentShow;

  const seasons = show.number_of_seasons;
  const episodes = show.number_of_episodes;

  if (seasons === undefined || episodes === undefined) {
    return 'N/A';
  }

  // Lógica de pluralização
  const seasonText = seasons === 1 ? 'temporada' : 'temporadas';
  const episodeText = episodes === 1 ? 'episódio' : 'episódios';

  return `${seasons} ${seasonText}, ${episodes} ${episodeText}`;
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

const getLanguageName = (isoCode) => {
  // Lógica de mapeamento de idioma mantida
  if (!isoCode) return 'N/A';
  const languageMap = {
    en: 'Inglês',
    pt: 'Português',
    es: 'Espanhol',
    fr: 'Francês',
    de: 'Alemão',
    ja: 'Japonês',
    ko: 'Coreano',
    zh: 'Chinês',
    ru: 'Russo',
    it: 'Italiano',
  };
  return languageMap[isoCode] || isoCode.toUpperCase();
};

// 💡 MUDANÇA: Variável para o Criador Principal
const showCreator = ref('');
const showCertification = ref('N/A');

// 💡 MUDANÇA: Buscar o "Creator" em vez de "Director"
const getShowCreator = (crew) => {
  if (crew) {
    const creator = crew.find(
      // Creator é o cargo equivalente a Diretor para séries no TMDB
      (member) => member.job === 'Series Creator' || member.job === 'Creator'
    );
    if (creator) {
      showCreator.value = creator.name;
    } else if (showStore.currentShow.created_by && showStore.currentShow.created_by.length > 0) {
      // Fallback para o campo "created_by" que é mais comum
      showCreator.value = showStore.currentShow.created_by.map(c => c.name).join(', ');
    }
  }
};

// 💡 MUDANÇA: Buscar a Classificação de Conteúdo
const getShowCertification = async (showId) => {
  // 💡 MUDANÇA: Usar getShowContentRatings do Store de séries
  const contentRatings = await showStore.getShowContentRatings(showId);

  if (contentRatings && contentRatings.results) {
    // Buscar a classificação do Brasil (BR)
    const brRating = contentRatings.results.find(
      (rating) => rating.iso_3166_1 === 'BR'
    );
    // O campo é 'rating' para séries
    if (brRating && brRating.rating) {
      showCertification.value = brRating.rating;
    }
  }
};

// Lifecycle Hook
onMounted(async () => {
  await showStore.getShowDetail(props.showId);
  const creditsData = await showStore.getShowCredits(props.showId);
  getShowCreator(creditsData.crew);
  await getShowCertification(props.showId);
  await getShowTrailer(props.showId);
 
  await getShowBackdrops(props.showId);

  startSlideshow();

  isLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading" class="loading-state">
    <loading v-model:active="isLoading" is-full-page />
  </div>
  <div v-else class="main" :class="{ 'is-fading': isFading }" :style="{
    '--current-bg': `url(${currentBackgroundImage})`,
    '--next-bg': `url(${nextImageURL})`
  }">

    <div class="content" v-if="showStore.currentShow.name">

      <div class="left">
        <h1>{{ (showStore.currentShow.name).toUpperCase() }}</h1>
        <p id="tagline">{{ showStore.currentShow.tagline }}</p>
        <p id="overview">{{ showStore.currentShow.overview }}</p>
      </div>

      <div class="right">

        <div id="text">
          <p><span>Idioma Original:</span> <br>
            {{ getLanguageName(showStore.currentShow.original_language) }}
          </p>

          <p>
            <span>Total:</span> <br>
            {{ formattedSeasonsAndEpisodes }}
          </p>

          <p><span>Estréia:</span> <br>
            {{ formatDate(showStore.currentShow.first_air_date) }}
          </p>

          <p><span>Criador(a):</span> <br>
            {{ showCreator }}
          </p>

          <p><span>Classificação:</span> <br>
            <span id="classificacao">
              {{ showCertification }}
            </span>
          </p>

          <p><span>Gêneros:</span> <br>
            <span class="genres-list">
              {{ formattedGenres }}
            </span>
          </p>
        </div>

        <p class="trailer-container">
          <iframe v-if="showTrailerUrl" :src="showTrailerUrl" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen class="movie-trailer-player">
          </iframe>
          <span v-else>Trailer não disponível.</span>
        </p>

      </div>

    </div>

  </div>
</template>

<style scoped>

.loading-state {
  /* Garante que ocupe a tela toda */
  min-height: 100vh;
  width: 100%;

  /* Centraliza o texto */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Define o fundo e a cor do texto para ser visível */
  background-color: black;
  color: white;

  /* Define um tamanho de texto razoável */
  font-size: 24px;
  font-family: 'K2D', sans-serif;

  /* Garante que ele apareça acima de qualquer fundo preexistente */
  z-index: 10;
  position: fixed; /* Opcional, para garantir que cubra tudo */
  top: 50px;
  left: 0;
}
/* O CSS (ESTÉTICA) é mantido exatamente o mesmo */
/* 1. CONFIGURAÇÃO BASE (O .main agora é apenas o conteiner com cor de fundo) */
.main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  margin: 0;

  background-color: black;
  /* Fundo preto para o caso de falha de carregamento */

  position: relative;
}

/* 2. IMAGEM ATUAL (Anteriormente background-image, agora no ::before) */
.main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;

  /* Imagem atual injetada via Vue */
  background-image: var(--current-bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  /* Overlay escuro aplicado à imagem */
  background-color: rgba(0, 0, 0, 0.7);
  background-blend-mode: darken;

  opacity: 1;
  z-index: 1;
  /* Fica abaixo do elemento em transição (::after) e do conteúdo */
}

/* 3. IMAGEM PRÓXIMA (Pseudo-elemento que faz o fade-in) */
.main::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  z-index: 2;
  /* Fica acima do ::before (Imagem atual) */

  background-image: var(--next-bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  /* Overlay escuro aplicado à imagem */
  background-color: rgba(0, 0, 0, 0.7);
  background-blend-mode: darken;

  opacity: 0;
  /* Começa invisível */
  transition: opacity 0s;
}

/* 4. ESTADO DE TRANSIÇÃO */
.main.is-fading::after {
  opacity: 1;
  transition: opacity 2.0s ease-in-out;
  /* A próxima imagem (::after) aparece suavemente */
}

/* 5. CONTEÚDO (Deve ficar sempre acima de tudo) */
.content {
  z-index: 3;
  /* Sempre o mais alto */
  position: relative;
  /* ... (restante do código) ... */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.left {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 100px;
  flex-shrink: 1;
  color: white !important;
}

.left h1 {
  font-family: 'K2D', thin;
  font-weight: 400;
  font-size: 70px;
  margin: 0;
  padding: 0;
}

#tagline {
  font-size: 20px;
  font-family: 'K2D', sans-serif;
}

#overview {
  font-family: 'K2D', sans-serif;
  font-size: 25px;
  width: 60%;
  margin-top: 35px;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  border-left: solid white thin;
  width: 250px;
  background-color: transparent;
  color: white;
  padding-top: 50px;
  padding-left: 20px;
  min-height: 100vh;
  flex-shrink: 0;
}

.right p {
  font-family: 'K2D', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 2;
  padding-left: 10px;
}

.right p span {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  opacity: 70%;
}

#classificacao {
  font-size: 15px;
  padding: 2px 5px;
  font-weight: 100;
  border: 1px solid;
  border-radius: 5px;
  opacity: 100%;
}

.right p .genres-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  font-size: 18px;
  opacity: 100%;
  line-height: 1.2;
}

#text {
  display: flex;
  flex-direction: column;
  gap: 15px;

}

/* CONTAINER DO TRAILER */
.trailer-container {
  padding-left: 0;
  line-height: 1;
  margin-left: -30px;
  margin-right: -20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;
}

/* ESTILO DO IFRAME DO YOUTUBE */
.movie-trailer-player {
  padding-left: 0;
  width: 100%;
  height: 140px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.cast-title {
  font-size: 1.5rem;
  text-align: center;
  font-weight: bold;
}

.cast-list {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.actor-card {
  width: 120px;
  text-align: center;
}

.actor-card img {
  width: 120px;
  border-radius: 10px;
}

.actor-name {
  font-weight: bold;
}

.actor-character {
  font-size: 0.9rem;
  opacity: 0.7;
}
</style>
