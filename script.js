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
    },
    {
        id: 'hewan_anomali',
        name: 'HEWAN ANOMALI',
        images: ['HEWAN ANOMALI/elang.jpeg', 'HEWAN ANOMALI/gajah.jpeg', 'HEWAN ANOMALI/hiu.jpeg', 'HEWAN ANOMALI/kuda.jpeg', 'HEWAN ANOMALI/kudalaut.jpeg', 'HEWAN ANOMALI/macan.jpeg', 'HEWAN ANOMALI/manuk.jpeg', 'HEWAN ANOMALI/singa.jpeg', 'HEWAN ANOMALI/unta.jpeg'],
        cost: 300
    },
    {
        id: 'ml',
        name: 'ML',
        images: ['ML/alu.jpeg', 'ML/badang.jpeg', 'ML/gatot.jpeg', 'ML/haya.jpeg', 'ML/ling.jpeg', 'ML/nana.jpeg', 'ML/vale.jpeg', 'ML/xavier.jpeg'],
        cost: 400
    },
    {
        id: 'spongebob',
        name: 'SPONGEBOB',
        images: ['SPONGEBOB/garry.jpeg', 'SPONGEBOB/pands.jpeg', 'SPONGEBOB/patcrik.jpeg', 'SPONGEBOB/sandy.jpeg', 'SPONGEBOB/sponbobkras.jpeg', 'SPONGEBOB/sponebob.jpeg', 'SPONGEBOB/squid.jpeg', 'SPONGEBOB/tuankrabs.jpeg'],
        cost: 500
    }
];

// Load skins from localStorage
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || ['fajri'];
let activeSkin = localStorage.getItem('activeSkin') || 'fajri';

// Items data
const items = [
    {
        id: 'hint',
        name: 'Petunjuk',
        description: 'Ungkap kartu selama 0,5 detik',
        cost: 50,
        image: 'petunjuk.jpeg'
    },
    {
        id: 'freeze',
        name: 'Bekukan Waktu',
        description: 'Jeda timer selama 2 detik',
        cost: 100,
        image: 'beku.jpeg'
    }
];

