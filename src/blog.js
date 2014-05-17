/**
 * @jsx React.DOM
 */

 const pieces = [
  [[0, 0, 2, 0],
   [0, 0, 2, 0],
   [0, 0, 2, 0],
   [0, 0, 2, 0]],
  [[0, 3, 0],
   [0, 3, 3],
   [0, 0, 3]],
  [[0, 0, 4],
   [0, 4, 4],
   [0, 4, 0]],
  [[5, 5],
   [5, 5]],
  [[6, 0, 0],
   [6 ,6, 6],
   [0, 0, 0]],
  [[0, 0, 7],
   [7, 7, 7],
   [0, 0, 0]],
  [[0, 8, 0],
   [8, 8, 8],
   [0, 0, 0]]];
   
function getPiece () {
	var r = Math.floor((Math.random() * 7));
    return pieces[r];
}

function outOfBounds (bx, by) {
	return by >= 21 || by < 0 || bx < 0 || bx >= 10;
}

function mergePiece (board, piece, pos, override) {
	// return a new board with the piece merged in
	// semi-deep copy the old board
	var newBoard = [];
	for (i = 0; i < board.length; i++) {
		newBoard.push(board[i].slice(0));
	}
	//merge in the new piece, assume this is a valid state (no overlapping piece)
	for (row = 0; row < piece.length; row++) {
		for (col = 0; col < piece[0].length; col++) {
			by = row + pos[1];
			bx = col + pos[0];
			if (outOfBounds(bx, by))
				continue;
			if (!override)
				newBoard[by][bx] += piece[row][col];
			else {
				if (piece[row][col])
					newBoard[by][bx] = piece[row][col];
			}
		}
	}
	return newBoard;
}

function isValidState (board, piece, pos) {
	for (row = 0; row < piece.length; row++) {
		for (col = 0; col < piece[0].length; col++) {
			by = row + pos[1];
			bx = col + pos[0];
			if (outOfBounds(bx, by)) {
				if (piece[row][col] > 0) {
					return false;
				}
				continue;
			}
			if ((board[by][bx] !== 0) && (piece[row][col] !== 0)) {
				return false;
			}
		}
	}
	return true;
}

var Game = React.createClass({
  getInitialState: function() {
  	return {board: emptyBoard(),
  	        piece: [],
  	        pos:   [4, 0],
  	        state: "start"};
  },
  startGame: function(event) {
    this.setState({state: "playing",
    			   board: emptyBoard(),
                   piece: getPiece(),
                   pos:   [4, 0]});
  },
  loop: function() {
    if (this.state.state !== "playing")
      return;
    var newPos = this.state.pos.slice(0);
    newPos[1]++;
    if (isValidState(this.state.board, this.state.piece, newPos))
      this.setState({pos: newPos});
    else {
      var mergedBoard = mergePiece(this.state.board, this.state.piece,
      							this.state.pos, true);
      var newPiece = getPiece();
      this.setState({board: mergedBoard,
      				 piece: newPiece,
                     pos: [4, 0]});
    }
  },
  componentDidMount: function() {
    setInterval(this.loop, 250);
  },
  render: function() {
    var i = 0;
    var mergedBoard = mergePiece(this.state.board, this.state.piece,
    							this.state.pos, true);
    var gridRows = mergedBoard.map(function (row) {
      return <GridRow row={row} key={i++}/>;
    });
    return (
      <div className="container">
        <button type="button" onClick={this.startGame}>START</button>
        <div className="grid-container">
        {gridRows}
        </div>
      </div>
    );
  }
});
  
var GridRow = React.createClass({
  render: function() {
  	var i = 0;
    var gridCells = this.props.row.map(function (cell) {
      return <GridCell key={i++} value={cell}></GridCell>;
    });
    return (
      <div className="grid-row">
       {gridCells}
      </div>
    );
  }
});

var GridCell = React.createClass({
  render: function() {
    return (
      <div className="grid-cell">{this.props.value}</div>
    );
  }
});

function repeat (x, n) {
	// repeat x n times
	var z = [];
	for (i = 0; i < n; i++) {
		z.push(x);
	}
	return z;
}

function emptyBoard() {
	return repeat(repeat(0, 10), 21);
}

React.renderComponent(
	<Game />,
	document.getElementById('target')
);