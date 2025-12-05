<script setup>
import { ref, onMounted, provide } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

import SubgenreListShow from '@/components/Shows/SubgenreListShow.vue';
import ShowList from '@/components/Shows/ShowList.vue';

const isLoading = ref(false);
const router = useRouter();
const shows = ref([]);
const currentSubgenre = ref(null);


// 🧠 Keywords principais de terror (TMDB)
const horrorKeywordList = [
  12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863,
  356262, 13209, 157758, 14676, 10714, 215790, 295907, 235847, 316790, 323295, 12565, 166701,
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183, 33505,
];

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: horrorKeywordList },

  { id: 'zombie', name: 'Zumbi', keywords: [12377, 186565], imagePath: '/public/imgs/subgeneros_series/Zumbi.png', synopsis: 'Subgênero do horror que envolve zumbis ou infectados que são cadáveres reanimados' },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714], imagePath: '/public/imgs/subgeneros_series/Slasher.jpg', synopsis: 'Subgênero focado em assassinos que perseguem e eliminam vítimas de forma violenta e direta' },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [9853, 172808, 161261, 251874, 256183], imagePath: '/public/imgs/subgeneros_series/Supernatural.jpg', synopsis: 'Subgênero centrado em forças além da compreensão humana, como espíritos, demônios e fenômenos paranormais' },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377], imagePath: '/public/imgs/subgeneros_series/Psicologico.png', synopsis: 'Subgênero que explora a mente humana, destacando paranoia, trauma e distorções da realidade' },
];

const selectableSubgenres = subgenres.slice(1);

// 🔥 Função para listar séries
const listShows = async (sub) => {

  // 🚨 ALTERAÇÃO CRUCIAL: Se o subgênero selecionado tiver um ID (não for 'Todos'),
  // navegamos para a view dinâmica.
  if (sub && sub.id !== null) {
    router.push({
      name: 'SubgenreShow',
      params: { subgenreId: sub.id }
    });
    return;
  }

  // Se o ID for 'null' (Todos), continuamos na TvView e carregamos a lista completa.

  try {
    isLoading.value = true;
    shows.value = [];
    currentSubgenre.value = sub?.id ?? null;

    const totalPages = 3;
    const allResults = [];

    // Lógica para o caso 'Todos' (sub.id === null)
    if (!sub || !Array.isArray(sub.keywords) || sub.keywords.length === 0) {
      for (let page = 1; page <= totalPages; page++) {
        const resp = await api.get('discover/tv', {
          params: {
            language: 'pt-BR',
            include_adult: false,
            page,
          },
        });
        allResults.push(...(resp.data.results || []));
      }
    } else {
      // Este bloco era para subgêneros específicos, mas agora é tratado na SubgenreShowView.
      // Para garantir que "Todos" use keywords se necessário (embora o bloco acima seja o padrão):
      const responses = await Promise.all(
        sub.keywords.map((kw) =>
          api
            .get('discover/tv', {
              params: {
                with_keywords: kw,
                language: 'pt-BR',
                sort_by: 'popularity.desc',
                include_adult: false,
                page: 1,
              },
            })
            .then((r) => r.data.results || [])
            .catch(() => [])
        )
      ); for (const list of responses) allResults.push(...list);
    }

    const uniqueShows = Array.from(new Map(allResults.map((s) => [s.id, s])).values());

    shows.value = uniqueShows
      .filter((s) => s.poster_path)
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

const handleShowSelect = (showId) => {
  router.push({ name: 'ShowDetails', params: { showId } });
};

provide('handleSearchSelect', handleShowSelect);

onMounted(async () => {
  // Garante que a listagem "Todos" seja carregada ao montar a TvView
  await listShows(subgenres[0]);
});

</script>

<template>
  <div id="banner">
    <img src="/public/imgs/banner_serie.png" alt="banner_serie" class="banner-image">
  </div>

  <div id="body">

    <div id="genres">
      <SubgenreListShow :subgenres="selectableSubgenres" :current="currentSubgenre" @change="listShows" />
    </div>

    <loading v-model:active="isLoading" is-full-page />

    <div id="shows">
      <h2>Recomendados</h2>
      <ShowList :shows="shows" @select="handleShowSelect" />
    </div>

  </div>
</template>

<style scoped>
#banner {
  line-height: 0;
  background-color: var(--bg);
}

.banner-image {
  width: 100%;
  mask-image: linear-gradient(to bottom, var(--bg) 60%, transparent 95%);
}

#body {
  background-color: var(--bg);

  background-image: linear-gradient(to bottom,
      var(--bg) 0%,
      var(--bg) 15%,

      #310101 50%,

      var(--bg) 85%,
      var(--bg) 100%);

  min-height: 100vh;
}

#genres {
  margin: 6vw 0 6vw 0;
}

#shows h2 {
  font-family: 'K2D', thin;
  font-size: 38px;
  text-align: center;
}
</style>
