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
    component: () => import('../views/MovieViews/MoviesView.vue'),
  },
  {
    path: '/tv',
    name: 'TV',
    component: () => import('../views/ShowViews/TvView.vue'),
  },
  {
  path: '/movie/:movieId',
  name: 'MovieDetails',
  component: () => import('../views/MovieViews/MovieDetailsView.vue'),
  props: true,
  },
  {
  path: '/show/:showId',
  name: 'ShowDetails',
  component: () => import('../views/ShowViews/TvDetailsView.vue'),
  props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
