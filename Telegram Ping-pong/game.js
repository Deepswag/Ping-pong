const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======== Resize Handling ========
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.9;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ======== Ball ========
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 4;
let dy = -4;
const ballRadius = 10;

// ======== Paddle ========
const paddleHeight = 12;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// ======== Score ========
let score = 0;

// ======== Bricks ========
const brickRowCount = 7;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 10;
const brickHeight = 20;
let brickColumnCount;   // dynamic
let brickWidth;
let bricks = [];

function initBricks() {
  // Compute how many bricks fit across screen with padding
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2) / (60));
  brickWidth =
    (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
    brickColumnCount;

  bricks = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 }; // status 1 = visible
    }
  }
}
initBricks();
window.addEventListener("resize", initBricks);

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
function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
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
          // scoring by row (Row1=2 .. Row7=8)
          score += r + 2;
        }
      }
    }
  }
}

// ======== Game Loop ========
function draw() {
  // paint the deep-blue background first
  ctx.fillStyle = "#001a66";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();       // score is now drawn over a fresh background
  collisionDetection();
  ...
}

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

function gameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER! Score: " + score, canvas.width / 2, canvas.height / 2);
}

// ======== Start ========
document.body.style.cursor = "none"; // hide mouse pointer
draw();
