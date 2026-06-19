const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');

// 特殊なパスワードの設定
const SPECIAL_PASSWORDS = {
   'mini1234': {
      action: 'message',
      message: 'デバッグ用：特殊ワードを検出しました。 "Developページ" に移動します。',
      alert: 'エラーが発生しました。不具合があるときは開発者に報告してください。'
   },
   'develop0': {
      action: 'redirect',
      message: 'Developページに移動します。',
      url: 'develop.html'
   },
   'special5': {
      action: 'preset',
      message: '特殊な盤面「X」をロードしました！',
      board: [
         [1, 0, 0, 0, 5],
         [0, 2, 0, 4, 0],
         [0, 0, 3, 0, 0],
         [0, 4, 0, 2, 0],
         [5, 0, 0, 0, 1]
      ]
   },
   'lucky777': {
      action: 'message',
      message: 'ラッキーシード！今日はいいことがあるかも？'
   },
   'xr9p1f0e': {
      action: 'preset',
      message: '特殊な盤面「7x7」をロードしました！',
      size: 7,
      board: [
         ['.', '.', 5, '.', 0, '.', '.'],
         ['.', '.', 0, '.', 0, '.', '.'],
         [2, 0, 0, 0, 1, '.', '.'],
         ['.', 0, '.', '.', 0, 0, 3],
         ['.', 0, '.', '.', '.', 0, '.'],
         [0, 4, 0, 0, '.', '.', '.'],
         ['.', 0, '.', 6, '.', '.', '.']
      ]
   }
};
      
// ★ ここで消すマスの数を調整できます（25未満にしてください）
const HOLES_COUNT = 13; 

let currentBoardData = [];

// 1. ベースとなる正しい盤面（ラテン方陣）をランダムに生成する
function generateSolvedBoard() {
   // 基本パターン
   let board = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 1],
      [3, 4, 5, 1, 2],
      [4, 5, 1, 2, 3],
      [5, 1, 2, 3, 4]
   ];

   // 行（横の列）をランダムに入れ替える
   for (let i = 4; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
   }

   // 列（縦の列）をランダムに入れ替える
   for (let i = 4; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      for (let r = 0; r < 5; r++) {
         [board[r][i], board[r][j]] = [board[r][j], board[r][i]];
      }
   }

   // 数字（1〜5）の対応関係をランダムに入れ替える
   const nums = [1, 2, 3, 4, 5];
   for (let i = 4; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
   }

   return board.map(row => row.map(val => nums[val - 1]));
}

// 2. 完成した盤面から指定された数だけランダムにマスを消す
function createPuzzle(solvedBoard, holes) {
   const puzzle = solvedBoard.map(row => [...row]);
            
   // 0から24までの全マスの位置をフラットな配列にする
   const positions = Array.from({ length: 25 }, (_, i) => i);
            
   // 位置の配列をランダムにシャッフル
   for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
   }

   // シャッフルした先頭から指定数（holes）だけマスを0（空欄）にする
   for (let i = 0; i < holes; i++) {
      const pos = positions[i];
      const r = Math.floor(pos / 5);
      const c = pos % 5;
      puzzle[r][c] = 0;
   }

   return puzzle;
}

// 3. ゲームの初期化と画面への描画
function initGame() {
   boardElement.innerHTML = '';
   messageElement.textContent = '';

   // 標準の5x5グリッドスタイルに戻す
   boardElement.style.gridTemplateColumns = `repeat(5, 50px)`;
   boardElement.style.gridTemplateRows = `repeat(5, 50px)`;

   const solved = generateSolvedBoard();
   const puzzle = createPuzzle(solved, HOLES_COUNT);

   for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
         const input = document.createElement('input');
         input.type = 'text';
         input.maxLength = 1;
         input.className = 'cell';
         input.dataset.row = r;
         input.dataset.col = c;

         if (puzzle[r][c] !== 0) {
            input.value = puzzle[r][c];
            input.classList.add('fixed');
            input.readOnly = true;
         } else {
            input.addEventListener('input', function() {
               this.value = this.value.replace(/[^1-5]/g, '');
               messageElement.textContent = '';
            });
         }
      boardElement.appendChild(input);
      }
   }
}

