<template>
  <div class="runner-wrap">
    <div class="hud">
      <div id="points">
        Pontuação: {{ score }} | Recorde: {{ highScore }}
      </div>
      <div class="right">
      <button @click="restart" class="restart">Reiniciar</button>
      <button @click="backToMenu" class="menu">Menu</button>
      <button @click="$emit('close')">Fechar</button>
      </div>
    </div>

    <canvas ref="canvas" :width="canvasW" :height="canvasH" tabindex="0"></canvas>

    <div v-if="showDefeat" class="overlay" @click.self="handleRestart">
      <div class="message" role="dialog" aria-modal="true" aria-label="Game over">
        <h2>💀 Game Over!</h2>
        <p>Tente novamente</p>
        <button @click="handleRestart">Reiniciar</button>
      </div>
    </div>

    <div class="controls">
      <small>Use ESPAÇO ou <span>↑</span> para pular</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['backToMenu'])
function backToMenu() {
  // Envia evento para o app.vue
  emit('backToMenu')
}

const highScore = ref(Number(localStorage.getItem('highScore') || 0))

// =================
// CANVAS / STATE
// =================
const canvas = ref(null)
const canvasW = 700
const canvasH = 200

let ctx = null
let rafId = null

const score = ref(0)
const showDefeat = ref(false)
let isJumping = false
const groundHeight = 14

// =================
// SPRITES / IMAGENS
// =================
const spriteRun = new Image()
spriteRun.src = '/cats.png'

const spriteJump = new Image()
spriteJump.src = '/jumping.png'

// Obstáculos: múltiplos tipos
const obstacleImages = []

const tombstone1 = new Image()
tombstone1.src = '/grave1.png'
obstacleImages.push(tombstone1)

const tombstone2 = new Image()
tombstone2.src = '/grave2.png'
obstacleImages.push(tombstone2)

const tombstone3 = new Image()
tombstone3.src = '/grave3.png'
obstacleImages.push(tombstone3)

const tombstone4 = new Image()
tombstone4.src = '/grave4.png'
obstacleImages.push(tombstone4)


// =================
// GATO (ANIMAÇÕES)
// =================
const animations = {
  run: { img: spriteRun, frameW: 64, frameH: 64, frames: 4, speed: 6 },
  jump: { img: spriteJump, frameW: 64, frameH: 64, frames: 1, speed: 1 },
}

const cat = {
  x: 50,
  y: canvasH - 64 - groundHeight,
  w: 64,
  h: 64,
  vy: 0,
  gravity: 0.8,
  jumpStrength: -12,
  anim: 'run',
  frame: 0,
  frameCounter: 0,
}

// ===========================
// ESTRELAS
// ===========================
let stars = []
function initStars(count = 60) {
  stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH * 0.55,
      size: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.6 + 0.2,
    })
  }
}
function updateStars() {
  for (const s of stars) {
    s.x -= s.speed
    if (s.x < -8) {
      s.x = canvasW + Math.random() * 30
      s.y = Math.random() * canvasH * 0.55
    }
  }
}
function drawStars() {
  ctx.fillStyle = 'white'
  for (const s of stars) ctx.fillRect(s.x, s.y, s.size, s.size)
}

// ===========================
// ÁRVORES
// ===========================
let trees = []
function initTrees(count = 18) {
  trees = []
  for (let i = 0; i < count; i++) {
    trees.push({
      x: Math.random() * canvasW,
      baseY: canvasH - groundHeight,
      size: Math.random() * 26 + 22,
      speed: Math.random() * 0.9 + 0.3,
    })
  }
}
function updateTrees() {
  for (const t of trees) {
    t.x -= t.speed
    if (t.x < -120) {
      t.x = canvasW + Math.random() * 220
      t.size = Math.random() * 26 + 22
      t.speed = Math.random() * 0.9 + 0.3
    }
  }
}
function drawTrees() {
  for (const t of trees) {
    const trunkWidth = Math.max(4, Math.floor(t.size * 0.12))
    const trunkHeight = Math.max(8, Math.floor(t.size * 0.35))
    const trunkX = t.x - (trunkWidth / 2)
    const trunkTopY = t.baseY - trunkHeight

    ctx.fillStyle = '#2b1606'
    ctx.fillRect(trunkX, trunkTopY, trunkWidth, trunkHeight)

    const foliageBottom = trunkTopY
    ctx.fillStyle = '#071309'
    ctx.beginPath()
    ctx.moveTo(t.x, t.baseY - t.size)
    ctx.lineTo(t.x - t.size * 0.55, foliageBottom)
    ctx.lineTo(t.x + t.size * 0.55, foliageBottom)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.moveTo(t.x, t.baseY - t.size * 0.7)
    ctx.lineTo(t.x - t.size * 0.4, t.baseY)
    ctx.lineTo(t.x + t.size * 0.4, t.baseY)
    ctx.closePath()
    ctx.fill()
  }
}

