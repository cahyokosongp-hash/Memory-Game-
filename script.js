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
    }
];

// Load skins from localStorage
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || ['fajri'];
let activeSkin = localStorage.getItem('activeSkin') || 'fajri';

let board = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let score = 1000; // Skor dasar, bertambah 100 per match
let totalCoins = 0; // Total koin yang diperoleh
let timerInterval;
let gameStarted = false;
let levelSize = 3; // Default sedang (3x2 = 3 pairs)

// Element references
const gameBoard = document.getElementById('gameBoard');
const levelSelect = document.getElementById('level');
const playerNameEl = document.getElementById('playerName');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const coinsEl = document.getElementById('coins');
const starsEl = document.getElementById('stars');
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
const skinsBtn = document.getElementById('skinsBtn');

levelSelect.addEventListener('change', (e) => {
    if (gameStarted) return; // Jangan ganti level saat main
    if (e.target.value === 'easy') {
        levelSize = 2;
        showCustomNotification('Level Mudah Dipilih', 'hah yakin nih 2x2?? ezz bgtt');
    } else if (e.target.value === 'medium') {
        levelSize = 3;
        showCustomNotification('Level Sedang Dipilih', 'halah nanggung banget mending sulit');
    } else if (e.target.value === 'hard') {
        levelSize = 4;
        showCustomNotification('Level Sulit Dipilih', 'nah gitu dong baru mantap');
    }
});

startLevelEl.addEventListener('change', (e) => {
    if (e.target.value === 'easy') {
        showCustomNotification('Level Mudah Dipilih', 'hah yakin nih 2x2?? ezz bgtt');
    } else if (e.target.value === 'medium') {
        showCustomNotification('Level Sedang Dipilih', 'halah nanggung banget mending sulit');
    } else if (e.target.value === 'hard') {
        showCustomNotification('Level Sulit Dipilih', 'nah gitu dong baru mantap');
    }
});

// Fungsi mulai game
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    moves = 0;
    timer = 0;
    matchedPairs = 0;
    score = 1000; // Reset skor dasar
    totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0; // Load total coins from localStorage
    flippedCards = [];
    updateDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerEl.textContent = formatTime(timer);
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
    score = 1000;
    flippedCards = [];
    timerEl.textContent = '00:00';
    movesEl.textContent = '0';
    starsEl.textContent = '1000';
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
        card.appendChild(img);
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Flip kartu
function flipCard(e) {
    if (flippedCards.length >= 2 || this.classList.contains('flipped') || this.classList.contains('matched') || !gameStarted) return;

    this.classList.add('flipped');
    const img = this.querySelector('img');
    img.style.display = 'block'; // Tampilkan gambar saat flip
    createSparkles(this); // Tambah efek percikan saat flip
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        checkMatch();
        updateDisplay();
    }
}

// Cek match
function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.animal === card2.dataset.animal) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++; // Tambah matched pairs
        score += 100; // Tambah skor per match
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
            setTimeout(() => {
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
    movesEl.textContent = moves;
    coinsEl.textContent = totalCoins;
    starsEl.textContent = score;
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
        // Shuffle the card data
        const cardData = cards.map(card => card.dataset.animal);
        shuffleArray(cardData);
        cards.forEach((card, index) => {
            card.dataset.animal = cardData[index];
            const img = card.querySelector('img');
            img.src = cardData[index];
            img.alt = cardData[index].replace('.jpeg', '');
        });

        // Spread cards back to grid positions
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translate(0, 0) scale(1)';
            }, index * 50);
        });

        // Reset matched pairs for next round
        setTimeout(() => {
            matchedPairs = 0;
        }, cards.length * 50 + 500);
    }, cards.length * 50 + 1000);
}



// Screen navigation functions
function showStartScreen() {
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'none';
}

function showGameScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'none';
}

function showShopScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'block';
    skinsScreen.style.display = 'none';
}

function showSkinsScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    skinsScreen.style.display = 'block';
}

// Event listeners for navigation
mulaiBtn.addEventListener('click', () => {
    const playerName = startPlayerNameEl.value.trim();
    const selectedLevel = startLevelEl.value;
    if (playerName) {
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
    } else {
        showCustomNotification('Nama Diperlukan', 'Masukkan nama pemain terlebih dahulu!');
    }
});
shopBtn.addEventListener('click', () => {
    showShopScreen();
    updateShopCoins(); // Update shop coins when entering shop
});
skinsBtn.addEventListener('click', () => {
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
    } else {
        alert('Koin tidak cukup!');
    }
}

// Fungsi show custom notification
function showCustomNotification(title, message) {
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

    skins.forEach(skin => {
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
