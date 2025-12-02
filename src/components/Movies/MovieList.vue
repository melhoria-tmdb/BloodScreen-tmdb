<script setup>
const props = defineProps({ movies: Array })
const emit = defineEmits(['select'])

// Função para gerar as estrelas com base na nota
function estrelas(rating) {
  const stars = Math.round(rating / 2);  // Converte a avaliação de 1-10 para 1-5 estrelas
  let starHTML = '';

  // Adiciona as estrelas preenchidas
  for (let i = 0; i < stars; i++) {
    starHTML += '★';  // Estrela cheia
  }

  // Adiciona as estrelas vazias
  for (let i = stars; i < 5; i++) {
    starHTML += '☆';  // Estrela vazia
  }

  return starHTML;
}
</script>

<template>
  <section>
    <h1 id="rec">Recomendados</h1>
    <div>
    </div>
  </section>
  <section>
    <div class="movie-list">
    <div
      v-for="movie in movies"
      :key="movie.id"
      class="movie-card"
      @click="emit('select', movie.id)"
    >
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" />
      <div class="movie-details">
        <!-- Exibir as estrelas em cima do título -->
        <p class="movie-stars">{{ estrelas(movie.vote_average) }}</p> <!-- Exibe as estrelas -->
        <p class="movie-title">{{ movie.title }}</p>
        <p class="movie-date">
          {{ new Date(movie.release_date).toLocaleDateString('pt-BR') }}
        </p>
      
      </div>
    </div>
  </div>
  </section>
  
</template>

<style scoped>

#rec {
  text-align: center;
  align-items: center;
  margin-bottom: 0;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.movie-card {
  width: 300px;
  height: 30rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 1vw;
}

.movie-card img:hover {
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

/* Container de texto */
.movie-details {
  flex: 1;
  width: 100%;
  padding: 0rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  position: relative;  /* Para a posição das estrelas */
}

/* Estrelas de avaliação */
.movie-stars {
  font-size: 1.5rem;
  color: #ffffff;  /* Cor dourada */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* Título do filme */
.movie-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 1.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 2vw;
  margin-bottom: 0.1vw;
  font-family: 'K2D', thin;
}

/* Data de lançamento */
.movie-date {
  font-size: 0.85rem;
  color: #ffffff;

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
