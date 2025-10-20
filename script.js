// Data kartu foto (duplikat untuk pair)
const animals = ['FAJRI/berangkat.jpeg', 'FAJRI/diam.jpeg', 'FAJRI/keseimbangan.jpeg', 'FAJRI/nanya.jpeg', 'FAJRI/setuju.jpeg', 'FAJRI/tawa.jpeg', 'FAJRI/blangkon.jpeg', 'FAJRI/cool.jpeg', 'FAJRI/dagu.jpeg']; // Tambah jika perlu untuk level sulit

// Skins data
const skins = [
    {
        id: 'fajri',
        name: 'FAJRI',
        images: ['FAJRI/berangkat.jpeg', 'FAJRI/diam.jpeg', 'FAJRI/keseimbangan.jpeg', 'FAJRI/nanya.jpeg', 'FAJRI/setuju.jpeg', 'FAJRI/tawa.jpeg', 'FAJRI/blangkon.jpeg', 'FAJRI/cool.jpeg', 'FAJRI/dagu.jpeg'],
        cost: 0
    },
    {
        id: 'joker',
        name: 'JOKER',
        images: ['JOKER/1.jpeg', 'JOKER/2.jpeg', 'JOKER/3.jpeg', 'JOKER/4.jpeg', 'JOKER/5.jpeg', 'JOKER/6.jpeg', 'JOKER/7.jpeg', 'JOKER/8.jpeg'],
        cost: 100
    },
    {
        id: 'sri_ira',
        name: 'SRI IRA',
        images: ['SRI IRA/ira3.jpeg', 'SRI IRA/ira2.jpeg', 'SRI IRA/ira1.jpeg', 'SRI IRA/ira4.jpeg', 'SRI IRA/sri1.jpeg', 'SRI IRA/sri2.jpeg', 'SRI IRA/sri3.jpeg', 'SRI IRA/sri4.jpeg'],
        cost: 200
    }
];

// Load skins from localStorage
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || ['fajri'];
let activeSkin = localStorage.getItem('activeSkin') || 'fajri';

// Sound settings
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default true
let backgroundMusicSource = null; // For background music

// Global audio context
let audioContext;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Sound function using Web Audio API to generate procedural sounds
async function playSound(soundType) {
    if (!soundEnabled) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (soundType) {
        case 'flip':
            // Short high-pitched beep for flip
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
            break;
        case 'match':
            // Pleasant ascending tone for match
            oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
            break;
        case 'gameOver':
            // Low descending tone for game over
            oscillator.frequency.setValueAtTime(220, ctx.currentTime); // A3
            oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5); // A2
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
            break;
        case 'shuffle':
            // Series of quick notes for shuffle
            const frequencies = [440, 554, 659, 880]; // A4, C#5, E5, A5
            frequencies.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.08);
                osc.start(ctx.currentTime + index * 0.1);
                osc.stop(ctx.currentTime + index * 0.1 + 0.08);
            });
            break;
        case 'click':
            // Short click sound
            oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
            break;
        case 'notification':
            // Pleasant chime for notifications
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
            break;
        case 'countdown':
            // Ticking sound for countdown
            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
            break;
        default:
            return;
    }
}

// Background music function
async function playBackgroundMusic() {
    if (!soundEnabled || backgroundMusicSource) return; // Don't play if disabled or already playing

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }

    // Create a simple looping melody
    const melody = [
        { freq: 523, duration: 0.5 }, // C5
        { freq: 659, duration: 0.5 }, // E5
        { freq: 784, duration: 0.5 }, // G5
        { freq: 659, duration: 0.5 }, // E5
        { freq: 523, duration: 0.5 }, // C5
        { freq: 440, duration: 0.5 }, // A4
        { freq: 523, duration: 1.0 }, // C5 (longer)
        { freq: 0, duration: 0.5 },   // Rest
        { freq: 587, duration: 0.5 }, // D5
        { freq: 698, duration: 0.5 }, // F5
        { freq: 784, duration: 0.5 }, // G5
        { freq: 698, duration: 0.5 }, // F5
        { freq: 587, duration: 0.5 }, // D5
        { freq: 523, duration: 0.5 }, // C5
        { freq: 587, duration: 1.0 }, // D5 (longer)
    ];

    let currentTime = ctx.currentTime;
    const loopLength = melody.reduce((sum, note) => sum + note.duration, 0);

    function playMelody() {
        let timeOffset = 0;
        melody.forEach(note => {
            if (note.freq > 0) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(note.freq, currentTime + timeOffset);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.1, currentTime + timeOffset);
                gain.gain.exponentialRampToValueAtTime(0.01, currentTime + timeOffset + note.duration * 0.8);

                osc.start(currentTime + timeOffset);
                osc.stop(currentTime + timeOffset + note.duration);
            }
            timeOffset += note.duration;
        });

        // Schedule next loop
        currentTime += loopLength;
        if (backgroundMusicSource) { // Check if still playing
            setTimeout(playMelody, loopLength * 1000);
        }
    }

    backgroundMusicSource = {}; // Mark as playing
    playMelody();
}

