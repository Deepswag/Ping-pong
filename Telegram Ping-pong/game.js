const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========== Responsive Canvas ==========
function resizeCanvas() {
  // Fit inside the viewport but keep a small margin
  canvas.width  = Math.min(window.innerWidth * 0.95, 1200); // limit max width
  canvas.height = Math.min(window.innerHeight * 0.8, 800);  // limit max height
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  initBricks();
});

// ========== Ball ==========
let x = canvas.width / 2;
let y = canvas.height - 40;
let dx = 4;
let dy = -4;
const ballRadius = 10;

// ========== Paddle ==========
const paddleHeight = 12;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// ========== Score ==========
let score = 0;

// ========== Bricks ==========
const brickRowCount = 7;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 10;
const brickHeight = 20;
let brickColumnCount;
let brickWidth;
let bricks = [];

function initBricks() {
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2) / 60);
  brickWidth =
    (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
    brickColumnCount;

  bricks = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBricks();

// ========== Controls ==========
document.addEventListener("keydown", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});
document.addEventListener("mousemove", e => {
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;
});
document.addEventListener("touchmove", e => {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX > 0 && touchX < canvas.width) paddleX = touchX - paddleWidth / 2;
}, { passive: false });

// ========== Draw Helpers ==========
function drawBackground() {
  ctx.fillStyle = "#001a66";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
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
function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 30);
}

// ========== Collision ==========
function collisionDetection() {
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score += r + 2; // row-based scoring
        }
      }
    }
  }
}

// ========== Game Loop ==========
let gameRunning = true;

function draw() {
  if (!gameRunning) return;

  drawBackground();
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  // Wall collisions
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.hei
