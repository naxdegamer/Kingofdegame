// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;
const COMPUTER_SPEED = 4;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Player paddle (left)
const player = {
    x: 15,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: PADDLE_SPEED
};

// Computer paddle (right)
const computer = {
    x: canvas.width - PADDLE_WIDTH - 15,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    speed: COMPUTER_SPEED
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    speed: BALL_SPEED
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Smooth mouse control
    const paddleCenter = player.y + player.height / 2;
    const distance = mouseY - paddleCenter;
    
    if (Math.abs(distance) > 5) {
        player.dy = Math.max(-PADDLE_SPEED, Math.min(PADDLE_SPEED, distance / 10));
    }
});

// Update player position based on arrow keys
function updatePlayerInput() {
    player.dy = 0;
    
    if (keys['ArrowUp']) {
        player.dy = -PADDLE_SPEED;
    }
    if (keys['ArrowDown']) {
        player.dy = PADDLE_SPEED;
    }
}

// Update paddles
function updatePaddles() {
    // Player paddle
    player.y += player.dy;
    
    // Keep player paddle in bounds
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
    
    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 35) {
        computer.y += COMPUTER_SPEED;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= COMPUTER_SPEED;
    }
    
    // Keep computer paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }
    
    // Paddle collision (player)
    if (checkPaddleCollision(ball, player)) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits the paddle
        const collidePoint = ball.y - (player.y + player.height / 2);
        ball.dy = (collidePoint / (player.height / 2)) * ball.speed;
    }
    
    // Paddle collision (computer)
    if (checkPaddleCollision(ball, computer)) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits the paddle
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        ball.dy = (collidePoint / (computer.height / 2)) * ball.speed;
    }
    
    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Collision detection
function checkPaddleCollision(ball, paddle) {
    return (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffd700';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '18px Arial';
        ctx.fillText('Press Space to Resume', canvas.width / 2, canvas.height / 2 + 30);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    
    if (gameRunning) {
        updatePlayerInput();
        updatePaddles();
        updateBall();
    }
    
    drawGameStatus();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
  
