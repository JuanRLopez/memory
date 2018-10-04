import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root, channel) {
  ReactDOM.render(<Memory channel={channel} />, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);

    this.channel = props.channel;
    this.state = {tiles: [], num_clicks: 0, tilesSelected: []};

    this.channel.join()
        .receive("ok", this.gotView.bind(this))
        .receive("error", resp => {console.log("Unable to join", resp)});
  }

  gotView(view) {
    console.log("new view", view);
    this.setState(view.game);
  }

  // logic to handle a tile flip and the corresponding display scenarios
  handleTile(tileIndex) {
    this.state.tilesSelected.push(this.state.tiles[tileIndex])
    if(this.state.tilesSelected.length == 2) {

      if(this.state.tilesSelected[0].letter == this.state.tilesSelected[1].letter) {
        this.channel.push("handleTile", { index: tileIndex })
            .receive("ok", this.gotView.bind(this));
      }
      else {
        this.state.tiles[tileIndex].state = true;
        this.setState(this.state);

        window.setTimeout(() => {
          this.channel.push("handleTile", { index: tileIndex })
              .receive("ok", this.gotView.bind(this));
        }, 1000);
      }

      this.state.tilesSelected = [];
    }
    else {
      this.channel.push("handleTile", { index: tileIndex })
          .receive("ok", this.gotView.bind(this));
    }
  }

  restartGame() {
    this.channel.push("restart", {})
        .receive("ok", this.gotView.bind(this));
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

  render() {
    let header = <div>
        <p><b>Clicks:</b> {this.state.num_clicks} <button className="restart" onClick={() => this.restartGame()}>Restart</button></p>
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
      <button className={(tile.is_correct ? "correct": "not-correct")}>
        <h3>{tile.letter}</h3>
      </button>
    </div>;
  }
  else {
    // render tile facing down.
    return <div className="tile">
      <button onClick={() => root.handleTile(params.tileIndex)}></button>
    </div>;
  }
}