// Load items from localStorage
let ownedItems = JSON.parse(localStorage.getItem('ownedItems')) || { hint: 0, freeze: 0 };

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
let hellMismatches = 0; // Track consecutive mismatches in hell mode

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
    } else if (e.target.value === 'hell') {
        levelSize = 4;
        levelName = 'hell';
        showCustomNotification('Level Neraka Dipilih', 'Siap-siap menderita! Kartu akan kocok otomatis jika salah.');
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
    } else if (e.target.value === 'hell') {
        levelName = 'hell';
        showCustomNotification('Level Neraka Dipilih', 'Siap-siap menderita! Kartu akan kocok otomatis jika salah.');
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

    // Remove move limit for hell mode
    if (levelName === 'hell') maxMoves = 10000;

    // Set time limit berdasarkan level
    if (levelSize === 2) timeLimit = 8; // Easy: 10 seconds
    else if (levelSize === 3) timeLimit = 20; // Medium: 30 seconds
    else if (levelSize === 4) timeLimit = 120; // Hard: 2 minutes

    updateDisplay();
    updateItemButtons(); // Update item buttons when game starts
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
        // Tambah skor berdasarkan level
        if (levelName === 'hell') score += 500; // Hell: 500 poin per match
        else if (levelSize === 2) score += 25; // Easy: 25 poin per match
        else if (levelSize === 3) score += 50; // Medium: 50 poin per match
        else if (levelSize === 4) score += 150; // Hard: 150 poin per match
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

            // For hell mode, shuffle on mismatch
            if (levelName === 'hell') {
                setTimeout(() => {
                    shuffleBoard();
                }, 500); // Small delay after hiding
            }
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
    // Pause the timer during shuffle, except in hell mode
    if (levelName !== 'hell') {
        clearInterval(timerInterval);
    }

    const cards = Array.from(gameBoard.children);
    const centerX = gameBoard.offsetWidth / 2;
    const centerY = gameBoard.offsetHeight / 2;

    // Step 1: Flip all cards back
    let totalPairs;
    if (levelSize === 2) totalPairs = 2;
    else if (levelSize === 3) totalPairs = 3;
    else if (levelSize === 4) totalPairs = 8;

    if (levelName === 'hell' && matchedPairs === totalPairs) {
        // Completion shuffle in hell mode: reset all cards
        cards.forEach(card => {
            card.classList.remove('matched', 'flipped');
            const img = card.querySelector('img');
            img.style.display = 'none';
        });
    } else if (levelName === 'hell') {
        // Mismatch shuffle in hell mode: keep matched pairs visible
        cards.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.remove('flipped');
                const img = card.querySelector('img');
                img.style.display = 'none';
            }
        });
    } else {
        // Non-hell modes: reset all cards
        cards.forEach(card => {
            card.classList.remove('matched', 'flipped');
            const img = card.querySelector('img');
            img.style.display = 'none';
        });
    }

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
                    card.classList.remove('matched', 'flipped'); // Reset kartu untuk round baru
                    card.dataset.animal = cardData[index];
                    const img = card.querySelector('img');
                    img.src = cardData[index];
                    img.alt = cardData[index].replace('.jpeg', '');
                    img.style.display = 'none'; // Sembunyikan gambar
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
        } else if (levelName === 'hell') {
            if (matchedPairs === totalPairs) {
                // Completion shuffle: shuffle all images like small levels
                const pairsNeeded = cards.length / 2;
                const activeSkinData = skins.find(skin => skin.id === activeSkin);
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
                // Mismatch shuffle: shuffle only unmatched cards' images, keep matched unchanged
                const unmatchedCards = cards.filter(card => !card.classList.contains('matched'));
                const unmatchedImages = unmatchedCards.map(card => card.dataset.animal);
                shuffleArray(unmatchedImages);
                unmatchedCards.forEach((card, index) => {
                    card.dataset.animal = unmatchedImages[index];
                    const img = card.querySelector('img');
                    img.src = unmatchedImages[index];
                    img.alt = unmatchedImages[index].replace('.jpeg', '');
                });
                // Matched cards keep their images unchanged
            }
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
            matchedPairs = 0; // Always reset matched pairs for continuous shuffling in hell mode
            moves = 0;
            if (levelName !== 'hell') {
                timer = 0;
            }
            updateDisplay();
            // Resume the timer after shuffle completes (only for non-hell modes)
            if (levelName !== 'hell') {
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
            }
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
    updateItemButtons(); // Update item buttons when showing game screen
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
    else if (selectedLevel === 'hell') levelSize = 4;
    // Skip start screen and go directly to game screen
    showGameScreen();
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

// Current leaderboard filter
let currentLeaderboardFilter = 'all';

// Fungsi filter leaderboard
function filterLeaderboard(filter) {
    currentLeaderboardFilter = filter;
    loadLeaderboard();
}

// Event listeners untuk filter buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            playSound('click');
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            // Filter leaderboard
            const filter = e.target.dataset.filter;
            filterLeaderboard(filter);
        });
    });
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

    // Filter scores based on current filter
    const filteredLocalScores = currentLeaderboardFilter === 'all' ? localScores : localScores.filter(score => score.level === currentLeaderboardFilter);

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
                        const score = scoreData.score || 0;
                        // Only include scores greater than 0
                        if (score > 0) {
                            let timestamp;
                            if (scoreData.timestamp && typeof scoreData.timestamp.toDate === 'function') {
                                // Firestore Timestamp
                                timestamp = scoreData.timestamp.toDate();
                            } else if (scoreData.timestamp instanceof Date) {
                                timestamp = scoreData.timestamp;
                            } else if (typeof scoreData.timestamp === 'string') {
                                timestamp = new Date(scoreData.timestamp);
                            } else {
                                timestamp = new Date();
                            }
                            firebaseScores.push({
                                name: playerName,
                                score: score,
                                level: scoreData.level || 'unknown',
                                timestamp: timestamp,
                                source: 'firebase'
                            });
                        }
                    });
                });

                let finalScores;
                if (firebaseScores.length > 0) {
                    // Use Firebase data if available (prioritize Firebase for admin edits)
                    finalScores = firebaseScores;
                } else {
                    // If Firebase is empty (e.g., after reset), clear local storage and use empty list
                    finalScores = [];
                    localStorage.setItem('localLeaderboard', JSON.stringify([]));
                }

                // Sort by score descending (highest first)
                finalScores.sort((a, b) => b.score - a.score);

                // Filter scores based on current filter
                const filteredFinalScores = currentLeaderboardFilter === 'all' ? finalScores : finalScores.filter(score => score.level === currentLeaderboardFilter);

                displayLeaderboard(filteredFinalScores.slice(0, 10));

                // Save final data to local storage (only if Firebase has data)
                if (firebaseScores.length > 0) {
                    localStorage.setItem('localLeaderboard', JSON.stringify(finalScores));
                }
            }, (error) => {
                console.warn('Firebase sync failed, using local leaderboard:', error);
                showCustomNotification('Sync Error', 'Failed to sync with online leaderboard. Using local data.');
                // Fall back to local leaderboard
                displayLeaderboard(filteredLocalScores.slice(0, 10));
            });
        } catch (error) {
            console.warn('Firebase not properly initialized, using local leaderboard:', error);
            // Fall back to local leaderboard
            displayLeaderboard(filteredLocalScores.slice(0, 10));
        }
    } else {
        // No Firebase, use local leaderboard
        displayLeaderboard(filteredLocalScores.slice(0, 10));
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

    // Sort all scores by score descending
    scores.sort((a, b) => b.score - a.score);

    scores.slice(0, 10).forEach((score, index) => {
        const entry = document.createElement('div');
        entry.classList.add('leaderboard-entry');
        if (index < 3) {
            entry.classList.add(['gold', 'silver', 'bronze'][index]);
        }

        let dateStr;
        try {
            let date;
            if (score.timestamp && typeof score.timestamp.toDate === 'function') {
                // Firestore Timestamp
                date = score.timestamp.toDate();
            } else if (score.timestamp instanceof Date) {
                date = score.timestamp;
            } else if (typeof score.timestamp === 'string') {
                date = new Date(score.timestamp);
            } else if (typeof score.timestamp === 'number') {
                date = new Date(score.timestamp);
            } else {
                date = null;
            }
            if (date && !isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                dateStr = `${day}/${month}/${year}`;
            } else {
                dateStr = 'N/A';
            }
        } catch (e) {
            dateStr = 'N/A';
        }

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
        timestamp: new Date().toISOString()
    };

    console.log('New score object:', newScore);

    // Save to local storage - keep all scores
    const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
    console.log('Current local scores count:', localScores.length);

    const localScoreWithName = { ...newScore, name: playerName };

    // Always add new score
    localScores.push(localScoreWithName);
    console.log('New score saved locally for player:', playerName);

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

                // Find the highest score for this player
                const currentMaxScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;

                if (newScore.score > currentMaxScore) {
                    // Update to only keep the new highest score
                    scores = [newScore];
                    console.log('Updated to new highest score for player:', playerName);

                    // Save back to Firebase
                    return window.setDoc(playerDocRef, { scores: scores });
                } else {
                    console.log('New score not higher than existing max, skipping Firebase update for player:', playerName);
                    return Promise.resolve(); // No update needed
                }
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
        // If already owned, activate the skin
        activeSkin = skinId;
        localStorage.setItem('activeSkin', activeSkin);
        updateDisplay();
        updateShopCoins();
        updateSkinsCoins();
        showCustomNotification(`${skin.name} Diaktifkan!`, 'Skin telah berhasil diaktifkan.');
        renderSkins(); // Update skins display after activation
        renderShop(); // Update shop display after activation
    } else if (totalCoins >= skin.cost) {
        totalCoins -= skin.cost;
        localStorage.setItem('totalCoins', totalCoins);
        ownedSkins.push(skinId);
        localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
        // Auto activate after purchase
        activeSkin = skinId;
        localStorage.setItem('activeSkin', activeSkin);
        updateDisplay();
        updateShopCoins();
        updateSkinsCoins();
        showCustomNotification(`${skin.name} Dibeli!`, 'Skin telah berhasil dibeli dan diaktifkan.');
        renderSkins(); // Update skins display after purchase
        renderShop(); // Update shop display after purchase
    } else {
        showCustomNotification('Koin Tidak Cukup', 'Anda tidak memiliki cukup koin untuk membeli skin ini!');
    }
}

