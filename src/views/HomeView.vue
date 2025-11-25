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
const intervalTime = 10000
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
</style>
