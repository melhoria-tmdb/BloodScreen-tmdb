import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useShowStore = defineStore('show', () => {
  const state = reactive({
    currentShow: {},
    currentCast: [], // <-- adiciona aqui
  });

  const currentShow = computed(() => state.currentShow);
  const currentCast = computed(() => state.currentCast); // <-- adiciona aqui

  const getShowDetail = async (showId) => {
    const response = await api.get(`tv/${showId}?language=pt-BR`);
    state.currentShow = response.data;
  };

  const getShowCredits = async (showId) => { // <-- nova função
    const response = await api.get(`tv/${showId}/credits?language=pt-BR`);
    state.currentCast = response.data.cast;
  };

  return { currentShow, currentCast, getShowDetail, getShowCredits };
});
