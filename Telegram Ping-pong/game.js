const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- Responsive Canvas ----------
function resizeCanvas() {
  // Fill almost the full width/height of the viewport
  canvas.width  = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.75;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------- Game Variables ----------
let ballRadius = 10;
let dx = 2;
let dy = -2;

// Paddle
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Ball starting position
let x = canvas.width / 2;
let y = canvas.height - 30;

let score = 0;

// ---------- Input ----------
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function touchMoveHandler(e) {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX > 0 && touchX < canvas.width) {
    paddleX = touchX - paddleWidth / 2;
  }
}

// ---------- Drawing ----------
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; // white ball
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(
    paddleX,
    canvas.height - paddleHeight - 10,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#ff8800"; // orange paddle
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  document.getElementById("score").innerText = "Score: " + score;
}

// ---------- Main Loop ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();

  // Ball movement
  x += dx;
  y += dy;

  // Bounce off left/right walls
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  // Bounce off top
  if (y + dy < ballRadius) {
    dy = -dy;
  }
  // Bottom collision
  else if (y + dy > canvas.height - ballRadius - paddleHeight - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      score++;
    } else {
      alert("GAME OVER! Final Score: " + score);
      document.location.reload();
    }
  }

  requestAnimationFrame(draw);
}

draw();
