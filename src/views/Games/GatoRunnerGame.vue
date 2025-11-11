<template>
  <div class="runner-wrap">
    <div class="hud">
      <div>Pontuação: {{ score }}</div>
      <button @click="restart" class="restart">Reiniciar</button>
    </div>

    <canvas ref="canvas" :width="canvasW" :height="canvasH" tabindex="0"></canvas>

    <div v-if="showDefeat" class="overlay">
      <div class="message">
        <h2>💀 Game Over!</h2>
        <p>Tente novamente</p>
        <button @click="handleRestart">Reiniciar</button>
      </div>
    </div>

    <div class="controls">
      <small>Use ESPAÇO para pular</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
const canvasW = 700
const canvasH = 200

let ctx, rafId
let isJumping = false
let jumpVelocity = 0

const score = ref(0)
const showDefeat = ref(false)

// Gato
const cat = {
  x: 50,
  y: canvasH - 40,
  w: 40,
  h: 40,
  vy: 0,
  gravity: 0.8,
  jumpStrength: -12,
}

// Obstáculos
let obstacles = []
const obstacleWidth = 20
const obstacleHeight = 40
const obstacleSpeed = 6
let spawnTimer = 0

function drawCat() {
  ctx.fillStyle = '#ff9900'
  ctx.fillRect(cat.x, cat.y, cat.w, cat.h)
}

function drawObstacles() {
  ctx.fillStyle = '#333'
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h))
}

function updateCat() {
  cat.vy += cat.gravity
  cat.y += cat.vy

  if (cat.y + cat.h > canvasH) {
    cat.y = canvasH - cat.h
    cat.vy = 0
    isJumping = false
  }
}

function updateObstacles() {
  obstacles.forEach(o => o.x -= obstacleSpeed)
  obstacles = obstacles.filter(o => o.x + o.w > 0)

  spawnTimer++
  if (spawnTimer > 80) {
    obstacles.push({
      x: canvasW,
      y: canvasH - obstacleHeight,
      w: obstacleWidth,
      h: obstacleHeight,
    })
    spawnTimer = 0
  }
}

function collisionDetection() {
  for (let o of obstacles) {
    if (
      cat.x < o.x + o.w &&
      cat.x + cat.w > o.x &&
      cat.y < o.y + o.h &&
      cat.y + cat.h > o.y
    ) {
      showDefeat.value = true
      cancelAnimationFrame(rafId)
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.fillStyle = '#cceeff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  updateCat()
  updateObstacles()
  collisionDetection()

  drawCat()
  drawObstacles()

  if (!showDefeat.value) {
    score.value++
    rafId = requestAnimationFrame(loop)
  }
}

function jump() {
  if (!isJumping) {
    cat.vy = cat.jumpStrength
    isJumping = true
  }
}

function restart() {
  cancelAnimationFrame(rafId)
  score.value = 0
  cat.y = canvasH - cat.h
  cat.vy = 0
  obstacles = []
  showDefeat.value = false
  rafId = requestAnimationFrame(loop)
}

function handleRestart() {
  restart()
}

function keyDownHandler(e) {
  if (e.code === 'Space') jump()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  rafId = requestAnimationFrame(loop)

  window.addEventListener('keydown', keyDownHandler)
})
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', keyDownHandler)
})
</script>

<style scoped>
.runner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
canvas {
  border-radius: 8px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.6);
  touch-action: none;
}
.hud {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  margin-bottom: 6px;
}
.hud div{
  color: white;
}
.hud button {
  background: #1f6feb;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.controls {
  color: #555;
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
}
.restart {
  margin-left: 11vw;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
}
.message {
  background: #1a1a1a;
  color: white;
  padding: 20px 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
}
.message button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
}
.message button:hover {
  background: #66bb6a;
}
</style>
