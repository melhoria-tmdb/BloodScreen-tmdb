import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    currentMovie: {},
    currentCast: [],
  }),

  actions: {
    async getMovieDetail(movieId) {
      const { data } = await api.get(`/movie/${movieId}`, {
        params: { language: 'pt-BR' }
      });
      this.currentMovie = data;
    },

    async getMovieCredits(movieId) {
      const { data } = await api.get(`/movie/${movieId}/credits`, {
        params: { language: 'pt-BR' }
      });
      this.currentCast = data.cast;
      // É importante que 'data' (que contém o crew) seja retornado:
      return data;
    },

    // 👈 NOVA ACTION PARA PEGAR AS DATAS DE LANÇAMENTO (Classificação Indicativa)
    async getMovieReleaseDates(movieId) {
      try {
        // Esta chamada DEVE ser feita sem o parâmetro 'language'
        // pois queremos TODAS as datas de lançamento para encontrar o 'BR'.
        const { data } = await api.get(`/movie/${movieId}/release_dates`);
        return data;
      } catch (error) {
        console.error('Erro ao buscar datas de lançamento:', error);
        return null;
      }
    },

    async getMovieVideos(movieId) {
      try {
        const { data } = await api.get(`/movie/${movieId}/videos`);
        return data;
      } catch (error) {
        console.error('Erro ao buscar videos:', error);
        return null;
      }
    },

     async getMovieImages(movieId) {
      try {
        // 💡 CORREÇÃO: Passar o parâmetro 'include_image_language'
        const { data } = await api.get(`/movie/${movieId}/images`, {
            params: {
                // Filtra para backdrops no idioma português (pt) e universal (null/en)
                // O TMDB recomenda usar o language code para filtrar.
                include_image_language: 'pt,null',
            }
        });

        // O endpoint /images retorna um objeto com várias chaves (backdrops, posters, logos).
        // Não é necessário adicionar /backdrops ao path do endpoint.
        return data;
      } catch (error) {
        console.error('Erro ao buscar imagens:', error);
        return null;
      }
    }
  }
})
