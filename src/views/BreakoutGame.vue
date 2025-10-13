<template>
  <div class="breakout-wrap">
    <div class="hud">
      <div>Pontuação: {{ score }}</div>
      <div>Vidas: {{ lives }}</div>
      <button @click="restart" class="restart">Reiniciar</button>
      <button @click="$emit('close')">Fechar</button>
    </div>

    <canvas ref="canvas" :width="canvasW" :height="canvasH" tabindex="0"></canvas>

    <!-- tela de derrota -->
    <div v-if="showDefeat" class="overlay">
      <div class="message">
        <h2>💀 Derrota!</h2>
        <p>Tente novamente</p>
        <button @click="handleRestart">Reiniciar</button>
      </div>
    </div>

    <div class="controls">
      <small>Use ← →</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
const canvasW = 700
const canvasH = 400

let ctx, rafId
let leftDown = false, rightDown = false
let touchStartX = null

// estado
const score = ref(0)
const lives = ref(3)
const showDefeat = ref(false)

const paddle = { w: 100, h: 12, x: (canvasW - 100) / 2, y: canvasH - 40, speed: 10.3 }
const ball = { x: canvasW / 2, y: canvasH / 2, r: 8, vx: 4, vy: -4 }

const brickRowCount = 5
const brickColCount = 9
const brickWidth = 64
const brickHeight = 18
const brickPadding = 8
const brickOffsetTop = 40
const brickOffsetLeft = (canvasW - (brickColCount * (brickWidth + brickPadding) - brickPadding)) / 2

let bricks = []
const speedIncreaseFactor = 1.01
const minSpeed = 2

// inicializa tijolos
function initBricks() {
  bricks = []
  for (let c = 0; c < brickColCount; c++) {
    bricks[c] = []
    for (let r = 0; r < brickRowCount; r++) {
      const x = brickOffsetLeft + c * (brickWidth + brickPadding)
      const y = brickOffsetTop + r * (brickHeight + brickPadding)
      bricks[c][r] = { x, y, status: 1 }
    }
  }
}

function drawBricks() {
  for (let c = 0; c < brickColCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r]
      if (b.status === 1) {
        ctx.fillStyle = `hsl(${(r / brickRowCount) * 60 + (c / brickColCount) * 30}, 70%, 50%)`
        roundRect(ctx, b.x, b.y, brickWidth, brickHeight, 6, true, false)
      }
    }
  }
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

function drawPaddle() {
  ctx.fillStyle = '#fff'
  roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 6, true, false)
}

function drawBall() {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fillStyle = '#ffdd57'
  ctx.fill()
  ctx.closePath()
}

function movePaddle() {
  if (leftDown) paddle.x -= paddle.speed
  if (rightDown) paddle.x += paddle.speed
  paddle.x = Math.max(0, Math.min(canvasW - paddle.w, paddle.x))
}

function isLevelCleared(){
  for (let c = 0; c < brickColCount; c++)
  {
    for (let r = 0; r < brickRowCount; r++)
    {
      if (bricks[c][r].status === 1) return false
    }
  }
  return true
}

function collisionDetection() {
  for (let c = 0; c < brickColCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r]
      if (b.status === 1) {
        if (
          ball.x + ball.r > b.x && ball.x - ball.r < b.x + brickWidth &&
          ball.y + ball.r > b.y && ball.y - ball.r < b.y + brickHeight
        ) {
          const overlapLeft = ball.x + ball.r - b.x
          const overlapRight = b.x + brickWidth - (ball.x - ball.r)
          const overlapTop = ball.y + ball.r - b.y
          const overlapBottom = b.y + brickHeight - (ball.y - ball.r)
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

          if (minOverlap === overlapLeft) {
            ball.vx = -Math.abs(ball.vx)
            ball.x = b.x - ball.r - 0.5
          } else if (minOverlap === overlapRight) {
            ball.vx = Math.abs(ball.vx)
            ball.x = b.x + brickWidth + ball.r + 0.5
          } else if (minOverlap === overlapTop) {
            ball.vy = -Math.abs(ball.vy)
            ball.y = b.y - ball.r - 0.5
          } else {
            ball.vy = Math.abs(ball.vy)
            ball.y = b.y + brickHeight + ball.r + 0.5
          }

          ball.vx *= speedIncreaseFactor
          ball.vy *= speedIncreaseFactor

          b.status = 0
          score.value += 10
        }
      }
    }
  }
}

