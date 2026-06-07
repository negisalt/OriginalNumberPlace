let solution = [];
let initialBoard = [];
let currentBoard = [];
let pieceLayout = [];
let selectedCell = null;
let currentDifficulty = 'tutorial';
let clearCount = parseInt(localStorage.getItem('sudoku_clear_count') || '0');

const DIFFICULTY_SETTINGS = {
    'tutorial': { clues: 11, name: 'Tutorial', label: 'チュートリアル' },
    'normal': { clues: 9, name: 'Normal', label: '普通' },
    'hard': { clues: 7, name: 'Hard', label: '難問' },
    'special': { clues: 6, name: 'Special', label: 'スペシャル' }
};

/**
 * Detects the difficulty from the current URL filename
 */
function detectDifficulty() {
    const path = window.location.pathname;
    if (path.includes('normal.html')) return 'normal';
    if (path.includes('hard.html')) return 'hard';
    if (path.includes('special.html')) return 'special';
    return 'tutorial'; // default (index.html)
}

/**
 * Updates the clear count in the UI and localStorage
 */
function updateClearCount(increment = false) {
    if (increment) {
        clearCount++;
        localStorage.setItem('sudoku_clear_count', clearCount);
    }
    const countEl = document.querySelector('.sidebar-section p');
    if (countEl) countEl.textContent = `クリア回数: ${clearCount}`;
}

// --- Logic functions ---

/**
 * Generates a complete 5x5 Jigsaw Sudoku puzzle
 */
function generateGrid(difficulty) {
    const grid = Array(5).fill(0).map(() => Array(5).fill(0));
    
    function generatePieces() {
        const p = Array(5).fill(0).map(() => Array(5).fill(-1));
        
        function getNeighbors(r, c) {
            const neighbors = [];
            if (r > 0) neighbors.push([r - 1, c]);
            if (r < 4) neighbors.push([r + 1, c]);
            if (c > 0) neighbors.push([r, c - 1]);
            if (c < 4) neighbors.push([r, c + 1]);
            return neighbors;
        }

        for (let i = 0; i < 5; i++) {
            let startR, startC;
            findEmpty: for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (p[r][c] === -1) {
                        startR = r; startC = c; break findEmpty;
                    }
                }
            }
            
            p[startR][startC] = i;
            let currentPiece = [[startR, startC]];
            
            for (let s = 1; s < 5; s++) {
                let candidates = [];
                for (const [pr, pc] of currentPiece) {
                    for (const [nr, nc] of getNeighbors(pr, pc)) {
                        if (p[nr][nc] === -1 && !candidates.some(([cr, cc]) => cr === nr && cc === nc)) {
                            candidates.push([nr, nc]);
                        }
                    }
                }
                if (candidates.length === 0) return null;
                const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
                p[nr][nc] = i;
                currentPiece.push([nr, nc]);
            }
        }
        return p;
    }

    let pLayout = null;
    while (!pLayout) pLayout = generatePieces();

    function isValid(g, p, r, c, val) {
        for (let i = 0; i < 5; i++) {
            if (g[r][i] === val) return false;
            if (g[i][c] === val) return false;
        }
        const pieceId = p[r][c];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (p[i][j] === pieceId && g[i][j] === val) return false;
            }
        }
        return true;
    }

    function solve(g, p, index) {
        if (index === 25) return true;
        const r = Math.floor(index / 5);
        const c = index % 5;
        const nums = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
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
        if (index === 25) return 1;
        const r = Math.floor(index / 5);
        const c = index % 5;
        if (g[r][c] !== 0) return countSolutions(g, p, index + 1, limit);
        
        let count = 0;
        for (let num = 1; num <= 5; num++) {
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
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) positions.push([r, c]);
    positions.sort(() => Math.random() - 0.5);

    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS['tutorial'];
    const targetClues = settings.clues;
    let currentClues = 25;

    for (const [r, c] of positions) {
        if (currentClues <= targetClues) break;
        const temp = puzzle[r][c];
        puzzle[r][c] = 0;
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
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Borders based on pieces
            const pId = pieceLayout[r][c];
            if (r === 0 || pieceLayout[r-1][c] !== pId) cell.style.borderTop = 'var(--border-thick)';
            if (r === 4 || pieceLayout[r+1][c] !== pId) cell.style.borderBottom = 'var(--border-thick)';
            if (c === 0 || pieceLayout[r][c-1] !== pId) cell.style.borderLeft = 'var(--border-thick)';
            if (c === 4 || pieceLayout[r][c+1] !== pId) cell.style.borderRight = 'var(--border-thick)';

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
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (currentBoard[r][c] === 0) isComplete = false;
        }
    }

    if (!isComplete) {
        updateMessage("まだ空いているマスがあります！全部埋めてから答え合わせをしてね。");
        return;
    }

    let isCorrect = true;
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (currentBoard[r][c] !== solution[r][c]) isCorrect = false;
        }
    }

    if (isCorrect) {
        updateMessage("正解！おめでとうございます。<br>君ならもっと難しい問題も解けるかもしれないね！");
        updateClearCount(true);
        alert("クリア");
    } else {
        updateMessage("残念...どこか間違っているみたいです...。<br>盤面をもう一度見直してみましょう。");
    }
}