// ===========================
// NÉVOA POR PARTÍCULAS
// ===========================
let fogParticles = []
function createFog(count = 36) {
  fogParticles = []
  for (let i = 0; i < count; i++) {
    fogParticles.push({
      x: Math.random() * canvasW,
      y: canvasH - groundHeight - 20 + Math.random() * 36,
      size: 20 + Math.random() * 60,
      speed: 0.08 + Math.random() * 0.45,
      alpha: 0.02 + Math.random() * 0.08,
      vy: (Math.random() - 0.5) * 0.12,
      phase: Math.random() * Math.PI * 2,
    })
  }
}
function updateFogParticles() {
  for (const p of fogParticles) {
    p.x -= p.speed
    p.y += p.vy + Math.sin(p.phase) * 0.02
    p.phase += 0.005
    if (p.x + p.size < -40) {
      p.x = canvasW + Math.random() * 160
      p.y = canvasH - groundHeight - 20 + Math.random() * 36
      p.size = 20 + Math.random() * 60
      p.alpha = 0.02 + Math.random() * 0.08
      p.speed = 0.08 + Math.random() * 0.45
    }
  }
}
function drawFogParticles() {
  const sorted = fogParticles.slice().sort((a, b) => a.size - b.size)
  for (const p of sorted) {
    const grad = ctx.createRadialGradient(p.x, p.y, p.size * 0.18, p.x, p.y, p.size)
    grad.addColorStop(0, `rgba(220,220,230,${p.alpha})`)
    grad.addColorStop(0.6, `rgba(220,220,230,${Math.max(0, p.alpha * 0.55)})`)
    grad.addColorStop(1, 'rgba(220,220,230,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ===========================
// CÉU E CHÃO
// ===========================
function drawNightBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvasH)
  g.addColorStop(0, '#060616')
  g.addColorStop(1, '#0f1120')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, canvasW, canvasH)

  ctx.beginPath()
  ctx.arc(canvasW - 60, 48, 18, 0, Math.PI * 2)
  ctx.fillStyle = '#f2f2e6'
  ctx.fill()

  const groundGrad = ctx.createLinearGradient(0, canvasH - groundHeight - 6, 0, canvasH)
  groundGrad.addColorStop(0, '#3E1C00')
  groundGrad.addColorStop(1, '#1a0a00')
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, canvasH - groundHeight, canvasW, groundHeight)
}

// =================
// OBSTÁCULOS
// =================
let obstacles = []
let spawnTimer = 0
let nextSpawn = 80 // inicial
const obstacleWidth = 55
const obstacleHeight = 50
const obstacleSpeed = 6

function updateObstacles() {
  for (const o of obstacles) o.x -= obstacleSpeed
  obstacles = obstacles.filter(o => o.x + o.w > -40)

  spawnTimer++

  if (spawnTimer >= nextSpawn) {
    // Escolhe a imagem do obstáculo
    const img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)]
    const scale = 0.9 + Math.random() * 0.3
    const w = obstacleWidth * scale
    const h = obstacleHeight * scale

    obstacles.push({
      x: canvasW + 10,
      y: canvasH - h - groundHeight,
      w,
      h,
      img,
    })

    spawnTimer = 0
    nextSpawn = 60 + Math.random() * 140
  }
}
function drawObstacles() {
  for (const o of obstacles) {
    if (o.img && o.img.complete) ctx.drawImage(o.img, o.x, o.y, o.w, o.h)
    else {
      ctx.fillStyle = '#2b2b2b'
      ctx.fillRect(o.x, o.y, o.w, o.h)
    }
  }
}