function stopBackgroundMusic() {
    backgroundMusicSource = null; // Stop the loop
}

let board = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let score = 0; // Skor awal 0, bertambah berdasarkan performa
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0; // Best score dari localStorage
let totalCoins = 0; // Total koin yang diperoleh
let timerInterval;
let gameStarted = false;
let gameOver = false;
let levelSize = 3; // Default sedang (3x2 = 3 pairs)
let levelName = 'medium'; // Default level name
let maxMoves = 0; // Batas maksimal langkah berdasarkan level
let timeLimit = 0; // Batas waktu berdasarkan level

// Element references
const gameBoard = document.getElementById('gameBoard');
const levelSelect = document.getElementById('level');
const playerNameEl = document.getElementById('playerName');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const coinsEl = document.getElementById('coins');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const backBtn = document.getElementById('backBtn');
const shopBtn = document.getElementById('shopBtn');

// Screen management
const startScreen = document.querySelector('.start-screen');
const mulaiBtn = document.getElementById('mulaiBtn');
const startPlayerNameEl = document.getElementById('startPlayerName');
const startLevelEl = document.getElementById('startLevel');
const gameScreen = document.getElementById('gameScreen');
const shopScreen = document.querySelector('.shop-screen');
const skinsScreen = document.querySelector('.skins-screen');
const leaderboardScreen = document.querySelector('.leaderboard-screen');
const skinsBtn = document.getElementById('skinsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');

levelSelect.addEventListener('change', (e) => {
    playSound('click');
    if (gameStarted) return; // Jangan ganti level saat main
    if (e.target.value === 'easy') {
        levelSize = 2;
        levelName = 'easy';
        showCustomNotification('Level Mudah Dipilih', 'hah yakin nih 2x2?? ezz bgtt');
    } else if (e.target.value === 'medium') {
        levelSize = 3;
        levelName = 'medium';
        showCustomNotification('Level Sedang Dipilih', 'halah nanggung banget mending sulit');
    } else if (e.target.value === 'hard') {
        levelSize = 4;
        levelName = 'hard';
        showCustomNotification('Level Sulit Dipilih', 'nah gitu dong baru mantap');
    }
});

startLevelEl.addEventListener('change', (e) => {
    playSound('click');
    if (e.target.value === 'easy') {
        levelName = 'easy';
        showCustomNotification('Level Mudah Dipilih', 'hah yakin nih 2x2?? ezz bgtt');
    } else if (e.target.value === 'medium') {
        levelName = 'medium';
        showCustomNotification('Level Sedang Dipilih', 'halah nanggung banget mending sulit');
    } else if (e.target.value === 'hard') {
        levelName = 'hard';
        showCustomNotification('Level Sulit Dipilih', 'nah gitu dong baru mantap');
    }
});

// Fungsi mulai game
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    gameOver = false;
    moves = 0;
    timer = 0;
    matchedPairs = 0;
    score = 0; // Reset skor ke 0
    totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0; // Load total coins from localStorage
    flippedCards = [];

    // Set max moves berdasarkan level
    if (levelSize === 2) maxMoves = 3; // Easy: 3 moves max
    else if (levelSize === 3) maxMoves = 6; // Medium: 6 moves max
    else if (levelSize === 4) maxMoves = 16; // Hard: 16 moves max

    // Set time limit berdasarkan level
    if (levelSize === 2) timeLimit = 10; // Easy: 10 seconds
    else if (levelSize === 3) timeLimit = 30; // Medium: 30 seconds
    else if (levelSize === 4) timeLimit = 120; // Hard: 2 minutes

    updateDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerEl.textContent = `${formatTime(timer)} / ${formatTime(timeLimit)}`;
        if (timer >= timeLimit && !gameOver) {
            gameOver = true;
            playSound('gameOver'); // Play game over sound
            showCustomNotification('Game Over', 'Waktu habis!\n COBALAH LAGI');
            clearInterval(timerInterval);
            setTimeout(() => {
                resetGame();
                showStartScreen();
            }, 3000); // Delay to show notification before returning to start screen
        }
        updateDisplay(); // Update skor real-time dengan timer
    }, 1000);

    initBoard();
}

