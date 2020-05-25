import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) { 
  return (  
    <button className="square"  onClick={props.onClick}
      style={ props.highlight ? {backgroundColor: 'yellow'} : {backgroundColor: 'white'} }>
       {props.value}  
    </button>
  ); 
}

class Board extends React.Component {
  renderSquare(i) {
    const isLoc = this.props.winningLocations;
    function checkLocation(i, locations) {    // check current square against the locations of the winning squares
      if (i === locations[0] || i === locations[1] || i === locations[2]) {
        return true
      }
      return false
    }
    return (
      // pass three things from the board to a square: the current state, a function to call when clicked,
        // and a boolean indicating whether that square should be highlighted or not
      <Square       
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)} 
          highlight={ isLoc ? checkLocation(i, isLoc) : false }  
      />
    );
  }

  render() {
    const rows = [0, 1, 2];
    const cols = [0, 3, 6];

    // make tictactoe board
    return (
      <div>
        {rows.map(rval => {
          return (
            <div className="board-row">
              {cols.map(cval => {
                return this.renderSquare(rval + cval);
              })}
            </div>
          )
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{     // an array that keeps track of every move made, aka every squares array created 
        squares: Array(9).fill(null),   // array to store of all square states, either X, O, or null
      }],
      stepNumber: 0,
      xIsNext: true,       // allows us to switch between X and O
      lastMove: Array(9).fill(null),   // keeps track of the last move taken each round
      winningLocations: false,    // false until the game has a winner, then array with locations of the three winning squares
      toggle: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();     // create a copy of the board
    const lastMove = this.state.lastMove.slice(0, this.state.stepNumber + 1);

    // if someone already won or that square already has a state, ignore the click
    if (calculateWinner(squares) || squares[i]) {   
      return;
    }

    // otherwise, modify the copied squares array with X or O
    squares[i] = this.state.xIsNext ? 'X' : 'O' ;   
    this.setState({
      history: history.concat([{    // add a new board to the history array 
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,      // switch between X and O
      lastMove: lastMove.concat(i)
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,   // true if even, false if odd
    });
  }

  toggleMoves() {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];      // get the currently selected board
    const winLocations = calculateWinner(current.squares); 
    const winner = current.squares[winLocations[0]];
    const finished = endofGame(current.squares);
    const lastMove = this.state.lastMove;

    const moves = history.map((step, move) => {
      // if the game has started, add a button for the current move and location
          // otherwise, it's the beginning so add a button for the start of the game
      // first, calculate row and column location based on 0-8 number given for current move
      const loc = '(' + Math.floor(lastMove[move] / 3) + ',' + (lastMove[move] % 3) + ')';  
      const buttonText = move ? 'Go to move #' + move + ' at ' + loc : 'Go to game start';
      return (
        <li key={move}> 
          <button onClick={() => this.jumpTo(move)} 
            style={ move === this.state.stepNumber ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}> 
              {buttonText}  
          </button>
        </li>
      );     
    });

    let status;
    if (winner) {  // if someone won, say who and highlight winning squares
      status = 'Winner: ' + winner;
    } else if (finished) {
      status = 'Game ended in a draw'
    } else {      // otherwise, say which player will go next (which symbol will be rendered on click)
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
            winningLocations = {winLocations}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button className="toggle" onClick={() => this.toggleMoves()}>Toggle</button>
          <ol>{this.state.toggle ? moves.reverse() : moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [     // all the possible ways to win in tictactoe
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {    // check all possibilities
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return ([a, b, c]);
    }
  }
  return false; 
}

function endofGame(squares) { 
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      return false;     // if any square is still empty, the game is not yet finished
    }
  }
  return true;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

