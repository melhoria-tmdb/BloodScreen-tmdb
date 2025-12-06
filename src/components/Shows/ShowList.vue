<script setup>
const props = defineProps({ shows: Array });
const emit = defineEmits(['select']);

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
  <div class="show-list">
    <div v-for="show in shows" :key="show.id" class="show-card" @click="emit('select', show.id)">
      <img :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`" :alt="show.name" />
      <div class="show-details">
        <p class="show-stars">{{ estrelas(show.vote_average) }}</p>
        <p class="show-title">{{ show.name }}</p>
        <p class="show-release-date">
          {{ new Date(show.first_air_date).toLocaleDateString('pt-BR') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.show-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 3vw;
}

.show-card {
  width: 300px;
  height: 31.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  margin: 1vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.show-card:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
  cursor: pointer;
}

.show-card img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 20px;
}

.show-details {
  flex: 1;
  width: 100%;
  padding: 0rem;
  display: flex;

  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;
  color: var(--text);
  background-color: var(--bg);
}

.show-stars {
  font-size: 1.5rem;
  color: var(--text);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.show-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  line-height: 1.3rem;
  margin-top: 2vw;
  font-family: 'K2D', thin;
  margin: 0;
}

.show-date {
  font-size: 0.85rem;
  color: var(--text);
  margin: 0;
}

.show-genres {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.show-genres span {
  background-color: #7a0b0b;
  border-radius: 0.4rem;
  padding: 0.25rem 0.6rem;
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.show-genres span:hover {
  background-color: #a31313;
  box-shadow: 0 0 0.4rem #ff3030;
  cursor: pointer;
}

.show-genres span.active {
  background-color: #c71616;
  color: var(--text);
  box-shadow: 0 0 0.5rem #ff4d4d;
}

.show-genres span.active:hover {
  background-color: #a31313;
  box-shadow: 0 0 0.7rem #ff6666;
}


</style>
