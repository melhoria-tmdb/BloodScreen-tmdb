<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import Loading from 'vue-loading-overlay';
import { useRouter } from 'vue-router';

import SearchBarShow from '@/components/Shows/SearchBarShow.vue';
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
  240377, 12377, 186565, 9853, 172808, 161261, 251874, 256183,
];

// 🎬 Subgêneros com várias keywords
const subgenres = [
  { id: null, name: 'Todos', keywords: horrorKeywordList },
  { id: 'slasher', name: 'Slasher', keywords: [12339, 233450, 208318, 279729, 309061, 325665, 325992, 338102, 351863, 356262, 13209, 157758, 14676, 10714] },
  { id: 'psychological', name: 'Psicológico', keywords: [295907, 235847, 316790, 323295, 12565, 166701, 240377] },
  { id: 'zombie', name: 'Zumbi', keywords: [12377, 186565] },
  { id: 'supernatural', name: 'Sobrenatural', keywords: [9853, 172808, 161261, 251874, 256183] },
];

// 🔥 Função para listar séries
const listShows = async (sub) => {
  try {
    isLoading.value = true;
    shows.value = [];
    currentSubgenre.value = sub?.id ?? null;

    const totalPages = 3;
    const allResults = [];

    if (!sub || !Array.isArray(sub.keywords) || sub.keywords.length === 0) {
      for (let page = 1; page <= totalPages; page++) {
        const resp = await api.get('discover/tv', {
          params: {
            language: 'pt-BR',
            sort_by: 'popularity.desc',
            include_adult: false,
            page,
          },
        });
        allResults.push(...(resp.data.results || []));
      }
    } else {
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
      );
      for (const list of responses) allResults.push(...list);
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

onMounted(async () => {
  await listShows(subgenres[0]);
});

</script>

<template>
  <div id="top">
    <h1>Séries de Terror</h1>
    <SearchBarShow @select="handleShowSelect" />
  </div>

  <SubgenreListShow
    :subgenres="subgenres"
    :current="currentSubgenre"
    @change="listShows"
  />

  <loading v-model:active="isLoading" is-full-page />

  <ShowList :shows="shows" @select="handleShowSelect" />
</template>

<style scoped>
#top {
  display: flex;
  justify-content: space-between;
  padding: 2vw;
  align-items: center;
}

</style>