// Fungsi reset
function resetGame() {
    gameStarted = false;
    clearInterval(timerInterval);
    timer = 0;
    moves = 0;
    matchedPairs = 0;
    score = 0;
    flippedCards = [];
    timerEl.textContent = '00:00';
    movesEl.textContent = '0';
    scoreEl.textContent = '0';
    gameBoard.innerHTML = '';
}

// Inisialisasi board
function initBoard() {
    board = [];
    let rows, cols;
    if (levelSize === 2) { rows = 2; cols = 2; }
    else if (levelSize === 3) { rows = 2; cols = 3; }
    else if (levelSize === 4) { rows = 4; cols = 4; }
    const pairsNeeded = (rows * cols) / 2;
    const activeSkinData = skins.find(skin => skin.id === activeSkin);
    const selectedAnimals = activeSkinData.images.slice(0, pairsNeeded);
    const cards = [...selectedAnimals, ...selectedAnimals]; // Duplikat untuk pair
    shuffleArray(cards);

    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoard.innerHTML = '';

    cards.forEach((animal, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.animal = animal;
        card.dataset.index = index;
        const img = document.createElement('img');
        img.src = animal;
        img.alt = animal.replace('.jpeg', '');
        img.style.display = 'none'; // Sembunyikan gambar awalnya
        // Perbesar gambar ira1 dan sri2
        if (animal.includes('ira1.jpeg') || animal.includes('sri2.jpeg')) {
            img.style.width = '105%';
            img.style.height = '105%';
            img.style.objectFit = 'cover';
        }
        card.appendChild(img);
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Flip kartu
function flipCard(e) {
    if (flippedCards.length >= 2 || this.classList.contains('flipped') || this.classList.contains('matched') || !gameStarted || gameOver) return;

    playSound('flip'); // Play flip sound
    this.classList.add('flipped');
    const img = this.querySelector('img');
    img.style.display = 'block'; // Tampilkan gambar saat flip
    createSparkles(this); // Tambah efek percikan saat flip
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        if (moves > maxMoves && !gameOver) {
            gameOver = true;
            playSound('gameOver'); // Play game over sound
            showCustomNotification('Game Over', 'Kamu telah mencapai batas langkah maksimal!\n COBALAH LAGI');
            clearInterval(timerInterval);
            setTimeout(() => {
                resetGame();
                showStartScreen();
            }, 3000); // Delay to show notification before returning to start screen
            return;
        }
        checkMatch();
        updateDisplay();
    }
}

// Cek match
function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.animal === card2.dataset.animal) {
        playSound('match'); // Play match sound
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++; // Tambah matched pairs
        score += 100; // Tambah skor per match
        // Update best score if current score is higher
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        totalCoins += 10; // Tambah koin per match
        localStorage.setItem('totalCoins', totalCoins); // Save to localStorage
        animateCoinInCard(card1); // Animasi koin dari kartu pertama
        animateCoinInCard(card2); // Animasi koin dari kartu kedua
        updateDisplay(); // Update skor setelah match
        // Check if all pairs are matched
        let totalPairs;
        if (levelSize === 2) totalPairs = 2;
        else if (levelSize === 3) totalPairs = 3;
        else if (levelSize === 4) totalPairs = 8;
        if (matchedPairs === totalPairs) {
            // Update best score if current score is higher
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', bestScore);
                updateDisplay(); // Update display to show new best score
            }
            // Save score to leaderboard
            const playerName = playerNameEl.value.trim() || 'Anonymous';
            saveScoreToLeaderboard(playerName, score, levelName);
            setTimeout(() => {
                playSound('shuffle'); // Play shuffle sound
                shuffleBoard();
            }, 1000); // Delay before shuffle
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            const img1 = card1.querySelector('img');
            const img2 = card2.querySelector('img');
            img1.style.display = 'none';
            img2.style.display = 'none';
        }, 1000);
    }
    flippedCards = [];
}



// Update display
function updateDisplay() {
    movesEl.textContent = `${moves}/${maxMoves}`;
    coinsEl.textContent = totalCoins;
    scoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
}

