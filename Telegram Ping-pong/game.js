/* game.js - replace existing file */
(() => {
  // DOM
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalText = document.getElementById('finalText');
  const finalSummary = document.getElementById('finalSummary');
  const restartBtn = document.getElementById('restartBtn');

  // HUD elements
  const hudScore = document.getElementById('hud-score');
  const hudCoins = document.getElementById('hud-coins');
  const hudTotal = document.getElementById('hud-total');

  // settings
  const BASE_PADDLE_WIDTH = 100;
  const BASE_BRICK_WIDTH_APPROX = 60; // used to compute columns
  const PADDLE_HEIGHT = 12;
  const BALL_RADIUS = 10;
  const BRICK_ROWS = 7;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 10;
  const BRICK_HEIGHT = 20;

  // runtime variables
  let canvasW = 800, canvasH = 480;
  let deviceIsMobile = false;

  // dynamic sizes (will be set in initSizes)
  let paddleWidth = BASE_PADDLE_WIDTH;
  let paddleX;
  let brickColumnCount = 0;
  let brickWidth = 50;
  let bricks = [];

  // ball & movement
  let x = 0, y = 0, dx = 4, dy = -4;

  // controls
  let rightPressed = false, leftPressed = false;

  // game state
  let gameRunning = false;
  let score = 0;

  // coins
  const COINS_PER_100 = 0.25; // as requested
  // we use proportional calculation: coins = score * (0.25 / 100) = score * 0.0025

  const LOCAL_KEY = 'inq_total_coins';

  // helper: load total coins from localStorage
  function loadTotalCoins() {
    const s = localStorage.getItem(LOCAL_KEY);
    const val = parseFloat(s);
    return isFinite(val) ? val : 0;
  }
  function saveTotalCoins(v) {
    localStorage.setItem(LOCAL_KEY, String(v));
  }

  // size init: set canvas pixel size (not CSS) and compute scaled sizes for mobile
  function initSizes() {
    // determine viewport size
    const maxWidth = Math.min(window.innerWidth * 0.95, 1200);
    const maxHeight = Math.min(window.innerHeight * 0.78, 900);
    canvas.width = Math.floor(maxWidth);
    canvas.height = Math.floor(maxHeight);
    canvasW = canvas.width;
    canvasH = canvas.height;

    // detect mobile (simple threshold)
    deviceIsMobile = window.innerWidth <= 768;

    // scale paddle & bricks for mobile
    if (deviceIsMobile) {
      paddleWidth = Math.round(BASE_PADDLE_WIDTH * 0.8); // reduce by 20%
    } else {
      paddleWidth = BASE_PADDLE_WIDTH;
    }

    // compute columns of bricks to fit with padding
    const approxCol = Math.floor((canvasW - BRICK_OFFSET_LEFT * 2) / BASE_BRICK_WIDTH_APPROX) || 1;
    brickColumnCount = approxCol;
    // if mobile, reduce brick width to fit more (we'll adjust below)
    let effectiveBrickWidth = (canvasW - BRICK_OFFSET_LEFT * 2 - (brickColumnCount - 1) * BRICK_PADDING) / brickColumnCount;
    if (deviceIsMobile) effectiveBrickWidth = effectiveBrickWidth * 0.8; // smaller bricks on mobile
    brickWidth = Math.floor(effectiveBrickWidth);

    // reposition paddle center
    paddleX = Math.floor((canvasW - paddleWidth) / 2);
  }

  // build bricks array
  function initBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      bricks[r] = [];
      for (let c = 0; c < brickColumnCount; c++) {
        bricks[r][c] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  // draw helpers
  function drawBackground() {
    ctx.fillStyle = '#001a66';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }
  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }
  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvasH - PADDLE_HEIGHT - 10, paddleWidth, PADDLE_HEIGHT);
    ctx.fillStyle = '#ff8800';
    ctx.fill();
    ctx.closePath();
  }
  function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        const b = bricks[r][c];
        if (b.status === 1) {
          const bx = BRICK_OFFSET_LEFT + c * (brickWidth + BRICK_PADDING);
          const by = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
          b.x = bx; b.y = by;
          ctx.beginPath();
          ctx.rect(bx, by, brickWidth, BRICK_HEIGHT);
          ctx.fillStyle = 'lightgreen';
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  // HUD update (separate from canvas)
  function updateHUD() {
    hudScore.textContent = String(score);
    const coins = +(score * 0.0025); // proportional
    hudCoins.textContent = coins.toFixed(2);
    const total = loadTotalCoins();
    hudTotal.textContent = total.toFixed(2);
  }

  // collisions
  function collisionDetection() {
    let bricksRemaining = 0;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        const b = bricks[r][c];
        if (b.status === 1) {
          bricksRemaining++;
          // check overlap: center of ball within brick rectangle (simple)
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + BRICK_HEIGHT) {
            dy = -dy;
            b.status = 0;
            score += (r + 2); // row-based scoring
            updateHUD();
          }
        }
      }
    }
    // if no bricks left -> game end (win)
    if (bricksRemaining === 0) {
      endGame(true);
    }
  }

  // main loop
  function loop() {
    if (!gameRunning) return;
    drawBackground();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // wall collisions
    if (x + dx > canvasW - BALL_RADIUS || x + dx < BALL_RADIUS) dx = -dx;
    if (y + dy < BALL_RADIUS) dy = -dy;
    else if (y + dy > canvasH - BALL_RADIUS - PADDLE_HEIGHT - 10) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -Math.abs(dy); // reflect up
        score += 1;         // paddle hit = 1 point
        updateHUD();
      } else if (y + dy > canvasH - BALL_RADIUS) {
        endGame(false); // missed paddle
        return;
      }
    }

    // keyboard paddle movement
    if (rightPressed && paddleX < canvasW - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx;
    y += dy;
    requestAnimationFrame(loop);
  }

  // start & restart
  function startGame() {
    // ensure sizes & bricks initialized
    initSizes();
    initBricks();

    // reset
    score = 0;
    updateHUD();

    // ball start - random horizontal direction
    x = canvasW / 2;
    y = canvasH - 40;
    const speed = 4;
    dx = (Math.random() < 0.5 ? -1 : 1) * (speed + Math.random() * 1.2); // randomize a bit
    dy = -Math.abs(speed + Math.random() * 0.8);

    paddleX = Math.round((canvasW - paddleWidth) / 2);

    // show/hide overlays
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // hide mouse pointer when playing
    canvas.style.cursor = 'none';

    gameRunning = true;
    loop();
  }

  // end game handler (win true if cleared bricks, false if missed)
  function endGame(win) {
    gameRunning = false;

    // compute coins earned for session proportional: score * 0.0025
    const coinsEarned = +(score * 0.0025);
    const prev = loadTotalCoins();
    const newTotal = +(prev + coinsEarned);

    // persist
    saveTotalCoins(newTotal);

    // show final overlay
    finalText.textContent = win ? 'You Win!' : 'Game Over';
    finalSummary.innerHTML = `
      <div style="margin:6px 0;">Score: <strong>${score}</strong></div>
      <div style="margin:6px 0;">Coins earned: <strong>${coinsEarned.toFixed(2)}</strong></div>
      <div style="margin:6px 0;">Total Coins: <strong>${newTotal.toFixed(2)}</strong></div>
    `;
    // update HUD total now that we've saved
    updateHUD();
    gameOverOverlay.classList.remove('hidden');

    // show mouse pointer in overlay
    canvas.style.cursor = 'default';
  }

  // keyboard & touch handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Right') rightPressed = true;
    else if (e.key === 'ArrowLeft' || e.key === 'Left') leftPressed = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Right') rightPressed = false;
    else if (e.key === 'ArrowLeft' || e.key === 'Left') leftPressed = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const rel = e.clientX - rect.left;
    if (rel > 0 && rel < canvasW) paddleX = rel - paddleWidth / 2;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const rel = e.touches[0].clientX - rect.left;
    if (rel > 0 && rel < canvasW) paddleX = rel - paddleWidth / 2;
    e.preventDefault();
  }, { passive:false });

  // UI buttons
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  // initial HUD load
  (function init() {
    initSizes();
    initBricks();
    // ensure HUD total loads from localStorage
    const tot = loadTotalCoins();
    hudTotal.textContent = tot.toFixed(2);
    hudScore.textContent = '0';
    hudCoins.textContent = '0.00';
    // show start overlay (ensure visible)
    startOverlay.classList.remove('hidden');
    gameOverOverlay.classList.add('hidden');
  })();

  // handle resize dynamically while not playing: adjust canvas CSS pixel size
  window.addEventListener('resize', () => {
    // if game running, we will not interrupt; on next start sizes will be recalculated
    if (!gameRunning) {
      initSizes();
      initBricks();
      // redraw a static preview so page not blank
      drawBackground();
      drawBricks();
    }
  });
})();
