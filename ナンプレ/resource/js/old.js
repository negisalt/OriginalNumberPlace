const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');

// 特殊な盤面に移行するための特定のワード（後で変更可能）
const SPECIAL_WORD = 'secret99';
      
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
   const checkBoard = Array.from({ length: 5 }, () => Array(5).fill(0));
   let isComplete = true;

   inputs.forEach(input => {
      const r = parseInt(input.dataset.row);
      const c = parseInt(input.dataset.col);
      const val = parseInt(input.value);

      if (isNaN(val) || val < 1 || val > 5) {
         isComplete = false;
      } else {
         checkBoard[r][c] = val;
      }
   });

   if (!isComplete) {
      showMessage('すべてのマスに1〜5の数字を入れてください。', 'error');
      return;
   }

   // 縦横の重複チェック
   for (let i = 0; i < 5; i++) {
      const rowSet = new Set();
      const colSet = new Set();

      for (let j = 0; j < 5; j++) {
         rowSet.add(checkBoard[i][j]);
         colSet.add(checkBoard[j][i]);
      }

      if (rowSet.size !== 5 || colSet.size !== 5) {
         showMessage('残念！重複している列があります。', 'error');
         return;
      }
   }

   showMessage('正解です！お見事です！', 'success');
}

function showMessage(text, type) {
   messageElement.textContent = text;
   messageElement.className = type;
}

// シード値による盤面生成
function generateBySeed() {
   const seedInput = document.getElementById('seedInput');
   const seed = seedInput.value;

   if (seed === SPECIAL_WORD) {
      alert('特殊な盤面に移行します（実装予定）');
      // 特殊な盤面については未定のため、とりあえずログを出して終了
      console.log('Special board triggered by seed:', seed);
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