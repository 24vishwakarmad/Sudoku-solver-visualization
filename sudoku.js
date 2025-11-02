const SIZE = 9;

const grid = document.getElementById('sudoku-grid');
const solveBtn = document.getElementById('solveBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const resetBtn = document.getElementById('resetBtn');

// Several example puzzles
const exampleBoards = [
  [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ],
  [
    [0, 0, 8, 0, 0, 6, 9, 5, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 2],
    [0, 2, 0, 7, 0, 0, 8, 0, 0],
    [7, 0, 0, 0, 0, 2, 3, 0, 0],
    [0, 3, 0, 1, 0, 7, 0, 2, 0],
    [0, 0, 5, 9, 0, 0, 0, 0, 6],
    [0, 0, 6, 0, 0, 5, 0, 1, 0],
    [2, 0, 0, 4, 0, 0, 0, 0, 0],
    [0, 4, 1, 6, 0, 0, 5, 0, 0]
  ],
  [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0]
  ],
  [
    [2, 0, 0, 6, 0, 8, 0, 0, 0],
    [5, 8, 0, 0, 0, 9, 7, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 0],
    [3, 7, 0, 0, 0, 0, 5, 0, 0],
    [6, 0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 8, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 9, 8, 0, 0, 0, 3, 6],
    [0, 0, 0, 3, 0, 6, 0, 0, 0]
  ]
];

function createGrid() {
  for (let i = 0; i < SIZE; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < SIZE; j++) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.pattern = '[1-9]';
      td.appendChild(input);
      tr.appendChild(td);
    }
    grid.appendChild(tr);
  }
}

function readBoard() {
  let board = [];
  for (let i = 0; i < SIZE; i++) {
    let row = [];
    for (let j = 0; j < SIZE; j++) {
      let val = grid.rows[i].cells[j].firstChild.value;
      row.push(val ? parseInt(val) : 0);
    }
    board.push(row);
  }
  return board;
}

function setCell(row, col, val, cls) {
  const cell = grid.rows[row].cells[col];
  cell.className = cls || '';
  cell.firstChild.value = val === 0 ? '' : val;
}

function loadExample() {
  // Select random example puzzle
  const exampleBoard = exampleBoards[Math.floor(Math.random() * exampleBoards.length)];

  for (let i = 0; i < exampleBoard.length; i++) {
    for (let j = 0; j < exampleBoard[i].length; j++) {
      const input = grid.rows[i].cells[j].firstChild;
      if (exampleBoard[i][j] !== 0) {
        input.value = exampleBoard[i][j];
        input.className = 'filled';  // style prefilled cells differently
      } else {
        input.value = '';
        input.className = '';
      }
    }
  }
}

function resetSudoku() {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      setCell(i, j, 0, '');
    }
  }
}

async function solveSudoku() {
  solveBtn.disabled = true;
  let board = readBoard();

  // Mark filled cells
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== 0) {
        setCell(i, j, board[i][j], 'filled');
      }
    }
  }

  try {
    let response = await fetch('/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: board })
    });
    let steps = await response.json();

    for (let step of steps) {
      const { row, col, num, action, done } = step;
      if (done) {
        alert('Sudoku solved or no solution.');
        break;
      }
      if (action === 'try') {
        setCell(row, col, num, 'trying');
      } else if (action === 'backtrack') {
        setCell(row, col, 0, '');
      }
      await new Promise(r => setTimeout(r, 100));
    }
  } catch (err) {
    alert('Error solving sudoku.');
  }

  solveBtn.disabled = false;
}

createGrid();
loadExample();

loadExampleBtn.onclick = loadExample;
resetBtn.onclick = resetSudoku;
solveBtn.onclick = solveSudoku;
