<script setup>
const props = defineProps({ movies: Array })
const emit = defineEmits(['select'])

function estrelas(rating) {
  const stars = Math.round(rating / 2);
  let starHTML = '';

  for (let i = 0; i < stars; i++) {
    starHTML += '★';
  }

  for (let i = stars; i < 5; i++) {
    starHTML += '☆';
  }

  return starHTML;
}
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
        <p class="movie-stars">{{ estrelas(movie.vote_average) }}</p>
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
  width: 300px;
  height: 31.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin: 1vw;
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
  height: 400px;
  object-fit: cover;
  border-radius: 20px;
}

.movie-details {
  width: 100%;
  padding: 0.5rem 0rem 0rem;
  display: flex;

  flex: 1;

  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;
  color: var(--text);
  background-color: transparent;
}

.movie-stars {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;

}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  line-height: 1.3rem;
  font-family: 'K2D', thin;
  margin: 0;

}

.movie-date {
  font-size: 0.85rem;
  color: var(--text);
  margin: 0;
}

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
  color: var(--text);
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
  color: var(--text);
  box-shadow: 0 0 0.5rem #ff4d4d;
}

.movie-genres span.active:hover {
  background-color: #a31313;
  box-shadow: 0 0 0.7rem #ff6666;
}
</style>
