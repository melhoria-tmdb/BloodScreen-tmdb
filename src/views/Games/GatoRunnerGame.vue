<template>
  <div class="runner-wrap">
    <div class="hud">
      <div id="points">Pontuação: {{ score }}</div>
      <button @click="restart" class="restart">Reiniciar</button>
      <button @click="$emit('close')">Fechar</button>
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

// =============================================================
// CANVAS
// =============================================================
const canvas = ref(null)
const canvasW = 700
const canvasH = 200

let ctx = null
let rafId = null

const score = ref(0)
const showDefeat = ref(false)
let isJumping = false

// =============================================================
// SPRITES
// =============================================================
const spriteRun = new Image()
spriteRun.src = '/running.png'

const spriteJump = new Image()
spriteJump.src = '/jumping.png'

// Configurações de animação
const animations = {
  run: {
    img: spriteRun,
    frameW: 64,
    frameH: 64,
    frames: 4,
    speed: 6,
  },
  jump: {
    img: spriteJump,
    frameW: 64,
    frameH: 64,
    frames: 1,
    speed: 1,
  }
}

const cat = {
  x: 50,
  y: canvasH - 10,
  w: 64 ,
  h: 64,
  vy: 4,
  gravity: 0.8,
  jumpStrength: -12,
  anim: "run",
  frame: 0,
  frameCounter: 0,
}

// =============================================================
// OBSTÁCULOS
// =============================================================
let obstacles = []
const obstacleWidth = 20
const obstacleHeight = 40
const obstacleSpeed = 6
let spawnTimer = 0

// =============================================================
// DESENHAR GATO
// =============================================================
function drawCat() {
  const anim = animations[cat.anim]

  const sx = anim.frameW * cat.frame
  const sy = 0

  ctx.drawImage(
    anim.img,
    sx, sy, anim.frameW, anim.frameH,
    cat.x, cat.y, cat.w, cat.h
  )
}

// =============================================================
// ATUALIZA ANIMAÇÃO
// =============================================================
function updateAnimation() {
  const anim = animations[cat.anim]

  cat.frameCounter++
  if (cat.frameCounter >= anim.speed) {
    cat.frame = (cat.frame + 1) % anim.frames
    cat.frameCounter = 0
  }
}

// =============================================================
// ATUALIZA GATO
// =============================================================
function updateCat() {
  cat.vy += cat.gravity
  cat.y += cat.vy

  // chão
  if (cat.y + cat.h >= canvasH) {
    cat.y = canvasH - cat.h
    cat.vy = 0
    isJumping = false
    cat.anim = "run"
  }

  updateAnimation()
}

// =============================================================
// OBSTÁCULOS
// =============================================================
function drawObstacles() {
  ctx.fillStyle = '#333'
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h))
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

// =============================================================
// COLISÃO
// =============================================================
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

// =============================================================
// LOOP PRINCIPAL
// =============================================================
function loop() {
  ctx.clearRect(0, 0, canvasW, canvasH)

  ctx.fillStyle = '#B3B3B3'
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

// =============================================================
// INPUT
// =============================================================
function jump() {
  if (!isJumping) {
    isJumping = true
    cat.vy = cat.jumpStrength
    cat.anim = "jump"
    cat.frame = 0
  }
}

// =============================================================
// REINICIAR
// =============================================================
function restart() {
  cancelAnimationFrame(rafId)
  score.value = 0
  cat.y = canvasH - cat.h
  cat.vy = 0
  cat.frame = 0
  cat.frameCounter = 0
  obstacles = []
  showDefeat.value = false
  rafId = requestAnimationFrame(loop)
}

function handleRestart() {
  restart()
}

// =============================================================
// TECLAS
// =============================================================
function keyDownHandler(e) {
  if (e.code === 'Space') jump()
}

// =============================================================
// MONTAGEM
// =============================================================
let loaded = 0
function tryStart() {
  loaded++
  if (loaded === 2) {
    rafId = requestAnimationFrame(loop)
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')

  // pixel art nítido
  ctx.imageSmoothingEnabled = false

  spriteRun.onload = tryStart
  spriteJump.onload = tryStart

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
.hud #points {
  color: white;
}
.hud button {
  background: #d80505;
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
