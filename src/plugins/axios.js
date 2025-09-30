import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOWNiNzExNjlhMzU1NmMwYTE1NWI1MmNjY2U3MzViMyIsIm5iZiI6MTc1OTI1Mjg3NS40NTksInN1YiI6IjY4ZGMxMThiNDkyZWJlNDE3ZmUxYzYxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dAsjmg1Dcvik1B5KSQOA-AD1UAVuh5e04pXP4INnOh`,
  },
});

export default api;