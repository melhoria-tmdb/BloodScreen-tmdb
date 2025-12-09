// Arquivo: '@/stores/show.js' ou o caminho que você usa
import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useShowStore = defineStore('show', () => {
  const state = reactive({
    currentShow: {},
    currentCast: [],
  });

  const currentShow = computed(() => state.currentShow);
  const currentCast = computed(() => state.currentCast);

  // 💡 MUDANÇA: Endpoint /tv/{showId}
  const getShowDetail = async (showId) => {
    const response = await api.get(`tv/${showId}?language=pt-BR`);
    state.currentShow = response.data;
  };

  // 💡 MUDANÇA: Endpoint /tv/{showId}/credits
  const getShowCredits = async (showId) => {
    const response = await api.get(`tv/${showId}/credits?language=pt-BR`);
    state.currentCast = response.data.cast;
    // Retorna os dados para pegar o "crew" (diretor)
    return response.data;
  };

  // 💡 NOVO: Função para buscar imagens de séries
  const getShowImages = async (showId) => {
    try {
      // 💡 MUDANÇA: Endpoint /tv/{showId}/images
      const { data } = await api.get(`tv/${showId}/images`, {
          params: {
              include_image_language: 'pt,null',
          }
      });
      return data;
    } catch (error) {
      console.error('Erro ao buscar imagens da série:', error);
      return null;
    }
  };

  // 💡 NOVO: Função para buscar vídeos de séries
  const getShowVideos = async (showId) => {
    try {
      // 💡 MUDANÇA: Endpoint /tv/{showId}/videos
      const { data } = await api.get(`tv/${showId}/videos`);
      return data;
    } catch (error) {
      console.error('Erro ao buscar vídeos da série:', error);
      return null;
    }
  };

  // 💡 NOVO: Função para buscar classificações de séries (Content Ratings)
  const getShowContentRatings = async (showId) => {
    try {
      // 💡 MUDANÇA: Endpoint /tv/{showId}/content_ratings
      const { data } = await api.get(`tv/${showId}/content_ratings`);
      return data;
    } catch (error) {
      console.error('Erro ao buscar classificações de série:', error);
      return null;
    }
  };

  return {
    currentShow,
    currentCast,
    getShowDetail,
    getShowCredits,
    getShowImages,
    getShowVideos,
    getShowContentRatings,
  };
});
