let solution = [];
let initialBoard = [];
let currentBoard = [];
let pieceLayout = [];
let selectedCell = null;
let currentDifficulty = 'home';

const DIFFICULTY_SETTINGS = {
    'home': { clues: 36, name: 'Home', label: 'ホーム' },
    'easy': { clues: 20, name: 'Easy', label: 'イージー' },
    'normal': { clues: 16, name: 'Normal', label: 'ノーマル' },
    'hard': { clues: 12, name: 'Hard', label: 'ハード' },
    'devil': { clues: 9, name: 'Devil', label: 'デビル' },
    'special': { clues: 7, name: 'Special', label: 'スペシャル' }
};

/**
 * Detects the difficulty from the URL hash
 */
function detectDifficulty() {
    const hash = window.location.hash.substring(1);
    return DIFFICULTY_SETTINGS[hash] ? hash : 'home';
}

// --- Logic functions ---

/**
 * Generates a complete 6x6 Jigsaw Sudoku puzzle
 */
function generateGrid(difficulty) {
    const size = 6;
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));
    
    function generatePieces() {
        const p = Array(size).fill(0).map(() => Array(size).fill(-1));
        
        function getNeighbors(r, c) {
            const neighbors = [];
            if (r > 0) neighbors.push([r - 1, c]);
            if (r < size - 1) neighbors.push([r + 1, c]);
            if (c > 0) neighbors.push([r, c - 1]);
            if (c < size - 1) neighbors.push([r, c + 1]);
            return neighbors;
        }

        for (let i = 0; i < size; i++) {
            let startR, startC;
            let found = false;
            findEmpty: for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (p[r][c] === -1) {
                        startR = r; startC = c; found = true; break findEmpty;
                    }
                }
            }
            if (!found) break;
            
            p[startR][startC] = i;
            let currentPiece = [[startR, startC]];
            
            for (let s = 1; s < size; s++) {
                let candidates = [];
                for (const [pr, pc] of currentPiece) {
                    for (const [nr, nc] of getNeighbors(pr, pc)) {
                        if (p[nr][nc] === -1 && !candidates.some(([cr, cc]) => cr === nr && cc === nc)) {
                            candidates.push([nr, nc]);
                        }
                    }
                }
                if (candidates.length === 0) return null; // Failed to form a complete piece
                const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
                p[nr][nc] = i;
                currentPiece.push([nr, nc]);
            }
        }
        return p;
    }

    let pLayout = null;
    let attempts = 0;
    while (!pLayout && attempts < 1000) {
        pLayout = generatePieces();
        attempts++;
    }
    if (!pLayout) {
        // Fallback to simple 2x3 blocks if random generation fails too many times
        pLayout = Array(size).fill(0).map((_, r) => Array(size).fill(0).map((_, c) => Math.floor(r / 2) * 2 + Math.floor(c / 3)));
    }

    function isValid(g, p, r, c, val) {
        for (let i = 0; i < size; i++) {
            if (g[r][i] === val) return false;
            if (g[i][c] === val) return false;
        }
        const pieceId = p[r][c];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (p[i][j] === pieceId && g[i][j] === val) return false;
            }
        }
        return true;
    }

    function solve(g, p, index) {
        if (index === size * size) return true;
        const r = Math.floor(index / size);
        const c = index % size;
        const nums = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
        for (const num of nums) {
            if (isValid(g, p, r, c, num)) {
                g[r][c] = num;
                if (solve(g, p, index + 1)) return true;
                g[r][c] = 0;
            }
        }
        return false;
    }

    solve(grid, pLayout, 0);

    function countSolutions(g, p, index, limit) {
        if (index === size * size) return 1;
        const r = Math.floor(index / size);
        const c = index % size;
        if (g[r][c] !== 0) return countSolutions(g, p, index + 1, limit);
        
        let count = 0;
        for (let num = 1; num <= size; num++) {
            if (isValid(g, p, r, c, num)) {
                g[r][c] = num;
                count += countSolutions(g, p, index + 1, limit);
                g[r][c] = 0;
                if (count >= limit) return count;
            }
        }
        return count;
    }

    const fullGrid = grid.map(row => [...row]);
    const puzzle = grid.map(row => [...row]);
    const positions = [];
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) positions.push([r, c]);
    positions.sort(() => Math.random() - 0.5);

    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['home'];
    const targetClues = settings.clues;
    let currentClues = size * size;

    for (const [r, c] of positions) {
        if (currentClues <= targetClues) break;
        const temp = puzzle[r][c];
        puzzle[r][c] = 0;
        // Ensure solvable and ideally unique
        if (countSolutions(puzzle, pLayout, 0, 2) === 1) {
            currentClues--;
        } else {
            puzzle[r][c] = temp;
        }
    }

    return { puzzle, solution: fullGrid, pieces: pLayout };
}

