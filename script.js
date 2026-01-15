const game = document.getElementById("game");
const bird = document.getElementById("bird");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const finalScoreEl = document.getElementById("finalScore");
const finalBestEl = document.getElementById("finalBest");
const gameOverBox = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const jumpSound = new Audio("flap.mp3");
const crashSound = new Audio("crash.mp3");

jumpSound.volume = 0.6;
crashSound.volume = 0.6;

// ---------- SETTINGS ----------
const GRAVITY = 1;
const JUMP = 45;
const GAME_SPEED = 3;

const PIPE_GAP = 200;
const PIPE_DISTANCE = 350;

// ---------- GAME STATE ----------
let birdTop = 200;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let gameOver = false;
let gravityInterval;
let pipes = [];

bestScoreEl.innerText = bestScore;

// ---------- JUMP ----------
function birdJump() {
    if (gameOver) return;

    birdTop -= JUMP;
    if (birdTop < 0) birdTop = 0;

    jumpSound.currentTime = 0;
    jumpSound.play();
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") birdJump();
});
document.addEventListener("click", birdJump);
document.addEventListener("touchstart", e => {
    e.preventDefault();
    birdJump();
}, { passive: false });

// ---------- CREATE PIPE ----------
function createPipe(x) {
    const pipeHeight = Math.floor(Math.random() * 200) + 50;

    const topPipe = document.createElement("div");
    const bottomPipe = document.createElement("div");

    topPipe.className = "pipe top";
    bottomPipe.className = "pipe bottom";

    topPipe.style.height = pipeHeight + "px";
    bottomPipe.style.height =
        window.innerHeight - pipeHeight - PIPE_GAP + "px";

    topPipe.style.left = x + "px";
    bottomPipe.style.left = x + "px";

    game.appendChild(topPipe);
    game.appendChild(bottomPipe);

    pipes.push({
        x,
        top: topPipe,
        bottom: bottomPipe,
        passed: false
    });
}

// ---------- GAME LOOP ----------
function startGravity() {
    gravityInterval = setInterval(() => {
        if (gameOver) return;

        birdTop += GRAVITY;
        bird.style.top = birdTop + "px";

        if (birdTop > window.innerHeight - 48) {
            endGame();
        }

        pipes.forEach(pipe => {
            pipe.x -= GAME_SPEED;
            pipe.top.style.left = pipe.x + "px";
            pipe.bottom.style.left = pipe.x + "px";

            const birdRect = bird.getBoundingClientRect();
            const topRect = pipe.top.getBoundingClientRect();
            const bottomRect = pipe.bottom.getBoundingClientRect();

            if (
                birdRect.left < topRect.right &&
                birdRect.right > topRect.left &&
                (birdRect.top < topRect.bottom ||
                 birdRect.bottom > bottomRect.top)
            ) {
                endGame();
            }

            if (!pipe.passed && pipe.x + 70 < 80) {
                pipe.passed = true;
                score++;
                scoreEl.innerText = score;
            }
        });

        pipes = pipes.filter(pipe => {
            if (pipe.x < -70) {
                pipe.top.remove();
                pipe.bottom.remove();
                return false;
            }
            return true;
        });

        if (pipes.length === 0 ||
            pipes[pipes.length - 1].x <=
            window.innerWidth - PIPE_DISTANCE) {
            createPipe(window.innerWidth);
        }
    }, 20);
}

// ---------- START GAME ----------
function startGame() {
    score = 0;
    birdTop = 200;
    bird.style.top = birdTop + "px";
    scoreEl.innerText = score;
    gameOver = false;

    crashSound.pause();
    crashSound.currentTime = 0;

    pipes.forEach(p => {
        p.top.remove();
        p.bottom.remove();
    });
    pipes = [];

    createPipe(window.innerWidth);
    startGravity();
}

// ---------- GAME OVER ----------
function endGame() {
    if (gameOver) return;

    gameOver = true;
    clearInterval(gravityInterval);

    crashSound.currentTime = 0;
    crashSound.play();

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreEl.innerText = bestScore;
    }

    finalScoreEl.innerText = score;
    finalBestEl.innerText = bestScore;

    gameOverBox.style.display = "flex";
}

// ---------- RESTART ----------
restartBtn.onclick = () => {
    gameOverBox.style.display = "none";
    startGame();
};

// ---------- INIT ----------
startGame();
