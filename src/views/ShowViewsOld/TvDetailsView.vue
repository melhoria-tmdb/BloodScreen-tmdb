<script setup>
import { defineProps, onMounted, ref, computed, nextTick } from 'vue';
import { useShowStore } from '@/stores/tv';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const isLoading = ref(true);

const showStore = useShowStore();

const props = defineProps({
  showId: {
    type: Number,
    required: true,
  },
});

const showTrailerUrl = ref('');

const currentBackgroundImage = ref('');
const nextImageURL = ref('');
const backdropImages = ref([]);
let imageIndex = 0;
let isFading = ref(false);

const getShowBackdrops = async (showId) => {
  const imagesData = await showStore.getShowImages(showId);

  if (imagesData && imagesData.backdrops && imagesData.backdrops.length > 0) {
    backdropImages.value = imagesData.backdrops.map(
      (image) => `https://image.tmdb.org/t/p/w1280${image.file_path}`
    );

    const firstImageUrl = backdropImages.value[0];
    currentBackgroundImage.value = firstImageUrl;

    if (backdropImages.value.length > 1) {
      nextImageURL.value = backdropImages.value[1];
    } else {
      nextImageURL.value = backdropImages.value[0];
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = firstImageUrl;
    });
  } else {
    console.warn("Nenhum backdrop encontrado para esta série.");
    currentBackgroundImage.value = '';
    nextImageURL.value = '';

    return Promise.resolve();
  }
};
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

const getShowTrailer = async (showId) => {
  const videosData = await showStore.getShowVideos(showId);

  if (videosData && videosData.results) {
    const trailer = videosData.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      showTrailerUrl.value = `https://www.youtube.com/embed/${trailer.key}?controls=0&modestbranding=1`;
    }
  }
};

const formattedGenres = computed(() => {
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

const showCreator = ref('');
const showCertification = ref('N/A');

const getShowCreator = (crew) => {
  if (crew) {
    const creator = crew.find(
      (member) => member.job === 'Series Creator' || member.job === 'Creator'
    );
    if (creator) {
      showCreator.value = creator.name;
    } else if (showStore.currentShow.created_by && showStore.currentShow.created_by.length > 0) {
      showCreator.value = showStore.currentShow.created_by.map(c => c.name).join(', ');
    }
  }
};

const getShowCertification = async (showId) => {
  const contentRatings = await showStore.getShowContentRatings(showId);

  if (contentRatings && contentRatings.results) {
    const brRating = contentRatings.results.find(
      (rating) => rating.iso_3166_1 === 'BR'
    );
    if (brRating && brRating.rating) {
      showCertification.value = brRating.rating;
    }
  }
};

onMounted(async () => {
  await showStore.getShowDetail(props.showId);
  const creditsData = await showStore.getShowCredits(props.showId);
  getShowCreator(creditsData.crew);
  await getShowCertification(props.showId);
  await getShowTrailer(props.showId);
  await getShowBackdrops(props.showId);
  await nextTick();
  await new Promise(r => setTimeout(r, 30));

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

      <div class="esquerda">
        <h1 id="titulo">{{ (showStore.currentShow.name).toUpperCase() }}</h1>
        <p id="tagline">{{ showStore.currentShow.tagline }}</p>
        <p id="overview">{{ showStore.currentShow.overview }}</p>
      </div>

      <div class="direita">

        <div id="texto">
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

        <div id="trailer-container-filme">
          <iframe v-if="showTrailerUrl" :src="showTrailerUrl" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen class="movie-trailer">
          </iframe>
          <span v-else>Trailer não disponível.</span>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;

  background-color: black;

  position: relative;
}

.main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;

  background-image: var(--current-bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  background-color: rgba(0, 0, 0, 0.7);
  background-blend-mode: darken;

  opacity: 1;
  z-index: 1;
}

.main::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2;

  background-image: var(--next-bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  background-color: rgba(0, 0, 0, 0.7);
  background-blend-mode: darken;

  opacity: 0;
  transition: opacity 0s;
}

.main.is-fading::after {
  opacity: 1;
  transition: opacity 2.0s ease-in-out;
}

.content {
  z-index: 3;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0;
}

div.content div.esquerda {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 100px;
  flex-shrink: 1;
  color: white !important;
  margin-top: 0;
}
.esquerda p {
  margin: 0;
}

#titulo {
  font-family: 'K2D', thin;
  font-weight: 400;
  font-size: 70px;
  margin: 0;
  padding: 0;
}

#tagline {
  font-size: 20px;
  font-family: 'K2D', sans-serif;
  margin: 0;
}

#overview {
  font-family: 'K2D', sans-serif;
  font-size: 25px;
  width: 60%;
  margin-top: 35px;
  line-height: 2.3vw;
}

.direita {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  border-left: solid white thin;
  width: 250px;
  background-color: transparent;
  color: white;
  padding-top: 40px;
  min-height: 100vh;
  flex-shrink: 0;
  margin: 0 5vw 0 0;
}

.direita p {
  font-family: 'K2D', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 2;
  padding-left: 20px;
  margin: 0;
}

.direita p span {
  font-size: 25px;
  font-weight: 600;
  line-height: 1.4;
  opacity: 70%;
}

#classificacao {
  font-size: 17px;
  padding: 2px 5px;
  font-weight: 100;
  border: 1px solid;
  border-radius: 5px;
  opacity: 100%;
}

.direita p .genres-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  font-size: 18px;
  opacity: 100%;
  line-height: 1.2;
}

#texto {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* CONTAINER DO TRAILER */
#direita #trailer-container-filme {
  margin-right: 0;
  line-height: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0;
}

/* ESTILO DO IFRAME DO YOUTUBE */
.movie-trailer {
  padding: 0;
  margin: 0;
  width: 20.1vw;
  height: 20vh;
  text-align: center;
  align-items: center;
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
