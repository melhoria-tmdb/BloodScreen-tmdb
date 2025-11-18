<script setup>
const props = defineProps({ shows: Array });
const emit = defineEmits(['select']);
</script>

<template>
  <div class="show-list">
    <div v-for="show in shows" :key="show.id" class="show-card" @click="emit('select', show.id)">
      <img :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`" :alt="show.name" />
      <div class="show-details">
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
.show-card:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.25);
  cursor: pointer;
}
.show-card img {
  width: 100%;
  height: 21rem;
  object-fit: cover;
  border-bottom: 2px solid #220000;
}
.show-details {
  flex: 1;
  width: 100%;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}
.show-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.3rem;
  margin-bottom: 0.4rem;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
}
.show-release-date {
  font-size: 0.85rem;
  color: #bfbfbf;
}
</style>
