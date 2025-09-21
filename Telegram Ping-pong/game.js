const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- Responsive Canvas ----------
function resizeCanvas() {
  canvas.width  = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.75;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  setupBricks(); // rebuild bricks when size changes
});

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

// ---------- Brick Settings ----------
const brickRowCount = 7;
let brickColumnCount;         // depends on screen width
const brickPadding = 10;
const brickOffsetTop = 30;
const brickHeight = 20;
let brickWidth;
let bricks = [];

// build bricks dynamically based on current canvas size
function setupBricks() {
  // approximate brick width so they fit with padding
  brickColumnCount = Math.floor((canvas.width + brickPadding) / (75 + brickPadding));
  brickWidth = (canvas.width - brickPadding * (brickColumnCount + 1)) / brickColumnCount;

  bricks = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 }; // 1 = visible
    }
  }
}
setupBricks();

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

// ---------- Overlay ----------
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
exitBtn.styl
