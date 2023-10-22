const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    score: 0,
    lives: 3,
    level: 1
};

const cookies = [];

// Drawing Functions
function drawcookie(cookie) {
    if (cookie.image) {
        ctx.drawImage(cookie.image, cookie.x, cookie.y, cookie.size, cookie.size);
    }
}

function updateHUD() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, 40);

    ctx.font = "20px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText("Score: " + player.score, 10, 25);
    ctx.fillText("Lives: " + player.lives, 200, 25);
    ctx.fillText("Level: " + player.level, 400, 25);
}

// Game Logic Functions
function spawncookie() {
    const baseSpeed = player.level === 1 ? 0.1 : 0.5;
    const cookie = {
        x: Math.random() * (canvas.width - 40),
        y: 0,
        size: 70,
        speed: Math.random() + baseSpeed,
        image: document.getElementById("cookieImage")
    };
    cookies.push(cookie);
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function handleCanvasClick(e) {
    const mousePos = getMousePos(canvas, e);
    for (let i = cookies.length - 1; i >= 0; i--) {
        if (mousePos.x > cookies[i].x && mousePos.x < cookies[i].x + cookies[i].size &&
            mousePos.y > cookies[i].y && mousePos.y < cookies[i].y + cookies[i].size) {
            player.score += 10;
            cookies.splice(i, 1);

            if (player.score >= 250 && player.level === 1) {
                transitionToLevel2();
            }
        }
    }
}

function saveScoreToServer() {
    const namaInput = document.getElementById('inputNama');
    const nama = namaInput.value; 
    const score = player.score.toString();

    const data = {
        nama: nama,
        score: score
    };

    fetch('https://ets-pemrograman-web-f.cyclic.app/scores/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status === 'success') {
            window.location.href = 'scoreboard.html';
        } else if (data.status === 'failed' && data.error === 'Nama sudah terdaftar') {
            alert('Nama sudah terdaftar. Silakan gunakan nama lain.');
            namaInput.value = ''; 
        } else {
            console.error('Gagal menyimpan skor ke server');
        }
    })
    .catch(error => {
        console.error('Terjadi kesalahan:', error);
    });
}


function transitionToLevel2() {
    player.level = 2;
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawncookie, 500);
}

// Canvas Resize
function resizeCanvas() {
    const aspectRatio = 4 / 3;
    let newWidth = window.innerWidth;
    let newHeight = window.innerWidth / aspectRatio;

    if (newHeight > window.innerHeight) {
        newHeight = window.innerHeight;
        newWidth = newHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cookies.forEach((cookie, index) => {
        cookie.y += cookie.speed;
        drawcookie(cookie);

        if (cookie.y > canvas.height) {
            player.lives--;
            cookies.splice(index, 1);
        }
    });

    updateHUD();

    if (player.lives > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver();
        saveScoreToServer();
    }
}

function displayGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
}

// Event Listeners
canvas.addEventListener('click', handleCanvasClick);
window.addEventListener('resize', resizeCanvas);

let spawnInterval = setInterval(spawncookie, 1000);

let gameStarted = false;

function startGame() {
    gameStarted = true;
    document.getElementById('startButton').style.display = 'none';
    player.score = 0;
    player.lives = 3;
    player.level = 1;
    cookies.length = 0;
    spawnInterval = setInterval(spawncookie, 1000);
    gameLoop();
}

// Event Listener untuk tombol Start
document.getElementById('startButton').addEventListener('click', startGame);

resizeCanvas();
