const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======== Resize Handling ========
function resizeCanvas() {
  const maxWidth = 900;  // prevent huge stretched canvas
  const maxHeight = 600;
  canvas.width = Math.min(window.innerWidth * 0.95, maxWidth);
  canvas.height = Math.min(window.innerHeight * 0.75, maxHeight);
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  initBricks();
});

// ======== Ball ========
let x, y, dx, dy;
const ballRadius = 10;

// ======== Paddle ========
const paddleHeight = 12;
let paddleWidth = 100;
let paddleX;
let rightPressed = false;
let leftPressed = false;

// ======== Score & Coins ========
let score = 0;
let coinsEarned = 0;
let totalCoins = parseFloat(localStorage.getItem("totalCoins")) || 0;

// ======== Bricks ========
const brickRowCount = 7;
const BRICK_HEIGHT = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 10;
let brickColumnCount;
let brickWidth;
let brickHeight;
let bricks = [];

function initBricks() {
  const deviceIsMobile = window.innerWidth < 768;

  if (deviceIsMobile) {
  // Smaller bricks on mobile
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2) / 50);
} else {
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2) / 70);
}

brickWidth =
  (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
  brickColumnCount;

brickHeight = deviceIsMobile ? BRICK_HEIGHT * 0.8 : BRICK_HEIGHT;
paddleWidth = deviceIsMobile ? 100 * 0.8 : 100;


  bricks = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBricks();

// ======== Controls ========
document.addEventListener("keydown", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});
document.addEventListener("mousemove", e => {
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
});
document.addEventListener("touchmove", e => {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX > 0 && touchX < canvas.width) {
    paddleX = touchX - paddleWidth / 2;
  }
}, { passive: false });

// ======== Draw Functions ========
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
  ctx.fillStyle = "#ff8800";
  ctx.fill();
  ctx.closePath();
}
function drawBricks() {
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      if (bricks[r][c].status === 1) {
        const brickX = brickOffsetLeft + c * (brickWidth + brickPadding);
        const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
        bricks[r][c].x = brickX;
        bricks[r][c].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "lightgreen";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// ======== Collision Detection ========
function collisionDetection() {
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score += r + 2;
          updateHUD();
        }
      }
    }
  }
}

// ======== HUD ========
function updateHUD() {
  document.getElementById("hudScore").textContent = score;
  coinsEarned = Math.floor(score / 100) * 0.25;
  document.getElementById("hudCoins").textContent = coinsEarned.toFixed(2);
  document.getElementById("hudTotalCoins").textContent = totalCoins.toFixed(2);
}

// ======== Game Loop ========
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius - paddleHeight - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      score += 1;
      updateHUD();
    } else if (y + dy > canvas.height - ballRadius) {
      endGame();
      return;
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  if (bricks.flat().every(b => b.status === 0)) {
    endGame();
    return;
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

// ======== Start & End ========
function startGame() {
  score = 0;
  coinsEarned = 0;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = Math.random() > 0.5 ? 4 : -4;
  dy = -4;
  paddleX = (canvas.width - paddleWidth) / 2;
  initBricks();
  updateHUD();
  document.getElementById("startOverlay").style.display = "none";
  document.getElementById("gameOverOverlay").style.display = "none";
  requestAnimationFrame(draw);
}

function endGame() {
  totalCoins += coinsEarned;
  localStorage.setItem("totalCoins", totalCoins.toFixed(2));
  document.getElementById("finalScore").textContent =
    `Game Over! Score: ${score} | Coins: ${coinsEarned.toFixed(2)} | Total Coins: ${totalCoins.toFixed(2)}`;
  document.getElementById("gameOverOverlay").style.display = "flex";
}

// ======== Button Listeners ========
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