// ===========================
// COLISÃO
// ===========================
function collisionDetection() {
  for (const o of obstacles) {
    const padX = o.w * 0.15
    const padY = o.h * 0.2

    const ox1 = o.x + padX
    const ox2 = o.x + o.w - padX
    const oy1 = o.y + padY
    const oy2 = o.y + o.h - padY

    const cx1 = cat.x + 8
    const cx2 = cat.x + cat.w - 8
    const cy1 = cat.y + 6
    const cy2 = cat.y + cat.h - 6

    if (cx1 < ox2 && cx2 > ox1 && cy1 < oy2 && cy2 > oy1) {
      showDefeat.value = true
      cancelAnimationFrame(rafId)
      if (score.value > highScore.value) {
        highScore.value = score.value
        localStorage.setItem('highScore', highScore.value)
      }
    }
  }
}

// =================
// GATO draw/update
// =================
function drawCat() {
  const anim = animations[cat.anim]
  const sx = anim.frameW * cat.frame
  ctx.drawImage(anim.img, sx, 0, anim.frameW, anim.frameH, cat.x, cat.y, cat.w, cat.h)
}
function updateAnimation() {
  const anim = animations[cat.anim]
  cat.frameCounter++
  if (cat.frameCounter >= anim.speed) {
    cat.frame = (cat.frame + 1) % anim.frames
    cat.frameCounter = 0
  }
}
function updateCat() {
  cat.vy += cat.gravity
  cat.y += cat.vy
  if (cat.y + cat.h >= canvasH - groundHeight) {
    cat.y = canvasH - groundHeight - cat.h
    cat.vy = 0
    isJumping = false
    cat.anim = 'run'
  }
  updateAnimation()
}

// =================
// LOOP
// =================
function loop() {
  ctx.clearRect(0, 0, canvasW, canvasH)

  drawNightBackground()

  updateStars()
  drawStars()

  updateTrees()
  drawTrees()

  updateFogParticles()
  drawFogParticles()

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

// =================
// INPUT / RESTART
// =================
function jump() {
  if (!isJumping) {
    isJumping = true
    cat.vy = cat.jumpStrength
    cat.anim = 'jump'
    cat.frame = 0
  }
}

function keyDownHandler(e) {
  if (showDefeat.value) {
    if (['KeyR', 'Space', 'ArrowUp'].includes(e.code)) {
      e.preventDefault()
      restart()
    }
    return
  }
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    jump()
  }
}

function restart() {
  cancelAnimationFrame(rafId)
  score.value = 0
  cat.y = canvasH - cat.h - groundHeight
  cat.vy = 0
  cat.frame = 0
  cat.frameCounter = 0
  obstacles = []
  showDefeat.value = false

  initStars()
  initTrees()
  createFog(36)
  rafId = requestAnimationFrame(loop)
}
function handleRestart() { restart() }

// =================
// LOAD / MOUNT
// =================
let loaded = 0
function tryStart() {
  loaded++
  if (loaded === 6) { // run, jump, tomb1, tomb2, tomb3, tomb4
    initStars()
    initTrees()
    createFog(36)
    rafId = requestAnimationFrame(loop)
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  ctx.imageSmoothingEnabled = false

  spriteRun.onload = tryStart
  spriteJump.onload = tryStart
  tombstone1.onload = tryStart
  tombstone2.onload = tryStart
  tombstone3.onload = tryStart
  tombstone4.onload = tryStart

  if (spriteRun.complete) tryStart()
  if (spriteJump.complete) tryStart()
  if (tombstone1.complete) tryStart()
  if (tombstone2.complete) tryStart()
  if (tombstone3.complete) tryStart()
  if (tombstone4.complete) tryStart()

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
  position: relative;
}

canvas {
  border-radius: 8px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.6);
  display: block;
}

.hud {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  margin-bottom: 6px;
}
.hud .right {
  gap: 2vw;
}

#points {
  color: #fff;
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
  color: #aaa;
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
}

.controls small span {
  font-size: 0.9rem;
}


.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.88);
  z-index: 9999;
}

.message {
  background: rgba(26, 26, 26, 0.98);
  color: white;
  padding: 20px 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  max-width: 92%;
  width: 420px;
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