// --- UI functions ---

/**
 * Initializes the visual grid on the page
 */
function initGrid() {
    const gridEl = document.getElementById('sudoku-grid');
    gridEl.innerHTML = '';
    const size = 6;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Borders based on pieces
            const pId = pieceLayout[r][c];
            if (r === 0 || pieceLayout[r-1][c] !== pId) cell.style.borderTop = 'var(--border-thick)';
            if (r === size - 1 || pieceLayout[r+1][c] !== pId) cell.style.borderBottom = 'var(--border-thick)';
            if (c === 0 || pieceLayout[r][c-1] !== pId) cell.style.borderLeft = 'var(--border-thick)';
            if (c === size - 1 || pieceLayout[r][c+1] !== pId) cell.style.borderRight = 'var(--border-thick)';

            if (initialBoard[r][c] !== 0) {
                cell.textContent = initialBoard[r][c];
                cell.classList.add('fixed');
            } else {
                if (currentBoard[r][c] !== 0) {
                    cell.textContent = currentBoard[r][c];
                    cell.classList.add('user-input');
                }
                cell.onclick = () => selectCell(r, c);
            }
            gridEl.appendChild(cell);
        }
    }
}

/**
 * Handles cell selection
 */
function selectCell(r, c) {
    if (selectedCell) {
        const oldCell = document.querySelector(`.cell[data-row="${selectedCell.r}"][data-col="${selectedCell.c}"]`);
        if (oldCell) oldCell.classList.remove('selected');
    }
    selectedCell = { r, c };
    const newCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    newCell.classList.add('selected');
    updateMessage(`マス (${r+1}, ${c+1}) を選択中です！`);
}

/**
 * Inputs a number into the selected cell
 */
function inputNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    currentBoard[r][c] = num || 0;
    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    cell.textContent = num || '';
    if (num) cell.classList.add('user-input');
    else cell.classList.remove('user-input');
}

/**
 * Validates the current board state
 */
function checkSolution() {
    let isComplete = true;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            if (currentBoard[r][c] === 0) isComplete = false;
        }
    }

    if (!isComplete) {
        updateMessage("まだ空いているマスがあります！全部埋めてから答え合わせをしてね。");
        return;
    }

    let isCorrect = true;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            if (currentBoard[r][c] !== solution[r][c]) isCorrect = false;
        }
    }

    if (isCorrect) {
        updateMessage("正解！おめでとうございます。<br>君ならもっと難しい問題も解けるかもしれないね！");
        alert("クリア");
    } else {
        updateMessage("残念...どこか間違っているみたいです...。<br>盤面をもう一度見直してみましょう。");
    }
}

/**
 * Provides a hint (Special implementation for this task)
 */
function giveHint() {
    const hintBox = document.getElementById('hint-box');
    hintBox.value = "まだ未実装です";
    updateMessage("ヒント機能は準備中です。自力で頑張ってみましょう！");
}

/**
 * Resets the current board to the initial state
 */
function resetBoard() {
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    initGrid();
    updateMessage("盤面を最初に戻しました！頑張ってくださいね。");
}

/**
 * Generates and initializes a new puzzle
 */
function newGame() {
    const loader = document.getElementById('loading');
    loader.style.display = 'flex';
    
    setTimeout(() => {
        const data = generateGrid(currentDifficulty);
        solution = data.solution;
        initialBoard = data.puzzle;
        currentBoard = JSON.parse(JSON.stringify(initialBoard));
        pieceLayout = data.pieces;
        
        initGrid();
        loader.style.display = 'none';
        updateMessage("新しい盤面が生成されました！挑戦してみてください！");
        document.getElementById('hint-box').value = "";
    }, 10);
}

/**
 * Updates the message displayed by the assistant
 */
function updateMessage(msg) {
    document.getElementById('assistant-message').innerHTML = msg;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '6') inputNumber(parseInt(e.key));
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') inputNumber(null);
});

// Initialization on load
window.addEventListener('DOMContentLoaded', () => {
    handleDifficultyChange();

    window.addEventListener('hashchange', () => {
        handleDifficultyChange();
        newGame();
    });

    newGame();
});

function handleDifficultyChange() {
    currentDifficulty = detectDifficulty();
    
    // Update active class in sidebar
    const links = document.querySelectorAll('#difficulty-list a');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentDifficulty) {
            link.classList.add('active');
        }
    });

    // Update header title
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    document.querySelector('header h1').textContent = `オリジナルナンプレ - ${settings.label}`;
    document.title = `オリジナルナンプレ - ${settings.label}`;
}
