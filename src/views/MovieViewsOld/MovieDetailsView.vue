<script setup>
import { defineProps, onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { useMovieStore } from '@/stores/movie';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const isLoading = ref(true);
let slideshowInterval = null;

const clearSlideshow = () => {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
};

const forceReflow = () => {
  void document.body.offsetHeight;
  document.body.style.transform = 'translateZ(0)';
  setTimeout(() => { document.body.style.transform = ''; }, 50);
};

const neutralizeRootVars = () => {
  const root = document.documentElement;
  root.style.removeProperty('--slide-theme-color');
  root.style.setProperty('--slide-theme-color', '0,0,0');
  root.style.removeProperty('scroll');
};

const disableTransitionsTemporarily = () => {
  document.documentElement.classList.add('no-transitions-temp');
};
const enableTransitions = () => {
  document.documentElement.classList.remove('no-transitions-temp');
};

const startSlideshowSafe = () => {
  if (backdropImages.value.length < 2) return;
  const transitionDuration = 2000;
  const visibleDuration = 6000;

  slideshowInterval = setInterval(() => {
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

const movieStore = useMovieStore();

const props = defineProps({
  movieId: {
    type: Number,
    required: true,
  },
});

const movieTrailerUrl = ref('');

const currentBackgroundImage = ref('');
const nextImageURL = ref('');
const backdropImages = ref([]);
let imageIndex = 0;
let isFading = ref(false);

const getMovieBackdrops = async (movieId) => {
  const imagesData = await movieStore.getMovieImages(movieId);

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

    console.warn("Nenhum backdrop encontrado para este filme.");
    currentBackgroundImage.value = '';
    nextImageURL.value = '';
    return Promise.resolve();
  }
};

// Função para iniciar o Slideshow
/*const startSlideshow = () => {
  if (backdropImages.value.length < 2) {
    return;
  }

  const transitionDuration = 2000;
  const visibleDuration = 6000;

  setInterval(() => {
    isFading.value = true;

    setTimeout(async () => { // 💡 TORNAR ESTE CALLBACK ASSÍNCRONO
      imageIndex = (imageIndex + 1) % backdropImages.value.length;

      currentBackgroundImage.value = backdropImages.value[imageIndex];

      await nextTick();

      isFading.value = false;

      nextImageURL.value = backdropImages.value[(imageIndex + 1) % backdropImages.value.length];


    }, transitionDuration);

  }, visibleDuration + transitionDuration);
};*/

const getMovieTrailer = async (movieId) => {
  const videosData = await movieStore.getMovieVideos(movieId);

  if (videosData && videosData.results) {
    const trailer = videosData.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      movieTrailerUrl.value = `https://www.youtube.com/embed/${trailer.key}?controls=0&modestbranding=1`;
    }
  }
};

const formattedGenres = computed(() => {
  if (movieStore.currentMovie.genres && movieStore.currentMovie.genres.length > 0) {
    const genreNames = movieStore.currentMovie.genres.map(genre => genre.name);
    return genreNames.join(', ');
  }
  return 'N/A';
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

const movieDirector = ref('');
const movieCertification = ref('N/A');

const getMovieDirector = (crew) => {
  if (crew) {
    const director = crew.find(
      (member) => member.job === 'Director'
    );
    if (director) {
      movieDirector.value = director.name;
    }
  }
};

const getMovieCertification = async (movieId) => {
  const releaseDates = await movieStore.getMovieReleaseDates(movieId);
  if (releaseDates && releaseDates.results) {
    const brRelease = releaseDates.results.find(
      (release) => release.iso_3166_1 === 'BR'
    );
    if (brRelease && brRelease.release_dates.length > 0) {
      const certificationData = brRelease.release_dates.find(
        (date) => date.type === 3
      );
      if (certificationData && certificationData.certification) {
        movieCertification.value = certificationData.certification;
      }
    }
  }
};

onMounted(async () => {
  disableTransitionsTemporarily();

  await movieStore.getMovieDetail(props.movieId);
  const creditsData = await movieStore.getMovieCredits(props.movieId);
  getMovieDirector(creditsData.crew);
  await getMovieCertification(props.movieId);
  await getMovieTrailer(props.movieId);

  await getMovieBackdrops(props.movieId);

  await nextTick();

  if (document && document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch(e){ /* ignore */ }
  }

  neutralizeRootVars();

  forceReflow();
  await new Promise(r => setTimeout(r, 60));

  startSlideshowSafe();

  isLoading.value = false;

  setTimeout(() => {
    enableTransitions();
  }, 150);

});

onUnmounted(() => {
  clearSlideshow();
  enableTransitions();
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

    <div class="content" v-if="movieStore.currentMovie.title">

      <div class="left">
        <h1>{{ (movieStore.currentMovie.title).toUpperCase() }}</h1>
        <p id="tagline">{{ movieStore.currentMovie.tagline }}</p>
        <p id="overview">{{ movieStore.currentMovie.overview }}</p>
      </div>

      <div class="right">

        <div id="text">
          <p><span>Idioma Original:</span> <br>
            {{ getLanguageName(movieStore.currentMovie.original_language) }}
          </p>

          <p>
            <span>Duração:</span> <br>
            {{
              Math.floor(movieStore.currentMovie.runtime / 60)
            }}h {{
              movieStore.currentMovie.runtime % 60
            }}min
          </p>

          <p><span>Lançamento:</span> <br>
            {{ formatDate(movieStore.currentMovie.release_date) }}
          </p>

          <p><span>Diretor(a):</span> <br>
            {{ movieDirector }}
          </p>

          <p><span>Classificação:</span> <br>
            <span id="classificacao">
              {{ movieCertification }}
            </span>
          </p>

          <p><span>Gêneros:</span> <br>
            <span class="genres-list">
              {{ formattedGenres }}
            </span>
          </p>
        </div>

        <p class="trailer-container">
          <iframe v-if="movieTrailerUrl" :src="movieTrailerUrl" frameborder="0"
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

.main {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  min-height: 100vh;
  overflow: hidden;
  background-color: black;
  width: auto;
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
  max-width: 800px;
  margin-top: 35px;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  border-left: solid white thin;
  width: 250px;
  min-height: 100vh;
  background-color: transparent;
  color: white;
  padding-top: 50px;
  padding-left: 20px;
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
  gap: 20px;
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