// Fungsi beli item
function buyItem(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (totalCoins >= item.cost) {
        totalCoins -= item.cost;
        localStorage.setItem('totalCoins', totalCoins);
        ownedItems[itemId] = (ownedItems[itemId] || 0) + 1;
        localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
        updateDisplay();
        updateShopCoins();
        updateSkinsCoins();
        showCustomNotification(`${item.name} Dibeli!`, `Item telah berhasil dibeli. Sekarang Anda memiliki ${ownedItems[itemId]} ${item.name}.`);
        renderShop(); // Update shop display after purchase
    } else {
        showCustomNotification('Koin Tidak Cukup', 'Anda tidak memiliki cukup koin untuk membeli item ini!');
    }
}

// Fungsi update item buttons di game screen
function updateItemButtons() {
    const hintBtn = document.getElementById('hintBtn');
    const freezeBtn = document.getElementById('freezeBtn');

    const hintCount = ownedItems['hint'] || 0;
    const freezeCount = ownedItems['freeze'] || 0;

    hintBtn.textContent = `💡 Petunjuk (${hintCount})`;
    freezeBtn.textContent = `❄️ Bekukan (${freezeCount})`;

    hintBtn.disabled = hintCount <= 0 || !gameStarted || gameOver;
    freezeBtn.disabled = freezeCount <= 0 || !gameStarted || gameOver;
}

