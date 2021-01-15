import React from 'react';
import "./Board.css";
import { connect } from "react-redux";
import { init, mouseDown, mouseUp, mouseLeave, playPos } from "../../actions/boardActions";
import { Position } from "../../models/Position";
import { Positions } from "../../models/Positions";
import { Tools } from "../../models/Tools";
import StockfishService from "../../services/StockfishService";
import MovePiece from "./MovePiece";
import { pieces } from "../../constants/chess";

interface Props {
    diag: number[],
    init: () => void,
    trait: boolean,
    pieceMoved: number,
    initialSquare: number,
    mouseDown: (diag: number[], index: number, x:number, y:number, width: number) => void,
    mouseUp: (diag: number[], index: number, pieceMoved: number) => void,
    mouseLeave: (diag: number[], pieceMoved: number, initialSquare: number) => void,
    playPos: (diag: number[], trait: boolean) => void,
    x: number,
    y: number,
    width: number,
    position: Position
}

const mapDispatchToProps = (dispatch: any) => ({
    init: () => {
        dispatch(init());
    },
    mouseDown: (diag: number[], index: number, x:number, y: number, width: number) => {
        dispatch(mouseDown(diag, index, x, y, width))
    },
    mouseUp: (diag: number[], index: number, pieceMoved: number) => {
        dispatch(mouseUp(diag, index, pieceMoved))
    },
    mouseLeave: (diag: number[], pieceMoved: number, initialSquare: number) => {
        dispatch(mouseLeave(diag, pieceMoved, initialSquare))
    },
    playPos: (diag: number[], trait: boolean) => {
        dispatch(playPos(diag, trait))
    }
});

const mapStateToProps = (state: any) => ({
    diag: state.board.diag,
    trait: state.board.trait,
    pieceMoved: state.board.pieceMoved,
    initialSquare: state.board.initialSquare,
    x: state.board.x,
    y: state.board.y,
    width: state.board.width,
    position: state.board.position
});

class Board extends React.Component<Props>  {
    position = Position.getPositionFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    positions = new Positions(this.position);
    sfService = new StockfishService();
    myRef = React.createRef<HTMLDivElement>();
    squareRef = React.createRef<HTMLDivElement>();
    currentIndex = -1;

    componentDidMount() {
        const { init, playPos } = this.props;
        init();
        this.sfService.attachListener((e)=> {
            const regEval = new RegExp('info depth (15) seldepth ([0-9]*) multipv ([0-9]*) score (cp|mate) (-?[0-9]*) nodes ([0-9]*) nps ([0-9]*)( hashfull [0-9]*)? tbhits ([0-9]*) time ([0-9]*) pv (.*)');
            const matchesEval = e.data.match(regEval);

            const regBestmove = new RegExp('bestmove ([^ ]*)( ponder (.*))?');
            const matches = e.data.match(regBestmove);

            if (matches) {
                this.positions.base = this.position;
                this.positions.base.trait = false;
                this.positions.generate();

                const bestMove = matches[1];
                const x1 = bestMove.charCodeAt(0) - 97;
                const y1 = 8 - bestMove[1];
                const i1 = 8 * y1 + x1;
                const x2 = bestMove.charCodeAt(2) - 97;
                const y2 = 8 - bestMove[3];
                const i2 = 8 * y2 + x2;

                const prevPiece = this.position.diag[i1];

                const newPos: Position = Position.getPositionFromFen(this.position.getFen());

                newPos.diag[i1] = 0;
                newPos.diag[i2] = prevPiece;
                this.positions.handleCastle(i2, prevPiece, i1, newPos);
                this.positions.handleEnPassant(i2, prevPiece, newPos);

                if (bestMove.length === 5) {
                    newPos.diag[i2] = Tools.uciPromote[bestMove[4]];
                }

                const index = this.positions.isPositionPossible(newPos);

                this.position = this.positions.list[index];
                playPos(this.position.diag, this.position.trait);
                this.playAudio(this.position.move_type);
            }

        });
        this.sfService.postMessage('uci');
    }

    squareMouseDown(index: number, e: any) {
        let { diag, trait, mouseDown} = this.props;

        if (trait && diag[index] > 0 && this.positions.isPieceMovable(index, this.position) && this.squareRef.current) {
            this.currentIndex = index;
            this.position.diag[index] = 0;
            mouseDown(diag, index, e.clientX, e.clientY, this.squareRef.current.offsetWidth);
        }
    }

    squareMouseUp(index: number) {
        let { diag, pieceMoved, initialSquare, mouseLeave, playPos} = this.props;
        if (pieceMoved) {
            if (diag[index] <= 0) {
                this.positions.handleCastle(index, pieceMoved, this.currentIndex, this.position);
                this.positions.handleEnPassant(index, pieceMoved, this.position);
                this.position.diag[index] = pieceMoved;

                if(this.positions.isPositionPossible(this.position) !== -1) {
                    this.playAudio(this.position.move_type);
                    this.position.trait = false;
                    playPos(this.position.diag, this.position.trait);
                    this.sfService.postMessage('ucinewgame');
                    this.sfService.postMessage('position fen ' + this.position.getFen());
                    this.sfService.postMessage('go depth 15');
                } else {
                    this.position.diag[index] = 0;
                    this.position.diag[this.currentIndex] = pieceMoved;
                    mouseLeave(this.position.diag, pieceMoved, initialSquare);
                }
            } else {
                this.position.diag[this.currentIndex] = pieceMoved;
                mouseLeave(this.position.diag, pieceMoved, initialSquare);
            }
        }
    }

    boardMouseLeave() {
        let { diag, mouseLeave, pieceMoved, initialSquare} = this.props;
        if (pieceMoved && initialSquare) {
            mouseLeave(diag, pieceMoved, initialSquare);
        }
    }

    mouseMove(e: any) {
        let { pieceMoved } = this.props;
        if (pieceMoved) {
            if (this.myRef.current) {
                this.myRef.current.style.left = e.clientX - this.myRef.current.offsetWidth/2 +  'px';
                this.myRef.current.style.top = e.clientY - this.myRef.current.offsetWidth/2 + 'px';
            }
        }
    }

    render () {
        const { diag, pieceMoved, x, y, width } = this.props;
        if (diag) {
            return (
                <div
                    className="board"
                    onMouseLeave={this.boardMouseLeave.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}
                >
                    {
                        diag.map((x: any, index: number) => {
                            let className = "square";
                            if (x) {
                                className += " " + pieces[x.toString()];
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
                    <div className="square hiddenPiece" ref={this.squareRef}>
                    </div>
                    <MovePiece pieceMoved={pieceMoved} pieceRef={this.myRef} x={x} y={y} width={width}/>
                </div>
            );
        }

        return (
            <div className="board">
            </div>
        );
    }

    playAudio(type: string){
        const audio = new Audio();
        let file = 'move';
        if (type === 'TAKE' || type === 'EP') {
          file = 'capture';
        }
        audio.src = '../../../' + file + '.mp3';

        audio.load();
        audio.play();
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
