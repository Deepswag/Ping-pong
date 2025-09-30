const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======== Resize Handling ========
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.75;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  initBricks(); // rebuild bricks when resized
});

// ======== Ball ========
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx, dy;
const ballRadius = 10;

// ======== Paddle ========
const paddleHeight = 12;
let paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
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
  // detect mobile
  const deviceIsMobile = window.innerWidth < 768;

  // base width (60px chunks)
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2) / 60);
  brickWidth =
    (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
    brickColumnCount;

  brickHeight = BRICK_HEIGHT;

  if (deviceIsMobile) {
    brickWidth *= 0.8;  // reduce both width and height
    brickHeight *= 0.8;
    paddleWidth *= 0.8; // also reduce paddle width
  }

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
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("touchmove", touchMoveHandler, { passive: false });

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}
function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}
function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}
function touchMoveHandler(e) {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX > 0 && touchX < canvas.width) {
    paddleX = touchX - paddleWidth / 2;
  }
}

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
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += r + 2;
          updateHUD();
        }
      }
    }
  }
}

// ======== HUD Update ========
function updateHUD() {
  const hudScore = document.getElementById("hudScore");
  const hudCoins = document.getElementById("hudCoins");
  const hudTotalCoins = document.getElementById("hudTotalCoins");

  if (hudScore) hudScore.textContent = score;

  // calculate coins earned this game only at full 100s
  coinsEarned = Math.floor(score / 100) * 0.25;
  if (hudCoins) hudCoins.textContent = coinsEarned.toFixed(2);
  if (hudTotalCoins) hudTotalCoins.textContent = totalCoins.toFixed(2);
}

// ======== Game Loop ========
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // Bounce off side walls
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  // Bounce off top
  if (y + dy < ballRadius) dy = -dy;
  // Paddle hit
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

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  // Check win (all bricks cleared)
  if (bricks.flat().every(b => b.status === 0)) {
    endGame();
    return;
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

// ======== Game Start & End ========
function startGame() {
  score = 0;
  coinsEarned = 0;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = Math.random() > 0.5 ? 4 : -4; // random initial direction
  dy = -4;
  paddleX = (canvas.width - paddleWidth) / 2;
  initBricks();
  updateHUD();
  requestAnimationFrame(draw);
}

function endGame() {
  totalCoins += coinsEarned;
  localStorage.setItem("totalCoins", totalCoins.toFixed(2));

  document.getElementById("finalScore").textContent =
    `Game Over! Score: ${score} | Coins: ${coinsEarned.toFixed(2)} | Total Coins: ${totalCoins.toFixed(2)}`;
  document.getElementById("gameOverOverlay").style.display = "flex";
}
