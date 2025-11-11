<script setup>
defineProps({
  subgenres: Array,
  current: String,
})
const emit = defineEmits(['change'])
</script>

<template>
  <ul class="genre-list">
    <li
      v-for="sub in subgenres"
      :key="sub.id || 'all'"
      :class="{ active: sub.id === current }"
      class="genre-item"
      @click="emit('change', sub)"
    >
      {{ sub.name }}
    </li>
  </ul>
</template>

<style scoped>
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0.5rem;
  margin-top: 1.5rem;
}

/* Botões dos subgêneros */
.genre-item {
  background-color: #7a0b0b; /* vermelho escuro base */
  border-radius: 1rem;
  padding: 0.5rem 1.2rem;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.4);
}

.genre-item:hover {
  cursor: pointer;
  background-color: #a31313; /* vermelho mais vibrante */
  box-shadow: 0 0 0.8rem #ff2a2a; /* brilho vermelho */
  transform: translateY(-2px);
}

/* Subgênero ativo */
.genre-item.active {
  background-color: #c71616; /* vermelho sangue intenso */
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 1rem #ff4747;
  transform: scale(1.08);
  border: 2px solid #fff;
}
</style>