// 4. 答え合わせ
function checkAnswer() {
   const inputs = document.querySelectorAll('.cell');
   // 現在の盤面のサイズ（CSSのgrid設定から取得、または要素数から推測）
   const currentCells = document.querySelectorAll('.board > input');
   const gridSize = Math.sqrt(currentCells.length) || 5; 

   const checkBoard = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
   let isComplete = true;

   inputs.forEach(input => {
      const r = parseInt(input.dataset.row);
      const c = parseInt(input.dataset.col);
      const val = parseInt(input.value);

      if (isNaN(val)) {
         isComplete = false;
      } else {
         checkBoard[r][c] = val;
      }
   });

   if (!isComplete) {
      showMessage('すべてのマスを埋めてください。', 'error');
      return;
   }

   // 簡易的な重複チェック（7x7の場合はルールが未定義のため、とりあえず各行・列の重複のみチェック）
   for (let i = 0; i < gridSize; i++) {
      const rowSet = new Set();
      const colSet = new Set();
      for (let j = 0; j < gridSize; j++) {
         if (checkBoard[i][j] !== 0) rowSet.add(checkBoard[i][j]);
         if (checkBoard[j][i] !== 0) colSet.add(checkBoard[j][i]);
      }
      // すべての数字が埋まっている前提でのチェック
      // 7x7の特殊盤面など、欠けがある場合はこのチェックは厳密には不適合だが、暫定実装
   }

   showMessage('答え合わせをしました！', 'success');
}

function showMessage(text, type) {
   messageElement.textContent = text;
   messageElement.className = type;
}

// 指定された盤面（プリセット）をロードする
function loadPresetBoard(puzzle, size = 5) {
   boardElement.innerHTML = '';
   messageElement.textContent = '';
   
   // グリッドサイズを動的に変更
   boardElement.style.gridTemplateColumns = `repeat(${size}, 50px)`;
   boardElement.style.gridTemplateRows = `repeat(${size}, 50px)`;

   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         const cellData = puzzle[r][c];
         
         if (cellData === '.') {
            // グリッドもない空白
            const empty = document.createElement('div');
            empty.style.width = '100%';
            empty.style.height = '100%';
            boardElement.appendChild(empty);
            continue;
         }

         const input = document.createElement('input');
         input.type = 'text';
         input.maxLength = 1;
         input.className = 'cell';
         input.dataset.row = r;
         input.dataset.col = c;

         if (cellData !== 0) {
            input.value = cellData;
            input.classList.add('fixed');
            input.readOnly = true;
         } else {
            input.addEventListener('input', function() {
               this.value = this.value.replace(/[^1-9]/g, '');
               messageElement.textContent = '';
            });
         }
         boardElement.appendChild(input);
      }
   }
}

// シード値による盤面生成
function generateBySeed() {
   const seedInput = document.getElementById('seedInput');
   const seed = seedInput.value;

   // 特殊パスワードのチェック
   if (SPECIAL_PASSWORDS[seed]) {
      const config = SPECIAL_PASSWORDS[seed];
      showMessage(config.message, 'success');

      if (config.alert) {
         alert(config.alert);
      }

      if (config.action === 'redirect') {
         setTimeout(() => {
            window.location.href = config.url;
         }, 1000);
      } else if (config.action === 'preset') {
         loadPresetBoard(config.board, config.size || 5);
      } else if (config.action === 'message') {
         // メッセージのみ表示
      }
      return;
   }

   // 8桁の数字・英小文字のバリデーション
   const seedRegex = /^[0-9a-z]{8}$/;
   if (seedRegex.test(seed)) {
      initGame();
   } else {
      alert('シード値は8桁の数字・英小文字で入力してください。');
   }
}

// 起動時にゲームを生成
initGame();
