<script setup>
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';

import SearchBarShow from '@/components/Shows/SearchBarShow.vue';
import SearchBarMovie from '@/components/Movies/SearchBarMovie.vue';

const route = useRoute();

const props = defineProps({
  showNavLinks: {
    type: Boolean,
    default: true
  },
  showSearchBar: {
    type: Boolean,
    default: false
  },
  onMenuClick: {
    type: Function,
    required: true
  },
});

const searchHandler = inject('handleSearchSelect', () => {
});

const currentSearchBarComponent = computed(() => {
  if (route.path.startsWith('/filmes')) {
    return SearchBarMovie;
  }

  if (route.path.startsWith('/tv')) {
    return SearchBarShow;
  }

  return null;
});

</script>

<template>
  <header>
    <nav>
      <div id="bloodscreen">
        <router-link to="/" class="color-target">BLOODSCREEN</router-link>
      </div>
    </nav>

    <nav v-if="showNavLinks">
      <div id="content">
        <router-link to="/filmes" class="color-target">FILMES</router-link>
        <router-link to="/tv" class="color-target">SÉRIES</router-link>
      </div>
    </nav>

    <div v-if="showSearchBar && currentSearchBarComponent" class="header-search-container">
    <component
        :is="currentSearchBarComponent"
        @select="searchHandler"
    />
</div>

    <div class="menu-container">
      <button @click="props.onMenuClick" class="p-2 border rounded text-3xl color-target" id="Menu">
        <span class="mdi mdi-menu"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: var(--header-bg) !important;
  height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.3vw;
  padding: 0 4rem;
}

#bloodscreen a {
  font-size: 30px;
  font-weight: bold;
  font-family: 'Metal Mania', regular;
}

#content {
  display: flex;
  gap: 3vw;
  position: absolute;
  top: 50%;
  left: 52%;
  transform: translate(-50%, -50%);
}

#content a {
  text-decoration: none;
  color: #ffffff !important;
  text-shadow: 0 0 0 transparent;
  transition: all 0.3s ease;
  font-family: 'K2D', thin;
  font-weight: 100;
  font-size: 20px;
}

#content a:hover {
  color: white !important;
  text-shadow: 0 0 12px white !important;
}

#content a.router-link-active {
  color: white;
}

.header-search-container {
  flex-grow: 1;
  max-width: 400px;
  margin: 0 auto;
}
</style>