// Format waktu
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Shuffle board animation
function shuffleBoard() {
    // Pause the timer during shuffle
    clearInterval(timerInterval);

    const cards = Array.from(gameBoard.children);
    const centerX = gameBoard.offsetWidth / 2;
    const centerY = gameBoard.offsetHeight / 2;

    // Step 1: Flip all cards back
    cards.forEach(card => {
        card.classList.remove('matched', 'flipped');
        const img = card.querySelector('img');
        img.style.display = 'none';
    });

    // Step 2: Collect cards to center
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = `translate(${centerX - card.offsetLeft - card.offsetWidth / 2}px, ${centerY - card.offsetTop - card.offsetHeight / 2}px) scale(0.5)`;
        }, index * 50);
    });

    // Step 3: After collecting, shuffle and spread back
    setTimeout(() => {
        const pairsNeeded = cards.length / 2;
        const activeSkinData = skins.find(skin => skin.id === activeSkin);

        if (levelSize === 2 || levelSize === 3) {
            // For 2x2 and 3x3, select new random images from skin
            const shuffledImages = [...activeSkinData.images];
            shuffleArray(shuffledImages);
            const selectedAnimals = shuffledImages.slice(0, pairsNeeded);
            const cardData = [...selectedAnimals, ...selectedAnimals]; // Duplikat untuk pair
            shuffleArray(cardData); // Shuffle posisi

            cards.forEach((card, index) => {
                card.dataset.animal = cardData[index];
                const img = card.querySelector('img');
                img.src = cardData[index];
                img.alt = cardData[index].replace('.jpeg', '');
                // Apply special styling for ira1 and sri2
                if (cardData[index].includes('ira1.jpeg') || cardData[index].includes('sri2.jpeg')) {
                    img.style.width = '120%';
                    img.style.height = '120%';
                    img.style.objectFit = 'cover';
                } else {
                    img.style.width = '';
                    img.style.height = '';
                    img.style.objectFit = '';
                }
            });
        } else {
            // For other levels, just shuffle positions
            const cardData = cards.map(card => card.dataset.animal);
            shuffleArray(cardData);
            cards.forEach((card, index) => {
                card.dataset.animal = cardData[index];
                const img = card.querySelector('img');
                img.src = cardData[index];
                img.alt = cardData[index].replace('.jpeg', '');
            });
        }

        // Spread cards back to grid positions
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translate(0, 0) scale(1)';
            }, index * 50);
        });

        // Reset matched pairs, moves, and timer for next round, then resume timer
        setTimeout(() => {
            matchedPairs = 0;
            moves = 0;
            timer = 0;
            updateDisplay();
            // Resume the timer after shuffle completes
            timerInterval = setInterval(() => {
                timer++;
                timerEl.textContent = `${formatTime(timer)} / ${formatTime(timeLimit)}`;
                if (timer >= timeLimit && !gameOver) {
                    gameOver = true;
                    playSound('gameOver'); // Play game over sound
                    showCustomNotification('Game Over', 'Waktu habis!\n COBALAH LAGI');
                    clearInterval(timerInterval);
                    setTimeout(() => {
                        resetGame();
                        showStartScreen();
                    }, 3000); // Delay to show notification before returning to start screen
                }
                updateDisplay(); // Update skor real-time dengan timer
            }, 1000);
        }, cards.length * 50 + 500);
    }, cards.length * 50 + 1000);
}



// Screen navigation functions
function showStartScreen() {
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'none';
    leaderboardScreen.style.display = 'none';
}

function showGameScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'none';
    leaderboardScreen.style.display = 'none';
}

function showShopScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'block';
    skinsScreen.style.display = 'none';
    leaderboardScreen.style.display = 'none';
}

function showSkinsScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'block';
    leaderboardScreen.style.display = 'none';
}

function showLeaderboardScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'none';
    leaderboardScreen.style.display = 'block';
}

