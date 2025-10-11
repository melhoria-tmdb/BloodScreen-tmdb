import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useShowStore = defineStore('show', () => {
  const state = reactive({
    currentShow: {},
  });

  const currentShow = computed(() => state.currentShow);

  const getShowDetail = async (showId) => {
    const response = await api.get(`tv/${showId}?language=pt-BR`);
    state.currentShow = response.data;
  };

  return { currentShow, getShowDetail };
});
