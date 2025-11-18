<script setup>
const props = defineProps({ movies: Array })
const emit = defineEmits(['select'])
</script>

<template>
  <div class="movie-list">
    <div
      v-for="movie in movies"
      :key="movie.id"
      class="movie-card"
      @click="emit('select', movie.id)"
    >
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" />
      <div class="movie-details">
        <p class="movie-title">{{ movie.title }}</p>
        <p class="movie-date">
          {{ new Date(movie.release_date).toLocaleDateString('pt-BR') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
