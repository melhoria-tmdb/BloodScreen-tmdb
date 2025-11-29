<script setup>
import { ref, onMounted, onUnmounted } from "vue"

import telefoneComponent from "@/components/home_components/telefoneComponent.vue"
import itComponent from "@/components/home_components/itComponent.vue"
import anabelleComponent from "@/components/home_components/anabelleComponent.vue"
import casamentoComponent from "@/components/home_components/casamentoComponent.vue"



const slides = [
    telefoneComponent,
    itComponent,
    anabelleComponent,
    casamentoComponent,
]

const currentIndex = ref(0)

// ⏱ tempo entre trocas (em ms)
const intervalTime = 2000
let interval = null

onMounted(() => {
    interval = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % slides.length
    }, intervalTime)
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>

<template>
    <div class="w-full h-screen overflow-hidden relative">

        <transition name="fade" mode="out-in">
            <component :is="slides[currentIndex]" :key="currentIndex" class="w-full h-full absolute inset-0" />
        </transition>

        <div class="linha-e-bolas">
                    <div class="segmento-linha linha-inferior"></div>
                    <div class="segmento-linha linha-superior"></div>

                    <div class="bola bola-1"></div>
                    <div class="bola bola-2"></div>
                    <div class="bola bola-3"></div>
                    <div class="bola bola-4"></div>
        </div>

    </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .8s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}


.linha-e-bolas {
    position: absolute;
    height: 100%;
    width: 20px;
    left: 5vw; /* O mesmo padding-left do .banner */
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
    background-color: white;
    border-radius: 50%;
    z-index: 2;
}

.bola-1 {
    bottom: 15%;
    background-color: #ADADAD;
}

.bola-2 {
    bottom: 20%;
    background-color: #ADADAD;
}

.bola-3 {
    bottom: 25%;
    background-color: #ADADAD;
}

.bola-4 {
    bottom: 30%;
}
</style>
