
<script setup>
  import { defineProps, onMounted } from 'vue';
  import { useShowStore } from '@/stores/tv';

  const showStore = useShowStore();

  const props = defineProps({
    showId: {
      type: Number,
      required: true,
    },
  });

  onMounted(async () => {
    await showStore.getShowDetail(props.showId);
  });
</script>

<template>
  <div class="main">
    <div class="content">
      <img
        :src="`https://image.tmdb.org/t/p/w185${showStore.currentShow.poster_path}`"
        :alt="showStore.currentShow.name"
      />
      <div class="details">
        <h1>Série: {{ showStore.currentShow.name }}</h1>
        <p>{{ showStore.currentShow.overview }}</p>
        <p class="status">
          Status:
          {{
            {
              'Returning Series': 'Em exibição',
              'Ended': 'Finalizada',
              'Canceled': 'Cancelada',
              'In Production': 'Em produção',
              'Planned': 'Planejada',
              'Pilot': 'Episódio piloto'
            }[showStore.currentShow.status] || showStore.currentShow.status
          }}
        </p>
        <p>Avaliação: {{ showStore.currentShow.vote_average }}</p>
        <p>Temporadas: {{ showStore.currentShow.number_of_seasons }}</p>
      </div>
    </div>

    <p class="produtoras">Produtoras</p>
    <div class="companies">
      <template
        v-for="company in showStore.currentShow.production_companies"
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
  padding: 1vw 0 0 0;
}

.status {
  margin: 1vw 0 0 0;
}

</style>