// Event listeners for navigation
mulaiBtn.addEventListener('click', () => {
    playSound('click');
    const playerName = startPlayerNameEl.value.trim();
    const selectedLevel = startLevelEl.value;
    if (!selectedLevel) {
        showCustomNotification('Kesulitan Diperlukan', 'Pilih tingkat kesulitan terlebih dahulu!');
        return;
    }
    if (!playerName) {
        showCustomNotification('Nama Diperlukan', 'Masukkan nama pemain terlebih dahulu!');
        return;
    }
    playerNameEl.value = playerName; // Copy name to game screen
    // Set level based on start screen selection
    levelSelect.value = selectedLevel;
    if (selectedLevel === 'easy') levelSize = 2;
    else if (selectedLevel === 'medium') levelSize = 3;
    else if (selectedLevel === 'hard') levelSize = 4;
    // Skip start screen and go directly to game screen
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    startGame(); // Auto start game when entering game screen
});
shopBtn.addEventListener('click', () => {
    playSound('click');
    showShopScreen();
    updateShopCoins(); // Update shop coins when entering shop
});
skinsBtn.addEventListener('click', () => {
    playSound('click');
    showSkinsScreen();
    updateSkinsCoins(); // Update skins coins when entering skins
});

backBtn.addEventListener('click', () => {
    resetGame();
    showStartScreen();
});

// Add back button to shop screen
const shopBackBtn = document.querySelector('.shop-screen .back-btn');
if (shopBackBtn) {
    shopBackBtn.addEventListener('click', () => {
        showStartScreen();
        updateShopCoins(); // Update shop coins when returning to start screen
    });
}

// Add back button to skins screen
const skinsBackBtn = document.querySelector('.skins-screen .back-btn');
if (skinsBackBtn) {
    skinsBackBtn.addEventListener('click', () => {
        showStartScreen();
        updateSkinsCoins(); // Update skins coins when returning to start screen
    });
}

// Add back button to leaderboard screen
const leaderboardBackBtn = document.querySelector('.leaderboard-screen .back-btn');
if (leaderboardBackBtn) {
    leaderboardBackBtn.addEventListener('click', () => {
        showStartScreen();
    });
}

// Load leaderboard when entering leaderboard screen
leaderboardBtn.addEventListener('click', () => {
    playSound('click');
    showLeaderboardScreen();
    loadLeaderboard();
});

