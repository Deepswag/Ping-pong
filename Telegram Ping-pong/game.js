const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- Responsive Canvas ----------
function resizeCanvas() {
  canvas.width  = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.75;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------- Game Variables ----------
let ballRadius = 10;
let dx = 2;
let dy = -2;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let x = canvas.width / 2;
let y = canvas.height - 30;
let score = 0;
let gameRunning = true;

let rightPressed = false;
let leftPressed = false;

// ---------- Input ----------
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "ArrowRight" || e.key === "Right") rightPressed = true;
  else if (e.key === "ArrowLeft" || e.key === "Left") leftPressed = true;
}
function keyUpHandler(e) {
  if (e.key === "ArrowRight" || e.key === "Right") rightPressed = false;
  else if (e.key === "ArrowLeft" || e.key === "Left") leftPressed = false;
}

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

// ---------- Overlay Elements ----------
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
overlay.style.display = "none";
overlay.style.flexDirection = "column";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.color = "#fff";
overlay.style.fontSize = "24px";
overlay.style.zIndex = "9999";

const message = document.createElement("div");
const btnContainer = document.createElement("div");
btnContainer.style.marginTop = "20px";

const restartBtn = document.createElement("button");
restartBtn.textContent = "Restart";
restartBtn.style.margin = "0 10px";
restartBtn.style.padding = "10px 20px";
restartBtn.style.fontSize = "18px";

const exitBtn = document.createElement("button");
exitBtn.textContent = "Exit";
exitBtn.style.margin = "0 10px";
exitBtn.style.padding = "10px 20px";
exitBtn.style.fontSize = "18px";

btnContainer.appendChild(restartBtn);
btnContainer.appendChild(exitBtn);
overlay.appendChild(message);
overlay.appendChild(btnContainer);
document.body.appendChild(overlay);

// ---------- Game Over ----------
function gameOver() {
  gameRunning = false;
  canvas.style.cursor = "default"; // show cursor again
  message.textContent = `GAME OVER! Final Score: ${score}`;
  overlay.style.display = "flex";
}

// Restart handler
restartBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  resetGame();
  gameRunning = true;
  draw();
});

// Exit handler
exitBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  canvas.style.display = "none";
  document.getElementById("score").innerText = "Thanks for playing!";
});

// ---------- Reset Game ----------
function resetGame() {
  score = 0;
  paddleX = (canvas.width - paddleWidth) / 2;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  canvas.style.display = "block";
  canvas.style.cursor = "none"; // hide cursor again
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
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();

  // Keyboard movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  // Ball movement
  x += dx;
  y += dy;

  // Bounce off walls
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - paddleHeight - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      score++;
    } else {
      gameOver();
      return;
    }
  }

  requestAnimationFrame(draw);
}

// ---------- Start Game ----------
canvas.style.cursor = "none"; // hide cursor during play
draw();
