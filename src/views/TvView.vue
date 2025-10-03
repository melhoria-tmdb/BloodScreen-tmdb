<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';

const isLoading = ref(false);

const genres = ref([]);

function getGenreName(id) {
  const genero = genres.value.find((genre) => genre.id === id);
  return genero.name;
}

const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

onMounted(async () => {
  const response = await api.get('genre/tv/list?language=pt-BR');
  genres.value = response.data.genres;
});

const tv = ref([]);

const listTv = async (genreId) => {
  isLoading.value = true;
  const response = await api.get('discover/tv', {
    params: {
      with_genres: genreId,
      language: 'pt-BR'
    }
  });
  tv.value = response.data.results
  isLoading.value = false;
};

</script>

<template>
  <h1>Programas de TV</h1>
  <ul class="genre-list">
    <li v-for="genre in genres" :key="genre.id" @click="listTv(genre.id)" class="genre-item">
      {{ genre.name }}
    </li>
  </ul>

  <loading v-model:active="isLoading" is-full-page />

  <div class="show-list">
    <div v-for="show in tv" :key="show.id" class="show-card">
      <img :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`" :alt="show.title" />
      <div class="show-details">
        <p class="show-title">{{ show.name }}</p>
        <p class="show-release-date">{{ formatDate(show.first_air_date) }}</p>

        <!-- gêneros do show -->
        <p class="show-genres">
          <span v-for="genre_id in show.genre_ids" :key="genre_id" @click="listTv(genre_id)">
            {{ getGenreName(genre_id) }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  list-style: none;
  padding: 0;
}

.genre-item {
  background-color: #5d6424;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  align-self: center;
  color: #fff;
  display: flex;
  justify-content: center;
}

.genre-item:hover {
  cursor: pointer;
  background-color: #7d8a2e;
  box-shadow: 0 0 0.5rem #5d6424;
}

.show-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 3vw;
}

.show-card {
  width: 15rem;
  height: 30rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 0.5rem #000;
}

.show-card:hover {
  transform: scale(1.05);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.show-card img {
  width: 100%;
  height: 20rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem #000;
}

.show-details {
  padding: 0 0.5rem;
}

.show-title {
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1.3rem;
  height: 3.2rem;
}

.show-genres {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 0.2rem;
  margin-top: 0.5vw;
}

.show-genres span {
  background-color: #748708;
  border-radius: 0.5rem;
  padding: 0.2rem 0.5rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: bold;
}

.show-genres span:hover {
  cursor: pointer;
  background-color: #455a08;
  box-shadow: 0 0 0.5rem #748708;
}
</style>