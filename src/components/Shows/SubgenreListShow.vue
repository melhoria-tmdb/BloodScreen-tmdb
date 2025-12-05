<script setup>
const props = defineProps({
  subgenres: Array,
  current: String,
});
const emit = defineEmits(['change']);
</script>

<template>
<ul class="genre-list">
    <li
      v-for="sub in subgenres"
      :key="sub.id || 'all'"
      @click="emit('change', sub)"
      class="genre-item"
      :class="{ active: sub.id === current }"
    >
      <img v-if="sub.imagePath" :src="sub.imagePath" :alt="sub.name" class="genre-image" />

      <div class="info-overlay">
        <span class="genre-name">{{ sub.name }}</span>
        <p class="genre-synopsis">{{ sub.synopsis }}</p>
      </div>

    </li>
  </ul>
</template>

<style scoped>
/* 1. CONTAINER DA LISTA */
.genre-list {
  display: flex;
  justify-content: center;
  gap: 0px; /* Ajustado para 0 para permitir o controle total pela margin-left negativa */
  list-style: none;
  padding: 0.5rem;
  margin-top: 1.5rem;
}

/* 2. BOTÕES/CARTÕES BASE */
.genre-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;

  /* Tamanho Padrão */
  width: 250px;
  height: 350px;
  border-radius: 10px;

  /* Efeito de Empilhamento */
  margin-left: -100px; /* Amontoamento */

  z-index: 1;
  transition:
    width 0.4s ease,
    transform 0.4s ease,
    box-shadow 0.4s ease,
    z-index 0s;

  background-color: #7a0b0b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
}

.genre-item:first-child {
  margin-left: 0;
}

/* 3. EFEITO VISUAL QUANDO UM ITEM ESTÁ EM HOVER */

/* 3.1. Item em Hover (Expandido e em Foco) */
.genre-list:hover .genre-item:hover {
  width: 400px;
  margin-left: 0;

  transform: none;
  z-index: 10;
  border-radius: 10px;
}

/* 3.2. Itens NÃO em Hover (Retraídos/Vizinhos) */
.genre-list:hover .genre-item:not(:hover) {
  width: 80px;
  margin-left: -40px;
  margin: 0 3px 0 3px;
  transform: scaleY(0.95);
  border-radius: 10px 10px 10px 10px;
  z-index: 0;
}

.genre-list:hover .genre-item:first-child:not(:hover) {
    margin-left: 0;
}


/* 4. IMAGEM E OVERLAY */

.genre-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.3s ease;
  filter: brightness(0.7);
}

.genre-item:hover .genre-image {
  transform: none;
  filter: brightness(0.85);
}

/* 📚 INFO OVERLAY (Ajuste Crucial: Define o estado padrão e a expansão) */
.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 1rem;
  color: #fff;
  text-align: left;

  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);

  /* ESTADO PADRÃO: Mostra apenas o título e um pouco de sinopse. */
  max-height: 40%;
  opacity: 1; /* Deve ser 1 por padrão para que o título apareça */
  visibility: visible;
  transition: max-height 0.4s ease-out, opacity 0.4s ease, visibility 0s;
}

/* ⚠️ ESCONDE O TEXTO DOS VIZINHOS RETRAÍDOS */
.genre-list:hover .genre-item:not(:hover) .info-overlay {
   opacity: 0;
   visibility: hidden;
   max-height: 0; /* Garante que o gradiente não apareça */
   transition: opacity 0.2s ease, max-height 0.2s ease;
}

/* ✅ GARANTE QUE O TEXTO APAREÇA TOTALMENTE NO HOVER */
.genre-list:hover .genre-item:hover .info-overlay {
  opacity: 1;
  visibility: visible;
  max-height: 100%; /* Expande o overlay para mostrar a sinopse completa */
}

/* Título (Mantido) */
.genre-name {
  display: block;
  font-family: 'K2D', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  line-height: 1.2;
}

/* Sinopse (Ajuste Crucial: Define o limite de linhas e a quebra) */
.genre-synopsis {
  font-size: 0.9rem;
  font-weight: 300;
  color: #ccc;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limite de 2 linhas no estado normal/padrão */
  -webkit-box-orient: vertical;
}

/* ✅ GARANTE SINOPSE COMPLETA NO HOVER */
.genre-list:hover .genre-item:hover .genre-synopsis {
  -webkit-line-clamp: unset; /* Remove o limite de linhas */
}

/* 🟢 Subgênero ativo (Ajuste) */
.genre-item.active {
  width: 500px;
  margin-left: 0;
  margin-right: 40px;
  transform: none;

  z-index: 5;
  box-shadow: 0 0 25px #ff4747, 0 0 35px #c71616;
}

/* ✅ GARANTE SINOPSE COMPLETA NO ACTIVE */
.genre-item.active .info-overlay {
  opacity: 1;
  visibility: visible;
  max-height: 100%; /* Expande o overlay */
}

.genre-item.active .genre-synopsis {
  -webkit-line-clamp: unset; /* Remove o limite de linhas */
}
</style>
