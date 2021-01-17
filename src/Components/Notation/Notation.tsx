import React from "react";
import "./Notation.css";
import {connect} from "react-redux";

interface Props {
    moves?: string[][]
}

interface State {

}

const mapStateToProps = (state: any) => ({
    moves: state.board.moves,
});

class Notation extends React.Component<Props,State>  {
    render() {
        const { moves } = this.props;

        if (moves) {
            return (
                <div className="notation">
                    <div><b>Blancs: </b>Vous</div>
                    <div><b>Noirs: </b>Stockfish WASM</div>
                    <div className="game">
                        {moves.map((x, index)=> {
                            return (
                                <span key={index}>
                                    <span className="count">{x[0]}</span>
                                    <span className="chess">{x[2]}</span>
                                    <span>{x[1]} </span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    null
)(Notation);