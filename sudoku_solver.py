from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

SIZE = 9

def is_valid(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def solve_sudoku(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        yield {"row": row, "col": col, "num": num, "action": "try"}
                        if next(solve_sudoku(board), None) is not None:
                            return
                        board[row][col] = 0
                        yield {"row": row, "col": col, "num": 0, "action": "backtrack"}
                return
    yield {"done": True}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    board = data.get('board', [])
    steps = []
    generator = solve_sudoku(board)
    for step in generator:
        steps.append(step)
    return jsonify(steps)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5050, debug=True)



