import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/filmes',
    name: 'Movies',
    component: () => import('../views/MovieViewsOld/MoviesView.vue'),
  },
  {
    path: '/tv',
    name: 'TV',
    component: () => import('../views/ShowViewsOld/TvView.vue'),
  },
  {
    path: '/elenco',
    name: 'elenco',
    component: () => import('../components/casting.vue'),
  },
  {
  path: '/movie/:movieId',
  name: 'MovieDetails',
  component: () => import('../views/MovieViewsOld/MovieDetailsView.vue'),
  props: true,
  },
  {
  path: '/show/:showId',
  name: 'ShowDetails',
  component: () => import('../views/ShowViewsOld/TvDetailsView.vue'),
  props: true,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
