import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Memory />, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    this.setUpGame();
  }

  setUpGame() {
    this.state = {
      numClicks: 0,
      numGuesses: 0,
      selectedTiles: [],
      tiles: []
    };

    let letters = _.shuffle(["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]);
    let lettersLength = letters.length;

    for(var i = 0; i < lettersLength; i++) {
      this.state.tiles.push({
        letter: letters.pop(), // the letter value of the tile.
        state: false, // indicating that the tile is facing down.
        isCorrect: false
      });
    }
  }

  showTile(tileIndex) {
    if(this.state.numGuesses != 2) {
      let tile = this.state.tiles[tileIndex];
      tile.state = !tile.state;
      this.state.selectedTiles.push(tileIndex);
      this.state.numClicks += 1;
      this.state.numGuesses += 1;
      this.setState(this.state);

      let otherTile = this.state.tiles[this.state.selectedTiles[0]];

      if(this.state.numGuesses == 2) {
        if(tile.letter == otherTile.letter) {
          this.state.numGuesses = 0;
          this.state.selectedTiles = [];
          tile.isCorrect = true;
          otherTile.isCorrect = true;
          this.setState(this.state);
        } else {
          window.setTimeout(() => this.badGuessHelper(tile, otherTile), 1000);
        }
      }
      else {
        this.setState(this.state);
      }
    }
  }

  badGuessHelper(tile, otherTile) {
    tile.state = false;
    otherTile.state = false;
    this.state.numGuesses = 0;
    this.state.selectedTiles = [];
    this.setState(this.state);
  }

  loadTiles() {
    let grid = [];
    let row = [];

    _.forEach(this.state.tiles, (tile, index) => {
      row.push(<div className="column" key={"column" + index}><Tile key={"tile" + index} tileIndex={index} root={this}/></div>);

      if((index + 1) % 4 == 0) {
        grid.push(<div className="row" key={"row" + index}>{row}</div>);
        row = [];
      }
    });
    return grid;
  }

  restartGame() {
    this.setUpGame();
    this.setState(this.state);
  }

  render() {
    let header = <div>
        <h2><i><b>Memory game</b></i></h2>
        <p><b>Clicks:</b> {this.state.numClicks} <button className="restart" onClick={() => this.restartGame()}>Restart</button></p>
      </div>;

    let board = <div>
      {this.loadTiles()}
    </div>;
    return <div>{header}{board}</div>;
  }
}

// layout for a tile.
function Tile(params) {
  let root = params.root;
  let tile = root.state.tiles[params.tileIndex];

  if(tile.state) {
    // render flipped tile.
    return <div className="tile">
      <button className={(tile.isCorrect ? "correct": "not-correct")}>
        <h3>{tile.letter}</h3>
      </button>
    </div>;
  }
  else {
    // render tile facing down.
    return <div className="tile">
      <button onClick={() => root.showTile(params.tileIndex)}></button>
    </div>;
  }
}
