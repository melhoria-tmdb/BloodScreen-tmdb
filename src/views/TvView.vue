<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();
const shows = ref([]);
const currentSubgenre = ref(null);

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: [] }, // "Horror"
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714] },
  { id: 'monster', name: 'Monstro', keywords: [1299, 238534, 210614, 33696, 214881, 252343, 162536, 224587, 172136, 228939, 266782, 191143, 11100, 18193, 183787, 289108, 215790] },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377] },
  { id: 'zombie', name: 'Zumbi', keywords: [8624, 12377, 186565, 9925, 304449, 310175, 312469, 357193, 4884, 10349] },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [344360, 162846, 351863, 166701, 3358, 2626, 13153, 15043, 241827, 256183, 323566, 212661, 249694, 33630, 240377, 4720, 161270, 162745, 167890] },
  { id: 'gore', name: 'Gore', keywords: [10292, 351656, 157758, 14546, 306196, 325798, 280075, 284439, 157676, 10714, 447] },
];

// 🔥 Função para listar séries
const listShows = async (sub) => {
  try {
    isLoading.value = true;
    shows.value = [];
    currentSubgenre.value = sub?.id ?? null;

    const keywords = sub?.keywords?.length ? sub.keywords.join(',') : '315058';
    const allResults = [];
    const totalPages = 5;

    // 🔍 Faz a busca usando discover/tv (correto para séries)
    for (let page = 1; page <= totalPages; page++) {
      const resp = await api.get('discover/tv', {
        params: {
          with_keywords: keywords,
          language: 'pt-BR',
          sort_by: 'popularity.desc',
          include_adult: false,
          page,
        },
      });
      allResults.push(...(resp.data.results || []));
    }

    // 🔄 Remove duplicatas
    const uniqueShows = Array.from(
      new Map(allResults.map(s => [s.id, s])).values()
    );

    // 📅 Ordena por data de lançamento
    shows.value = uniqueShows
      .filter(s => s.poster_path)
      .sort((a, b) => {
        const da = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
        const db = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
        return db - da;
      });
  } catch (err) {
    console.error('Erro listShows:', err);
    shows.value = [];
  } finally {
    isLoading.value = false;
  }
};

function openShow(showId) {
  router.push({ name: 'ShowDetails', params: { showId } });
}

// 🚀 Carrega automaticamente o gênero "Todos" ao abrir a página
onMounted(async () => {
  await listShows(subgenres[0]);
});
</script>


<template>
  <h1>Séries de Terror</h1>

  <!-- subgêneros -->
  <ul class="genre-list">
    <li v-for="sub in subgenres" :key="sub.id || 'all'" @click="listShows(sub)" class="genre-item"
      :class="{ active: sub.id === currentSubgenre }">
      {{ sub.name }}
    </li>
  </ul>

  <loading v-model:active="isLoading" is-full-page />

  <div class="show-list">
    <div v-for="show in shows" :key="show.id" class="show-card">
      <img :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`" :alt="show.name" @click="openShow(show.id)" />
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
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0.5rem;
  margin-top: 1.5rem;
}

.genre-item {
  background-color: #7a0b0b;
  border-radius: 1rem;
  padding: 0.5rem 1.2rem;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.4);
}

.genre-item:hover {
  cursor: pointer;
  background-color: #a31313;
  box-shadow: 0 0 0.8rem #ff2a2a;
  transform: translateY(-2px);
}

.genre-item.active {
  background-color: #c71616;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 1rem #ff4747;
  transform: scale(1.08);
  border: 2px solid #fff;
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
  text-align: center;
  line-height: 1.3rem;
  margin-bottom: 0.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.show-release-date {
  font-size: 0.85rem;
  color: #bfbfbf;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
}
</style>
