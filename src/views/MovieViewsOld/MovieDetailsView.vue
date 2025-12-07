<script setup>
import { defineProps, onMounted, ref, computed, nextTick } from 'vue';
import { useMovieStore } from '@/stores/movie';
import Loading from 'vue-loading-overlay';

const isLoading = ref(true); // Começa como true

const movieStore = useMovieStore();

const props = defineProps({
  movieId: {
    type: Number,
    required: true,
  },
});

const movieTrailerUrl = ref('');

// Variáveis para o Slideshow
const currentBackgroundImage = ref(''); // URL da imagem atual (no ::before)
const nextImageURL = ref(''); // URL da próxima imagem (no ::after)
const backdropImages = ref([]); // Array para armazenar as URLs das imagens
let imageIndex = 0; // Índice da imagem atual
let isFading = ref(false); // Flag para controlar o estado da transição

// Função para buscar as imagens de fundo
const getMovieBackdrops = async (movieId) => {
  // A chamada agora está corrigida no store
  const imagesData = await movieStore.getMovieImages(movieId);

  if (imagesData && imagesData.backdrops && imagesData.backdrops.length > 0) {
    backdropImages.value = imagesData.backdrops.map(
      (image) => `https://image.tmdb.org/t/p/w1280${image.file_path}`
    );

    // Garante que a primeira imagem seja carregada.
    const firstImageUrl = backdropImages.value[0];
    currentBackgroundImage.value = firstImageUrl;

    // Se houver mais de uma imagem, define a próxima
    if (backdropImages.value.length > 1) {
      nextImageURL.value = backdropImages.value[1];
    } else {
      // Se houver apenas uma imagem, a próxima deve ser ela mesma,
      // ou a string deve ser vazia para evitar a transição,
      // dependendo de como você quer o comportamento em caso de imagem única.
      // Vamos deixar a lógica de transição no startSlideshow cuidar disso.
      nextImageURL.value = backdropImages.value[0];
    }
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
    // ⚠️ Se não vierem imagens, logamos para debug
    console.warn("Nenhum backdrop encontrado para este filme.");
    currentBackgroundImage.value = '';
    nextImageURL.value = '';
    return Promise.resolve();
  }
};

// Função para iniciar o Slideshow
const startSlideshow = () => {
  // Se não houver pelo menos 2 imagens, paramos aqui
  if (backdropImages.value.length < 2) {
    return;
  }

  const transitionDuration = 2000;
  const visibleDuration = 6000;

  setInterval(() => {
    // 1. Inicia o Fade-in da próxima imagem no ::after
    isFading.value = true;

    // 2. Após o tempo de transição (a imagem no ::after está visível)
    setTimeout(async () => { // 💡 TORNAR ESTE CALLBACK ASSÍNCRONO
      // Avança o índice
      imageIndex = (imageIndex + 1) % backdropImages.value.length;

      // A) Define a nova imagem atual (no ::before). Esta é a imagem que queremos ver.
      currentBackgroundImage.value = backdropImages.value[imageIndex];

      // 💡 NOVO: Esperar que o Vue renderize a nova currentBackgroundImage no ::before.
      // Isso é crucial para que o ::before não fique vazio antes de desligarmos o ::after.
      await nextTick();

      // B) Desliga a opacidade do ::after imediatamente
      isFading.value = false;

      // C) Define a próxima imagem (no ::after) para o PRÓXIMO ciclo
      nextImageURL.value = backdropImages.value[(imageIndex + 1) % backdropImages.value.length];

      // ⚠️ Removemos o setTimeout interno de 100ms, pois o nextTick() cuida da sincronização.

    }, transitionDuration);

  }, visibleDuration + transitionDuration);
};

// Funções de formatação e busca de detalhes
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

// Lifecycle Hook
onMounted(async () => {
  await movieStore.getMovieDetail(props.movieId);
  const creditsData = await movieStore.getMovieCredits(props.movieId);
  getMovieDirector(creditsData.crew);
  await getMovieCertification(props.movieId);
  await getMovieTrailer(props.movieId);
  await getMovieBackdrops(props.movieId);
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