function updateBall() {
  ball.x += ball.vx
  ball.y += ball.vy

  // paredes
  if (ball.x + ball.r > canvasW || ball.x - ball.r < 0) ball.vx = -ball.vx
  if (ball.y - ball.r < 0) ball.vy = -ball.vy

  // paddle
  if (
    ball.y + ball.r > paddle.y &&
    ball.x + ball.r > paddle.x &&
    ball.x - ball.r < paddle.x + paddle.w &&
    ball.vy > 0
  ) {
    const collidePoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)
    const angle = collidePoint * (Math.PI / 3)
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2)
    ball.vx = speed * Math.sin(angle)
    ball.vy = -Math.abs(speed * Math.cos(angle))
    ball.y = paddle.y - ball.r - 1
  }

  // derrota
  if (ball.y - ball.r > canvasH && !showDefeat.value) {
    lives.value--
    if (lives.value <= 0) {
      showDefeat.value = true
      cancelAnimationFrame(rafId)
      return
    } else {
      ball.x = canvasW / 2
      ball.y = canvasH / 2
      ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1)
      ball.vy = -4
      paddle.x = (canvasW - paddle.w) / 2
    }
  }
}

function resetAll() {
  score.value = 0
  lives.value = 3
  initBricks()
  ball.x = canvasW / 2
  ball.y = canvasH / 2
  ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1)
  ball.vy = -4
  paddle.x = (canvasW - paddle.w) / 2
  showDefeat.value = false
}

function loop() {
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.fillStyle = '#071024'
  ctx.fillRect(0, 0, canvasW, canvasH)

  movePaddle()
  updateBall()
  collisionDetection()

  //verifica vitória de fase
  if (isLevelCleared()) { cancelAnimationFrame(rafId)
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, canvasH / 2 - 40, canvasW, 80)
    ctx.fillStyle = '#fff'
    ctx.font = '22px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🏆 Fase concluída!', canvasW / 2, canvasH / 2 + 8)

    setTimeout(() =>
    { resetAll()
    rafId = requestAnimationFrame(loop)
    }, 1000)

   return }

  drawBricks()
  drawPaddle()
  drawBall()

  if (!showDefeat.value) rafId = requestAnimationFrame(loop)
}

function restart() {
  cancelAnimationFrame(rafId)
  resetAll()
  rafId = requestAnimationFrame(loop)
}

function handleRestart() {
  resetAll()
  rafId = requestAnimationFrame(loop)
}

function keyDownHandler(e) {
  if (e.key === 'ArrowLeft') leftDown = true
  else if (e.key === 'ArrowRight') rightDown = true
}
function keyUpHandler(e) {
  if (e.key === 'ArrowLeft') leftDown = false
  else if (e.key === 'ArrowRight') rightDown = false
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resetAll()
  rafId = requestAnimationFrame(loop)

  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)
})
onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', keyDownHandler)
  window.removeEventListener('keyup', keyUpHandler)
})
</script>

<style scoped>
.breakout-wrap { display:flex; flex-direction:column; align-items:center; gap:8px; }
canvas { border-radius:8px; box-shadow:0 6px 30px rgba(0,0,0,0.6); touch-action:none; }
.hud { width:100%; display:flex; justify-content:space-between; align-items:center; color:#fff; margin-bottom:6px; }
.hud button { background:#1f6feb; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
.controls { color:#bbb; font-size:12px; margin-top:6px; text-align:center; }
.restart { margin-left:11vw; }

.overlay {
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,0,0,0.8);
  border-radius:8px;
}

.message {
  background:#1a1a1a;
  color:white;
  padding:20px 40px;
  border-radius:12px;
  text-align:center;
  box-shadow:0 0 20px rgba(0,0,0,0.6);
}
.message button {
  background:#4caf50;
  color:white;
  border:none;
  padding:8px 16px;
  border-radius:8px;
  margin-top:10px;
  cursor:pointer;
}
.message button:hover {
  background:#66bb6a;
}
</style>
