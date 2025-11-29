<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue"

import telefoneComponent from "@/components/home_components/telefoneComponent.vue"
import itComponent from "@/components/home_components/itComponent.vue"
import anabelleComponent from "@/components/home_components/anabelleComponent.vue"
import casamentoComponent from "@/components/home_components/casamentoComponent.vue"

const slides = [
 { component: telefoneComponent, themeColor: '152, 106, 27' },
 { component: itComponent, themeColor: '141, 27, 16' },
 { component: anabelleComponent, themeColor: '121, 110, 99' },
 { component: casamentoComponent, themeColor: '194, 99, 48' },
]

const currentIndex = ref(0)

const currentThemeColor = computed(() => slides[currentIndex.value].themeColor)

watch(currentThemeColor, (newColor) => {
    // Define uma variável CSS (--slide-theme-color) no body (ou html)
    document.documentElement.style.setProperty('--slide-theme-color', newColor)
}, { immediate: true }) // Roda imediatamente para definir a cor inicial


// ⏱ tempo entre trocas (em ms)
const intervalTime = 10000
let interval = null

// Função para iniciar ou reiniciar o carrossel automático
function startInterval() {
  clearInterval(interval) // Limpa qualquer intervalo existente
  interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.length
  }, intervalTime)
}

onMounted(() => {
    interval = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % slides.length
    }, intervalTime)
})

function goToSlide(index) {
    currentIndex.value = index
    startInterval()
}

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="w-full h-screen overflow-hidden relative">

    <transition name="slide-left">
      <component :is="slides[currentIndex].component" :key="currentIndex" class="w-full h-full absolute inset-0" />
    </transition>

    <div class="linha-e-bolas">
      <div class="segmento-linha linha-inferior"></div>
      <div class="segmento-linha linha-superior"></div>

      <div v-for="(slide, index) in slides" :key="index" class="bola" @click="goToSlide(index)"
        :class="{ 'bola-ativa': index === currentIndex }" :style="{ bottom: `${15 + index * 5}%` }">
      </div>
    </div>

  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.8s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

.linha-e-bolas {
  position: absolute;
  height: 100%;
  width: 20px;
  left: 5vw;
  bottom: 0;
}

.segmento-linha {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  background: white;
  z-index: 1;
}

.linha-inferior {
  height: 140px;
  bottom: 0%;
  background: linear-gradient(to top, white 0%, rgba(255, 255, 255, 0) 100%);
}

.linha-superior {
  height: 389px;
  bottom: 270px;

  background: linear-gradient(to bottom, white 0%, rgba(255, 255, 255, 0) 100%);
}

.bola {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: #ADADAD; /* Cor padrão cinza para todas */
    border-radius: 50%;
    z-index: 2;
    cursor: pointer; /* Adiciona a mãozinha para indicar que é clicável */
    transition: background-color 0.3s ease; /* Transição suave para a mudança de cor */
}

/* NOVO: A cor da bola ativa */
.bola-ativa {
    background-color: white !important; /* Sobrescreve o cinza quando a bola está ativa */
}
</style>
