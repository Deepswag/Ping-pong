const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

let x, y, dx, dy, ballRadius = 10;
const paddleHeight = 12;
const paddleWidth = 100;
let paddleX, rightPressed = false, leftPressed = false;
let score = 0;
const brickRowCount = 7;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 10;
const brickHeight = 20;
let brickColumnCount, brickWidth;
let bricks = [];
let gameRunning = false;

// ======== Resize & Initialize ========
function resizeCanvas(){
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.75;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initBricks() {
  brickColumnCount = Math.floor((canvas.width - brickOffsetLeft*2)/60);
  brickWidth = (canvas.width - brickOffsetLeft*2 - (brickColumnCount-1)*brickPadding)/brickColumnCount;
  bricks = [];
  for(let r=0;r<brickRowCount;r++){
    bricks[r] = [];
    for(let c=0;c<brickColumnCount;c++){
      bricks[r][c]={x:0,y:0,status:1};
    }
  }
}

// ======== Controls ========
document.addEventListener("keydown", e => {
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});
document.addEventListener("mousemove", e => {
  const relX = e.clientX - canvas.getBoundingClientRect().left;
  if(relX>0 && relX<canvas.width) paddleX=relX-paddleWidth/2;
});
document.addEventListener("touchmove", e => {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if(touchX>0 && touchX<canvas.width) paddleX = touchX-paddleWidth/2;
},{passive:false});

// ======== Draw ========
function drawBackground(){ctx.fillStyle="#001a66";ctx.fillRect(0,0,canvas.width,canvas.height);}
function drawBall(){ctx.beginPath();ctx.arc(x,y,ballRadius,0,Math.PI*2);ctx.fillStyle="#ffffff";ctx.fill();ctx.closePath();}
function drawPaddle(){ctx.beginPath();ctx.rect(paddleX,canvas.height-paddleHeight-10,paddleWidth,paddleHeight);ctx.fillStyle="#ff8800";ctx.fill();ctx.closePath();}
function drawBricks(){
  for(let r=0;r<brickRowCount;r++){
    for(let c=0;c<brickColumnCount;c++){
      const b = bricks[r][c];
      if(b.status===1){
        b.x = brickOffsetLeft+c*(brickWidth+brickPadding);
        b.y = brickOffsetTop+r*(brickHeight+brickPadding);
        ctx.beginPath();ctx.rect(b.x,b.y,brickWidth,brickHeight);ctx.fillStyle="lightgreen";ctx.fill();ctx.closePath();
      }
    }
  }
}

function drawWatermark() {
  const blankAreaHeight = canvas.height - (canvas.height - paddleHeight - 10 + paddleHeight + 10); 
  // simpler: just use area from paddle bottom to canvas bottom
  const yPosition = canvas.height - (canvas.height - paddleHeight - 10)/2 + paddleHeight/2 + 30;

  ctx.save();
  ctx.globalAlpha = 0.6; // 60% transparency
  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.floor(canvas.height * 0.2)}px Arial Black`; // size ~20% of canvas height
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("INQ Labs", canvas.width / 2, canvas.height - ((canvas.height - paddleHeight - 10)/2) );
  ctx.restore();
}

function drawScore(){ctx.fillStyle="#ffffff";ctx.font="20px Arial";ctx.fillText("Score: "+score,20,30);}
function collisionDetection(){
  let bricksRemaining = 0; // counter for remaining bricks

  for(let r=0;r<brickRowCount;r++){
    for(let c=0;c<brickColumnCount;c++){
      const b = bricks[r][c];
      if(b.status===1){
        bricksRemaining++; // count visible bricks
        if(x>b.x && x<b.x+brickWidth && y>b.y && y<b.y+brickHeight){
          dy = -dy;
          b.status = 0;
          score += r+2; // Row1=2 ... Row7=8
        }
      }
    }
  }

  // Check if all bricks are gone
  if(bricksRemaining === 0){
    showGameOver();
  }
}

// ======== Game Loop ========
function draw(){
  if(!gameRunning) return;
  drawBackground();drawBricks();drawBall();drawPaddle();drawScore();collisionDetection();
  if(x+dx>canvas.width-ballRadius||x+dx<ballRadius) dx=-dx;
  if(y+dy<ballRadius) dy=-dy;
  else if(y+dy>canvas.height-ballRadius-paddleHeight-10){
    if(x>paddleX&&x<paddleX+paddleWidth){dy=-dy;score+=1;}
    else if(y+dy>canvas.height-ballRadius){showGameOver();return;}
  }
  if(rightPressed&&paddleX<canvas.width-paddleWidth) paddleX+=7;
  else if(leftPressed&&paddleX>0) paddleX-=7;
  x+=dx;y+=dy;
  requestAnimationFrame(draw);
}

// ======== Start / Restart / Exit ========
function startGame(){
  resizeCanvas(); // ensure canvas size correct before initializing
  startOverlay.style.display="none";
  gameOverOverlay.style.display="none";
  score=0;
  x=canvas.width/2;y=canvas.height-30;
  dx=4;dy=-4;
  paddleX=(canvas.width-paddleWidth)/2;
  initBricks();
  gameRunning=true;
  draw();
}
function showGameOver(){
  gameRunning=false;
  finalScore.textContent="Game Over! Final Score: "+score;
  gameOverOverlay.style.display="flex";
}


startBtn.onclick=startGame;
restartBtn.onclick=startGame;
exitBtn.onclick=()=>window.location.reload();
