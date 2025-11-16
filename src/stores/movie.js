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
    }
  }
})