/**
 * Checks which numbers are valid for a specific cell based on the current board
 */
function getValidNumbers(g, p, r, c) {
    const valid = [];
    for (let num = 1; num <= 5; num++) {
        let possible = true;
        // Check Row & Col
        for (let i = 0; i < 5; i++) {
            if (g[r][i] === num) possible = false;
            if (g[i][c] === num) possible = false;
        }
        // Check Piece
        const pieceId = p[r][c];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (p[i][j] === pieceId && g[i][j] === num) possible = false;
            }
        }
        if (possible) valid.push(num);
    }
    return valid;
}

/**
 * Provides a hint by finding a logically deducible cell
 */
function giveHint() {
    let hint = null;

    // 1. Look for "Naked Singles" (cells with only one possible number)
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (currentBoard[r][c] !== 0) continue;
            const valid = getValidNumbers(currentBoard, pieceLayout, r, c);
            if (valid.length === 1) {
                hint = { r, c, val: valid[0], type: 'naked' };
                break;
            }
        }
        if (hint) break;
    }

    // 2. Look for "Hidden Singles" (a number that can only fit in one cell within a row/col/piece)
    if (!hint) {
        // Check Rows
        for (let r = 0; r < 5; r++) {
            for (let num = 1; num <= 5; num++) {
                let count = 0, lastC = -1;
                for (let c = 0; c < 5; c++) {
                    if (currentBoard[r][c] === num) { count = -1; break; }
                    if (currentBoard[r][c] === 0 && getValidNumbers(currentBoard, pieceLayout, r, c).includes(num)) {
                        count++; lastC = c;
                    }
                }
                if (count === 1) { hint = { r, c: lastC, val: num, type: 'hidden_row' }; break; }
            }
            if (hint) break;
        }
    }

    if (!hint) {
        // Check Columns
        for (let c = 0; c < 5; c++) {
            for (let num = 1; num <= 5; num++) {
                let count = 0, lastR = -1;
                for (let r = 0; r < 5; r++) {
                    if (currentBoard[r][c] === num) { count = -1; break; }
                    if (currentBoard[r][c] === 0 && getValidNumbers(currentBoard, pieceLayout, r, c).includes(num)) {
                        count++; lastR = r;
                    }
                }
                if (count === 1) { hint = { r: lastR, c, val: num, type: 'hidden_col' }; break; }
            }
            if (hint) break;
        }
    }

    if (!hint) {
        // Check Pieces
        for (let pId = 0; pId < 5; pId++) {
            for (let num = 1; num <= 5; num++) {
                let count = 0, lastPos = null;
                for (let r = 0; r < 5; r++) {
                    for (let c = 0; c < 5; c++) {
                        if (pieceLayout[r][c] === pId) {
                            if (currentBoard[r][c] === num) { count = -1; break; }
                            if (currentBoard[r][c] === 0 && getValidNumbers(currentBoard, pieceLayout, r, c).includes(num)) {
                                count++; lastPos = { r, c };
                            }
                        }
                    }
                    if (count === -1) break;
                }
                if (count === 1) { hint = { ...lastPos, val: num, type: 'hidden_piece' }; break; }
            }
            if (hint) break;
        }
    }

    if (!hint) {
        // If no logic found (shouldn't happen on 5x5 usually), fallback to a random cell from solution
        const empties = [];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) if (currentBoard[r][c] === 0) empties.push({ r, c });
        }
        if (empties.length === 0) {
            updateMessage("もう全部のマスが埋まりました！答え合わせをしてみてください。");
            return;
        }
        const random = empties[Math.floor(Math.random() * empties.length)];
        hint = { ...random, val: solution[random.r][random.c], type: 'fallback' };
    }

    // Execution of hint
    const { r, c, val, type } = hint;
    selectCell(r, c);
    
    let msg = "";
    switch(type) {
        case 'naked':
            msg = `マス (${r+1}, ${c+1}) を見てみてください！ここには消去法で <b>${val}</b> しか入らないですよ！`;
            break;
        case 'hidden_row':
            msg = `${r+1}行目の中で、数字の <b>${val}</b> が入れるのはここ (${r+1}, ${c+1}) だけです！`;
            break;
        case 'hidden_col':
            msg = `${c+1}列目の中で、数字の <b>${val}</b> が入れるのはここ (${r+1}, ${c+1}) だけです！`;
            break;
        case 'hidden_piece':
            msg = `この太枠ブロックの中で、数字の <b>${val}</b> が入れるのはこのマスだけです！`;
            break;
        default:
            msg = `少し難しいですね...。では特別なヒントです！このマスには <b>${val}</b> が入ります！`;
    }
    
    updateMessage(msg);

    // Highlight the cell temporarily
    const cellEl = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    cellEl.style.backgroundColor = "#fff9c4";
    setTimeout(() => {
        if (!cellEl.classList.contains('selected')) {
            cellEl.style.backgroundColor = "";
        }
    }, 3000);
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
    
    // Use setTimeout to allow UI to show loader
    setTimeout(() => {
        const data = generateGrid(currentDifficulty);
        solution = data.solution;
        initialBoard = data.puzzle;
        currentBoard = JSON.parse(JSON.stringify(initialBoard));
        pieceLayout = data.pieces;
        
        initGrid();
        loader.style.display = 'none';
        updateMessage("新しい盤面が生成されました！挑戦してみてください！");
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
    if (e.key >= '1' && e.key <= '5') inputNumber(parseInt(e.key));
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') inputNumber(null);
});