// Add event listeners for item buttons
document.addEventListener('DOMContentLoaded', () => {
    const hintBtn = document.getElementById('hintBtn');
    const freezeBtn = document.getElementById('freezeBtn');

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            console.log('Hint button clicked');
            playSound('click');
            useItem('hint');
        });
    }

    if (freezeBtn) {
        freezeBtn.addEventListener('click', () => {
            console.log('Freeze button clicked');
            playSound('click');
            useItem('freeze');
        });
    }
});

// Fungsi gunakan item
function useItem(itemId) {
    if ((ownedItems[itemId] || 0) <= 0 || !gameStarted || gameOver) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (itemId === 'hint') {
        // Reveal all cards for 3 seconds
        const cards = Array.from(gameBoard.children);
        cards.forEach(card => {
            if (!card.classList.contains('matched')) {
                const img = card.querySelector('img');
                img.style.display = 'block';
                card.classList.add('revealed');
            }
        });
        setTimeout(() => {
            cards.forEach(card => {
                if (card.classList.contains('revealed') && !card.classList.contains('matched')) {
                    const img = card.querySelector('img');
                    img.style.display = 'none';
                    card.classList.remove('revealed');
                }
            });
        }, 500);
        ownedItems[itemId]--;
        localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
        const remaining = ownedItems[itemId];
    } else if (itemId === 'freeze') {
        // Freeze timer for 10 seconds
        clearInterval(timerInterval);
        ownedItems[itemId]--;
        localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
        const remaining = ownedItems[itemId];
        setTimeout(() => {
            if (gameStarted && !gameOver) {
                timerInterval = setInterval(() => {
                    timer++;
                    timerEl.textContent = `${formatTime(timer)} / ${formatTime(timeLimit)}`;
                    if (timer >= timeLimit && !gameOver) {
                        gameOver = true;
                        playSound('gameOver');
                        showCustomNotification('Game Over', 'Waktu habis!\n COBALAH LAGI');
                        clearInterval(timerInterval);
                        setTimeout(() => {
                            resetGame();
                            showStartScreen();
                        }, 3000);
                    }
                    updateDisplay();
                }, 1000);
            }
        }, 2000);
    }

    updateItemButtons();
    renderShop();
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

    // Get current active tab
    const activeTab = document.querySelector('.shop-tabs .tab-btn.active');
    const tabType = activeTab ? activeTab.dataset.tab : 'skins';

    if (tabType === 'skins') {
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
    } else if (tabType === 'items') {
        items.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.classList.add('shop-item');

            const quantity = ownedItems[item.id] || 0;

            shopItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-preview">
                <h3>${item.name}${quantity > 0 ? ` x${quantity}` : ''}</h3>
                <p>${item.description}</p>
                <p>${item.cost} coins</p>
                <button class="btn" onclick="buyItem('${item.id}')">
                    ${quantity > 0 ? `Owned x${quantity}` : 'Buy'}
                </button>
            `;

            shopItemsEl.appendChild(shopItem);
        });
    }
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

    // Add event listeners for shop tabs
    const shopTabButtons = document.querySelectorAll('.shop-tabs .tab-btn');
    shopTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound('click');
            // Remove active class from all buttons
            shopTabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Re-render shop
            renderShop();
        });
    });

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

    // Stop background music when page is unloaded (user closes tab or navigates away)
    window.addEventListener('beforeunload', () => {
        stopBackgroundMusic();
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(console.error);
        }
    });

    // Stop background music when tab becomes hidden (user switches tabs or minimizes)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopBackgroundMusic();
        }
    });

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
