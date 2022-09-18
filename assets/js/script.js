const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Board game
const board = $('#board');
const musicEL = $('.music');
const changeGameStatus = $('.toggle__game');

// Audio in game
const moveAudio = new Audio('./assets/music/move.mp3');
const eatAudio = new Audio('./assets/music/eat.mp3');
const gameOverAudio = new Audio('./assets/music/gameover.mp3');
const musicAudio = new Audio('./assets/music/music.mp3');

const columns = 20;
const rows = 16;
let timeStart = 0;
let speed = 10;
let gameStatus = 0;

let snakeHead = [1, 1];
let snakeTail = [];
let snakeDirt  = [1, 0];

let scoreHighest = JSON.parse(localStorage.getItem('scoreHighest'));
let score = 0;


let food = [10, 1];

// Request Animation to smooth game play
let requestID = null;

// Interval update board
function main(ctime) {
    requestID = window.requestAnimationFrame(main)
    if ((ctime - timeStart)/1000 < 1/speed) {
        return;
    } 
    timeStart = ctime;
    
    gameHandle();
}

// Game play handle
function gameHandle() {
    // Check game status
    if (gameOver()) {
        gameStatus = 0;
        snakeHead = [1, 1];
        snakeTail = [];
        snakeDirt = [1, 0];
        score = 0;
        gameOverAudio.play();

        board.innerHTML = `
        <button class="start__btn">
            Start New Game
        </button>
        `;
        window.cancelAnimationFrame(requestID);
        return;
    }

    // Update score
    $('#score').innerHTML = `Score: ${score}`;
    $('#score--highest').innerHTML = `Highest score: ${scoreHighest ? scoreHighest : 0}`;

    // Check food
    if (compareBlock(snakeHead, food)) {
        eatAudio.play();
        snakeTail.push(food);   
        score++;     
        if (scoreHighest) {
            if (score > scoreHighest) {
                scoreHighest = score;
                localStorage.setItem('scoreHighest', JSON.stringify(scoreHighest));
            }
        } else {
            localStorage.setItem('scoreHighest', JSON.stringify(score));
        }
        createFood();
    }

    // Update Snake
    for (let i = snakeTail.length - 1; i > 0; i--) {
        snakeTail[i] = [...snakeTail[i - 1]];
    }
    if (snakeTail.length != 0){
        snakeTail[0] = [...snakeHead];
    }
    snakeHead[0] += snakeDirt[0];
    snakeHead[1] += snakeDirt[1];

    // Clearboard
    board.innerHTML = '';

    // Create new food
    createBlock(food, 'food');

    // Render snake 
    for (let i = 0; i < snakeTail.length; i++) {
        createBlock(snakeTail[i], 'tail');
    }
    createBlock(snakeHead, 'head');
}

// Game over handle
function gameOver() {
    if (snakeHead[0] === columns || 
        snakeHead[1] === rows ||
        snakeHead[0] === 0 || 
        snakeHead[1] === 0) { 
        return true;
    }
    
    for (let i = 0 ; i < snakeTail.length; i++) {
        if (compareBlock(snakeHead, snakeTail[i])) {
            return true;
        }
    }
    return false;
}

// Create food
function createFood() {
    let foodTemp = [];
    while (true) {
        let foodOnSnake = false;
        foodTemp[0] = Math.floor(Math.random() * (columns - 1)) + 1; 
        foodTemp[1] = Math.floor(Math.random() * (rows - 1)) + 1; 
        for (let i = 0; i < snakeTail.length; i++) {
            if (compareBlock(foodTemp, snakeTail[i])) {
                foodOnSnake = true;
                break;
            }
        }
        if (!foodOnSnake) {
            food = [...foodTemp];
            break
        }
    }
}

// Create block board game
function createBlock(direction, property) {
    const block = document.createElement('div');
    block.classList.add(property);
    block.style.gridColumnStart = direction[0];
    block.style.gridRowStart = direction[1];

    board.appendChild(block);
}

// Compare position     
function compareBlock(pos1, pos2) {
    if (pos1[0] === pos2[0] && pos1[1] === pos2[1])
        return true;
    return false;
}

musicEL.addEventListener('click', () => {
    if (musicAudio.paused) {
        console.log('hello')
        musicEL.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
        musicAudio.play();
    } else {
        musicEL.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
        musicAudio.pause();
    }
    
})

changeGameStatus.addEventListener('click', () => {
    if (gameStatus == 0) {
        gameStatus = 1; 
        board.innerHTML = '';
        window.requestAnimationFrame(main);
        musicAudio.play();

    } else if (gameStatus == 1) { 
        gameStatus = 2;
        window.cancelAnimationFrame(requestID);
    } else { 
        gameStatus = 1;
        window.requestAnimationFrame(main);
    }

    if (gameStatus == 1) {
        changeGameStatus.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    } else {
        changeGameStatus.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
})

board.addEventListener('click', (e) => {
    if (e.target.closest('.start__btn')) {
        board.innerHTML = '';
        window.requestAnimationFrame(main);
        musicAudio.play();
    }
})

document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'ArrowUp': 
            if (snakeTail === []) {

            }
            if (snakeDirt[0] != 0 && snakeDirt[1] != 1) {
                snakeDirt = [0, -1];
                // moveAudio.play();
            }
            break
        case 'ArrowDown':
            if (snakeDirt[0] != 0 && snakeDirt[1] != -1) {
                snakeDirt = [0, 1];
                // moveAudio.play();
            }
            break;
        case 'ArrowLeft':
            if (snakeDirt[0] != 1 && snakeDirt[1] != 0) {
                snakeDirt = [-1, 0];
                // moveAudio.play();
            }
            break;
        case 'ArrowRight':
            if (snakeDirt[0] != -1 && snakeDirt[1] != 0) {
                snakeDirt = [1, 0];
                // moveAudio.play();
            }
            break;
        case 'Space': 
            changeGameStatus.click();
            break;
        default:
            break;
    }
});