// Initialization on load
window.addEventListener('DOMContentLoaded', () => {
    currentDifficulty = detectDifficulty();
    
    // Update active class in sidebar
    const links = document.querySelectorAll('#difficulty-list a');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === window.location.pathname.split('/').pop() || 
            (link.getAttribute('href') === 'index.html' && (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')))) {
            link.classList.add('active');
        }
    });

    // Update header title
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    document.querySelector('header h1').textContent = `オリジナルナンプレ - ${settings.label}`;
    document.title = `オリジナルナンプレ - ${settings.label}`;

    updateClearCount();
    newGame();

    // ARG Event: Special difficulty triggers a timer
    if (currentDifficulty === 'special') {
        setTimeout(() => {
            triggerArgEvent();
        }, 20000); // 20 seconds
    }
});

/**
 * Triggers the ARG event where a mysterious ad appears and assistant speaks directly
 */
function triggerArgEvent() {
    // Create the overlay and dialog if they don't exist
    if (!document.getElementById('arg-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'arg-overlay';
        overlay.className = 'arg-overlay';
        overlay.innerHTML = `
            <div class="arg-dialog-box">
                <div class="arg-dialog-header">アシスタントA</div>
                <div id="arg-dialog-content" class="arg-dialog-content"></div>
                <div class="arg-dialog-footer">
                    <button class="arg-dialog-button" onclick="closeArgDialog()">閉じる</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    if (!document.querySelector('.mysterious-ad')) {
        const ad = document.createElement('div');
        ad.className = 'mysterious-ad';
        document.body.appendChild(ad);
        
        setTimeout(() => {
            ad.classList.add('visible');
            showArgDialog("おかしいですね...。このサイトには広告はないはずなのですが...。");
            
            setTimeout(() => {
                showArgDialog("おかしいですね...。このサイトには広告はないはずなのですが...。<br><br>すみません、ちょっとこのサイトの様子が変みたいです。良ければ一緒に調査を手伝っていただけませんか？");
            }, 6000);
        }, 100);
    }
}

function showArgDialog(text) {
    const overlay = document.getElementById('arg-overlay');
    const content = document.getElementById('arg-dialog-content');
    content.innerHTML = text;
    overlay.classList.add('visible');
}

function closeArgDialog() {
    const overlay = document.getElementById('arg-overlay');
    overlay.classList.remove('visible');
}
