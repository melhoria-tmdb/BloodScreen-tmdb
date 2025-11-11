
<script setup>
  import { defineProps, onMounted } from 'vue';
  import { useMovieStore } from '@/stores/movie';
  const movieStore = useMovieStore();

  const props = defineProps({
    movieId: {
      type: Number,
      required: true,
    },
  });

  onMounted(async () => {
    await movieStore.getMovieDetail(props.movieId);
  });
</script>

<template>
  <div class="main">
    <div class="content">
      <img
        :src="`https://image.tmdb.org/t/p/w185${movieStore.currentMovie.poster_path}`"
        :alt="movieStore.currentMovie.title"
      />
      <div class="details">
        <h1>Filme: {{ movieStore.currentMovie.title }}</h1>
        <p>{{ movieStore.currentMovie.tagline }}</p>
        <p>{{ movieStore.currentMovie.overview }}</p>
        <p class="orcamento">Orçamento: ${{ movieStore.currentMovie.budget }}</p>
        <p>Avaliação: {{ movieStore.currentMovie.vote_average }}</p>
        <p>
          Duração: {{
            Math.floor(movieStore.currentMovie.runtime / 60)
          }}h {{
            movieStore.currentMovie.runtime % 60
          }}min
        </p>
      </div>
    </div>

    <!-- PRODUTORAS DENTRO DO MESMO CONTAINER -->
    <p class="produtoras">Produtoras</p>
    <div class="companies">
      <template
        v-for="company in movieStore.currentMovie.production_companies"
        :key="company.id"
      >
        <img
          v-if="company.logo_path"
          :src="`https://image.tmdb.org/t/p/w92${company.logo_path}`"
          :alt="company.name"
        />
        <p v-else>{{ company.name }}</p>
      </template>
    </div>
  </div>
</template>


<style scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 93vh;
  gap: 2rem;
  padding: 2rem;
}
.content{
  text-align: center;
}
.companies {
  display: flex;
  flex-wrap: wrap;       /* para quebrar linhas se necessário */
  justify-content: center; /* centraliza horizontalmente */
  align-items: center;
  gap: 2rem;
  margin-top: 0.4rem;
}

p {
  font-size: 1.1rem;
}

p.produtoras {
  text-align: center; /* centraliza o texto "Produtoras" */
  font-size: 1.3rem;
  font-weight: 600;
}
.orcamento {
  margin: 1vw 0 0 0;
}
</style>
