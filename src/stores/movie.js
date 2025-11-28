import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    currentMovie: {},
    currentCast: [],
    reviews: [],
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
    async getMovieReviews(movieId) {
      const { data } = await api.get(`/movie/${movieId}/reviews`, {
        params: { language: 'pt-BR' }
      });
      this.reviews = data.results;  // Armazenando as avaliações no estado
    },
  }
})
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOWNiNzExNjlhMzU1NmMwYTE1NWI1MmNjY2U3MzViMyIsIm5iZiI6MTc1OTI1Mjg3NS40NTksInN1YiI6IjY4ZGMxMThiNDkyZWJlNDE3ZmUxYzYxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dAsjmg1Dcvik1B5KSQOA-AD1UAVuh5e04pXP4INnOhg`,
  },
});

export default api; 