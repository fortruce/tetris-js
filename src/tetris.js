/**
 * @jsx React.DOM
 */

function repeat (x, n) {
	// repeat x n times
	var z = [];
	for (i = 0; i < n; i++) {
		z.push(x);
	}
	return z;
}

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

function emptyBoard() {
	return repeat(repeat(0, 10), 21);
}

var Game = React.createClass({
  getInitialState: function() {
  	return {board: emptyBoard(),
  	        piece: [],
  	        pos:   [4, 0],
  	        state: "start"};
  },
  componentDidMount: function() {
  	var descend = function() {
  		if (this.state.state !== "playing")
  			return;
	  	var newPos = this.state.pos.slice(0);
	  	newPos[1]++;
	  	if (isValidState(this.state.board, this.state.piece, newPos)) {
	  		this.setState({pos: newPos});
	  	}
	  	else {
	  		var npiece = getPiece();
	  		var mergedBoard = mergePiece(this.state.board,
	  										this.state.piece,
	  										this.state.pos,
	  										false);
	  		var state = isValidState(mergedBoard, npiece, [4, 0]) ? "playing" : "gameover";
	  		this.setState({board: mergedBoard,
	  						piece: npiece,
	  						pos: [4, 0],
	  						state: state});
	  	}
	}.bind(this);
  	setInterval(descend, this.props.fallingInterval);
  },
  startGame: function(event) {
  	this.setState({state: "playing",
  				   board: emptyBoard(),
  				   piece: getPiece(),
  				   pos: [4, 0]});
  },
  pauseGame: function(event) {
  	this.setState({state: "paused"});
  },
  render: function() {
  	// do not merge the piece in before start
  	var mergedBoard = mergePiece(this.state.board, this.state.piece, this.state.pos,
  					this.state.state === "playing" ? false : true);
  	var i = 0;
    var gridRows = mergedBoard.map(function (row) {
      return <GridRow row={row} key={i++}/>;
    });
    return (
      <div className="container">
		<p className="start-button" onClick={this.startGame}>
	      "START"
	    </p>
	    <p onClick={this.pauseGame}>
	      "PAUSE GAME"
	    </p>
	    <p>{this.state.state}</p>
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
      return <GridCell key={i++} color={cell}></GridCell>;
    });
    return (
      <div className="grid-row">
       {gridCells}
      </div>
    );
  }
});
                             
var GridCell = React.createClass({
  getColor: function(i) {
  	var color = "filled";
  	if (i === 0)
  		color = "blank";
  	if (i > 1 && i <= 8) {
  		color = "colored color" + i;
  	}
  	return color;
  },
  render: function() {
  	var color = this.getColor(this.props.color);
  	var className = "grid-cell " + color;
    return (
      <div className={className}></div>
    );
  }
});

React.renderComponent(
	<Game fallingInterval={150} />,
	document.getElementById('target')
);