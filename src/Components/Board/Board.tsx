import React from 'react';
import "./Board.css";
import { connect } from "react-redux";
import { init, mouseDown, mouseUp, mouseLeave } from "../../actions/boardActions";
import { Position } from "../../models/Position";

interface Props {
    diag: number[],
    init: () => void,
    trait: boolean,
    pieceMoved: number,
    initialSquare: number,
    mouseDown: (diag: number[], index: number) => void,
    mouseUp: (diag: number[], index: number, pieceMoved: number) => void,
    mouseLeave: (diag: number[], pieceMoved: number, initialSquare: number) => void,
}

const mapDispatchToProps = (dispatch: any) => ({
    init: () => {
        dispatch(init());
    },
    mouseDown: (diag: number[], index: number) => {
        dispatch(mouseDown(diag, index))
    },
    mouseUp: (diag: number[], index: number, pieceMoved: number) => {
        dispatch(mouseUp(diag, index, pieceMoved))
    },
    mouseLeave: (diag: number[], pieceMoved: number, initialSquare: number) => {
        dispatch(mouseLeave(diag, pieceMoved, initialSquare))
    }
});

const mapStateToProps = (state: any) => ({
    diag: state.board.diag,
    trait: state.board.trait,
    pieceMoved: state.board.pieceMoved,
    initialSquare: state.board.initialSquare
});

class Board extends React.Component<Props>  {
    position = Position.getPositionFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    pieces: {[index: string]:any} = {
        "0": "",
        "1": "wp",
        "2": "wn",
        "3": "wb",
        "4": "wr",
        "5": "wq",
        "6": "wk",
        "-1": "bp",
        "-2": "bn",
        "-3": "bb",
        "-4": "br",
        "-5": "bq",
        "-6": "bk"
    };

    componentDidMount() {
        const { init } = this.props;
        init();
    }

    squareMouseDown(index: number) {
        let { diag, trait, mouseDown} = this.props;

        if (trait && diag[index] > 0) {
            mouseDown(diag, index);
        }
    }

    squareMouseUp(index: number) {
        let { diag, mouseUp, pieceMoved, initialSquare, mouseLeave} = this.props;
        if (pieceMoved) {
            if (diag[index] <= 0) {
                mouseUp(diag, index, pieceMoved);
            } else {
                mouseLeave(diag, pieceMoved, initialSquare);
            }
        }
    }

    boardMouseLeave() {
        let { diag, mouseLeave, pieceMoved, initialSquare} = this.props;
        if (pieceMoved && initialSquare) {
            mouseLeave(diag, pieceMoved, initialSquare);
        }
    }

    render () {
        let { diag } = this.props;
        if (diag) {
            return (
                <div
                    className="board"
                    onMouseLeave={this.boardMouseLeave.bind(this)}
                >
                    {
                        diag.map((x: any, index: number) => {
                            let className = "square";
                            if (x) {
                                className += " " + this.pieces[x.toString()];
                            }
                            return (
                                <div
                                    key={index}
                                    className={className}
                                    onMouseDown={this.squareMouseDown.bind(this, index)}
                                    onMouseUp={this.squareMouseUp.bind(this, index)}
                                >
                                </div>
                            );
                        })
                    }
                </div>
            );
        }

        return (
            <div className="board">
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