// Fungsi load leaderboard lokal dengan opsi sync Firebase
function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (!leaderboardContainer) return;

    leaderboardContainer.innerHTML = '<div class="leaderboard-entry loading"><div class="rank">Memuat leaderboard...</div></div>';

    // Load from local storage first
    const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');

    // Sort by score descending
    localScores.sort((a, b) => b.score - a.score);

    // Display local leaderboard
    displayLeaderboard(localScores.slice(0, 10));

    // Try to sync with Firebase if available
    if (window.db && window.collection && window.onSnapshot) {
        try {
            const leaderboardRef = window.collection(window.db, 'leaderboard');

            // Set up real-time listener for Firebase
            window.onSnapshot(leaderboardRef, (querySnapshot) => {
                const firebaseScores = [];
                querySnapshot.forEach((doc) => {
                    const playerName = doc.id;
                    const data = doc.data();
                    const scores = data.scores || [];
                    scores.forEach(scoreData => {
                        firebaseScores.push({
                            name: playerName,
                            score: scoreData.score || 0,
                            level: scoreData.level || 'unknown',
                            timestamp: scoreData.timestamp ? new Date(scoreData.timestamp.seconds * 1000) : new Date(),
                            source: 'firebase'
                        });
                    });
                });

                // Merge local and Firebase scores, remove duplicates by name (keep highest score)
                const mergedScores = [...localScores, ...firebaseScores];
                const uniqueScores = mergedScores.reduce((acc, current) => {
                    const existing = acc.find(item => item.name === current.name);
                    if (!existing || current.score > existing.score) {
                        acc = acc.filter(item => item.name !== current.name);
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // Sort and display merged leaderboard
                uniqueScores.sort((a, b) => b.score - a.score);
                displayLeaderboard(uniqueScores.slice(0, 10));

                // Save merged data to local storage
                localStorage.setItem('localLeaderboard', JSON.stringify(uniqueScores));
            }, (error) => {
                console.warn('Firebase sync failed, using local leaderboard:', error);
                // Continue with local leaderboard
            });
        } catch (error) {
            console.warn('Firebase not properly initialized, using local leaderboard:', error);
            // Continue with local leaderboard
        }
    }
}

// Fungsi display leaderboard
function displayLeaderboard(scores) {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (!leaderboardContainer) return;

    leaderboardContainer.innerHTML = '';

    if (scores.length === 0) {
        leaderboardContainer.innerHTML = '<div class="leaderboard-entry empty"><div class="rank">Belum ada skor yang tercatat.</div></div>';
        return;
    }

    scores.forEach((score, index) => {
        const entry = document.createElement('div');
        entry.classList.add('leaderboard-entry');
        if (index < 3) {
            entry.classList.add(['gold', 'silver', 'bronze'][index]);
        }

        const dateStr = score.timestamp instanceof Date ?
            score.timestamp.toLocaleDateString() :
            new Date(score.timestamp).toLocaleDateString();

        entry.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="name">${score.name}</div>
            <div class="score">${score.score}</div>
            <div class="level">${score.level}</div>
            <div class="date">${dateStr}</div>
        `;
        leaderboardContainer.appendChild(entry);
    });
}

// Fungsi save score ke leaderboard
function saveScoreToLeaderboard(name, score, level) {
    console.log('Attempting to save score:', { name, score, level });

    if (!name || !name.trim()) {
        name = 'Anonymous';
        console.log('Name was empty, using Anonymous');
    }

    const playerName = name.trim();
    const newScore = {
        score: score,
        level: level,
        timestamp: new Date()
    };

    console.log('New score object:', newScore);

    // Save to local storage
    const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
    console.log('Current local scores count:', localScores.length);

    // Add new score with player name
    const localScoreWithName = { ...newScore, name: playerName };
    localScores.push(localScoreWithName);
    console.log('New score saved locally');

    // Keep only top 50 scores to prevent storage bloat
    localScores.sort((a, b) => b.score - a.score);
    const topScores = localScores.slice(0, 50);
    localStorage.setItem('localLeaderboard', JSON.stringify(topScores));
    console.log('Local leaderboard updated, top scores count:', topScores.length);

    // Try to sync with Firebase if available
    console.log('Checking Firebase availability...');
    console.log('window.db exists:', !!window.db);
    console.log('window.doc exists:', !!window.doc);
    console.log('window.getDoc exists:', !!window.getDoc);
    console.log('window.setDoc exists:', !!window.setDoc);

    if (window.db && window.doc && window.getDoc && window.setDoc) {
        console.log('Firebase functions available, attempting sync...');
        try {
            const playerDocRef = window.doc(window.db, 'leaderboard', playerName);
            console.log('Created player docRef for:', playerName);

            window.getDoc(playerDocRef).then((docSnap) => {
                console.log('getDoc result - exists:', docSnap.exists);
                let scores = [];
                if (docSnap.exists) {
                    scores = docSnap.data().scores || [];
                    console.log('Existing scores for player:', scores.length);
                } else {
                    console.log('No existing document for player, creating new');
                }

                // Add new score to array
                scores.push(newScore);
                console.log('Updated scores array length:', scores.length);

                // Save back to Firebase
                return window.setDoc(playerDocRef, { scores: scores });
            }).then(() => {
                console.log('Score synced with Firebase successfully for player:', playerName);
            }).catch((error) => {
                console.error('Firebase sync failed:', error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    stack: error.stack
                });
            });
        } catch (error) {
            console.error('Firebase setup error:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
        }
    } else {
        console.warn('Firebase not available, skipping sync');
    }
}

// Fungsi animasi koin
function animateCoin(card) {
    const coinImg = document.createElement('img');
    coinImg.src = 'coin.png';
    coinImg.classList.add('coin-animation');
    coinImg.style.position = 'absolute';
    coinImg.style.width = '30px';
    coinImg.style.height = '30px';
    coinImg.style.left = `${card.offsetLeft + card.offsetWidth / 2 - 15}px`;
    coinImg.style.top = `${card.offsetTop + card.offsetHeight / 2 - 15}px`;
    coinImg.style.zIndex = '1000';
    coinImg.style.pointerEvents = 'none';
    document.body.appendChild(coinImg);

    // Animasi ke arah koin total
    const coinsEl = document.getElementById('coins');
    const targetX = coinsEl.offsetLeft + coinsEl.offsetWidth / 2 - 15;
    const targetY = coinsEl.offsetTop + coinsEl.offsetHeight / 2 - 15;

    coinImg.style.transition = 'all 1s ease-in-out';
    setTimeout(() => {
        coinImg.style.left = `${targetX}px`;
        coinImg.style.top = `${targetY}px`;
        coinImg.style.opacity = '0';
        coinImg.style.transform = 'scale(0.5)';
    }, 10);

    // Hapus elemen setelah animasi
    setTimeout(() => {
        document.body.removeChild(coinImg);
    }, 1000);
}

// Fungsi animasi koin di dalam kartu
function animateCoinInCard(card) {
    const img = card.querySelector('img');
    if (!img) return;

    // Buat beberapa koin untuk animasi yang lebih menarik
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const coinImg = document.createElement('img');
            coinImg.src = 'coin.png';
            coinImg.classList.add('coin-in-card');
            coinImg.style.position = 'absolute';
            coinImg.style.width = '17px';
            coinImg.style.height = '17px';
            // Posisi di dalam gambar kartu
            const imgRect = img.getBoundingClientRect();
            const offsetX = (Math.random() - 0.5) * 20; // Random offset
            const offsetY = (Math.random() - 0.5) * 20;
            coinImg.style.left = `${imgRect.left + imgRect.width / 2 - 7.5 + offsetX}px`;
            coinImg.style.top = `${imgRect.top + imgRect.height / 2 - 7.5 + offsetY}px`;
            coinImg.style.zIndex = '1000';
            coinImg.style.pointerEvents = 'none';
            document.body.appendChild(coinImg);

            // Animasi ke arah koin total
            const coinsEl = document.getElementById('coins');
            const coinsRect = coinsEl.getBoundingClientRect();
            const targetX = coinsRect.left + coinsRect.width / 2 - 7.5;
            const targetY = coinsRect.top + coinsRect.height / 2 - 7.5;

            coinImg.style.transition = 'all 1.2s ease-in-out';
            setTimeout(() => {
                coinImg.style.left = `${targetX}px`;
                coinImg.style.top = `${targetY}px`;
                coinImg.style.opacity = '0';
                coinImg.style.transform = 'scale(0.3)';
            }, 10);

            // Hapus elemen setelah animasi
            setTimeout(() => {
                if (document.body.contains(coinImg)) {
                    document.body.removeChild(coinImg);
                }
            }, 1200);
        }, i * 200); // Delay antar koin
    }
}

// Fungsi update shop coins display
function updateShopCoins() {
    const shopCoinsEl = document.getElementById('shopCoins');
    if (shopCoinsEl) {
        shopCoinsEl.textContent = totalCoins;
    }
}

// Fungsi update skins coins display
function updateSkinsCoins() {
    const skinsCoinsEl = document.getElementById('skinsCoins');
    if (skinsCoinsEl) {
        skinsCoinsEl.textContent = totalCoins;
    }
}



// Fungsi beli skin
function buySkin(skinId) {
    const skin = skins.find(s => s.id === skinId);
    if (!skin) return;

    if (ownedSkins.includes(skinId)) {
        // If already owned, set as active
        activeSkin = skinId;
        localStorage.setItem('activeSkin', activeSkin);
        showCustomNotification(`${skin.name} Skin Diaktifkan!`, 'Kartu telah berhasil diaktifkan.');
        renderSkins();
        renderShop(); // Update shop display
    } else if (totalCoins >= skin.cost) {
        totalCoins -= skin.cost;
        localStorage.setItem('totalCoins', totalCoins);
        ownedSkins.push(skinId);
        localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
        activeSkin = skinId;
        localStorage.setItem('activeSkin', activeSkin);
        updateDisplay();
        updateSkinsCoins();
        showCustomNotification(`${skin.name} Skin Dibeli!`, 'Kartu telah berhasil dibeli dan diaktifkan.');
        renderSkins();
        renderShop(); // Update shop display after purchase
    } else {
        showCustomNotification('Koin Tidak Cukup', 'Anda tidak memiliki cukup koin untuk membeli skin ini!');
    }
}

// Fungsi show custom notification
function showCustomNotification(title, message) {
    playSound('notification'); // Play notification sound when showing notification
    const notification = document.getElementById('customNotification');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    const closeBtn = document.getElementById('closeNotification');

    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.style.whiteSpace = 'pre-line'; // Preserve newlines

    notification.classList.add('show');

    closeBtn.onclick = () => {
        notification.classList.remove('show');
    };

    // Auto close after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Fungsi render skins
function renderSkins() {
    const skinsGrid = document.getElementById('skinsGrid');
    if (!skinsGrid) return;

    skinsGrid.innerHTML = '';

    // Filter hanya skins yang sudah owned
    const ownedSkinsData = skins.filter(skin => ownedSkins.includes(skin.id));

    ownedSkinsData.forEach(skin => {
        const skinItem = document.createElement('div');
        skinItem.classList.add('skin-item');
        if (activeSkin === skin.id) {
            skinItem.classList.add('active');
        }

        skinItem.innerHTML = `
            <img src="${skin.images[0]}" alt="${skin.name}" class="skin-preview">
            <h3>${skin.name}</h3>
            <p>${skin.cost} coins</p>
            <button class="btn ${ownedSkins.includes(skin.id) ? 'active-btn' : ''}" onclick="buySkin('${skin.id}')">
                ${ownedSkins.includes(skin.id) ? (activeSkin === skin.id ? 'Aktif' : 'Aktifkan') : 'Beli'}
            </button>
        `;

        skinsGrid.appendChild(skinItem);
    });
}

// Fungsi render shop
function renderShop() {
    const shopItemsEl = document.getElementById('shopItems');
    if (!shopItemsEl) return;

    shopItemsEl.innerHTML = '';

    skins.forEach(skin => {
        if (skin.cost > 0) { // Only show skins that cost coins
            const shopItem = document.createElement('div');
            shopItem.classList.add('shop-item');

            shopItem.innerHTML = `
                <img src="${skin.images[0]}" alt="${skin.name}" class="skin-preview">
                <h3>${skin.name} Skin Pack</h3>
                <p>${skin.cost} coins</p>
                <button class="btn" onclick="buySkin('${skin.id}')">
                    ${ownedSkins.includes(skin.id) ? 'Owned' : 'Buy'}
                </button>
            `;

            shopItemsEl.appendChild(shopItem);
        }
    });
}

// Fungsi efek percikan saat flip kartu
function createSparkles(card) {
    const numSparkles = 8; // Jumlah percikan
    const cardRect = card.getBoundingClientRect();

    for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'radial-gradient(circle, #ffdd44, #ffaa00, #ff6600)';
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = '0 0 6px #ffaa00';
        sparkle.style.zIndex = '1000';
        sparkle.style.pointerEvents = 'none';

        // Posisi awal di sekitar tepi kartu (di luar kartu)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let startX, startY;
        if (side === 0) { // Top
            startX = cardRect.left + Math.random() * cardRect.width;
            startY = cardRect.top - 5;
        } else if (side === 1) { // Right
            startX = cardRect.right + 5;
            startY = cardRect.top + Math.random() * cardRect.height;
        } else if (side === 2) { // Bottom
            startX = cardRect.left + Math.random() * cardRect.width;
            startY = cardRect.bottom + 5;
        } else { // Left
            startX = cardRect.left - 5;
            startY = cardRect.top + Math.random() * cardRect.height;
        }
        sparkle.style.left = `${startX}px`;
        sparkle.style.top = `${startY}px`;

        document.body.appendChild(sparkle);

        // Animasi percikan ke luar
        const angle = Math.random() * 2 * Math.PI; // Sudut acak
        const distance = 50 + Math.random() * 30; // Jarak acak
        const endX = startX + Math.cos(angle) * distance;
        const endY = startY + Math.sin(angle) * distance;

        sparkle.style.transition = 'all 0.8s ease-out';
        setTimeout(() => {
            sparkle.style.left = `${endX}px`;
            sparkle.style.top = `${endY}px`;
            sparkle.style.opacity = '0';
            sparkle.style.transform = 'scale(0.5)';
        }, 10);

        // Hapus elemen setelah animasi
        setTimeout(() => {
            if (document.body.contains(sparkle)) {
                document.body.removeChild(sparkle);
            }
        }, 800);
    }
}

// Initialize skins and shop on page load
document.addEventListener('DOMContentLoaded', () => {
    renderSkins();
    renderShop();

    // Initialize audio context on first user interaction
    const initAudio = async () => {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
        // Start background music after audio context is initialized
        playBackgroundMusic();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    // Start entrance animation
    setTimeout(() => {
        document.querySelector('.meteor').style.animation = 'meteorFallExplosion 3s ease-in-out forwards';
        setTimeout(() => {
            document.querySelector('.meteor').style.display = 'none';
            // Show credits notification when meteor explodes
            showCustomNotification('Anggota Kelompok', 'WEB INI DIBUAT OLEH:\n1. Cahyo Sigit Gurnito 11\n2. Muhammad Arif Kurniawan 25');
            // Fade in start screen after credits disappear (5 seconds)
            setTimeout(() => {
                document.querySelector('.start-screen').style.opacity = '1';
            }, 5000);
        }, 3000);
    }, 500); // Delay before starting animation
});
