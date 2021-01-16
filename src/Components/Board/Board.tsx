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
import Modal from 'react-modal';
import _ from 'lodash';

interface Props {
    diag: number[],
    init: (diag: number[], trait: boolean, fen: string) => void,
    trait: boolean,
    pieceMoved: number,
    initialSquare: number,
    mouseDown: (diag: number[], index: number, x:number, y:number, width: number) => void,
    mouseUp: (diag: number[], index: number, pieceMoved: number) => void,
    mouseLeave: (diag: number[], pieceMoved: number, initialSquare: number) => void,
    playPos: (diag: number[], trait: boolean, lastMove: number[], fen: string, evaluation: any[], moves: string[][]) => void,
    x: number,
    y: number,
    width: number,
    position: Position,
    lastMove: number[],
}

interface State {
    modalMateIsOpen: boolean,
    modalStaleMateIsOpen: boolean,
    modalPromoteIsOpen: boolean
}

const mapDispatchToProps = (dispatch: any) => ({
    init: (diag: number[], trait: boolean, fen: string) => {
        dispatch(init(diag, trait, fen));
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
    playPos: (diag: number[], trait: boolean, lastMove: number[], fen: string, evaluation: any[], moves: string[][]) => {
        dispatch(playPos(diag, trait, lastMove, fen, evaluation, moves))
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
    position: state.board.position,
    lastMove: state.board.lastMove
});

class Board extends React.Component<Props,State>  {
    game: Position[] = [];
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    position = Position.getPositionFromFen(this.fen);
    //position = Position.getPositionFromFen("rnbqk2r/ppppppP1/5n2/8/8/8/PPPPPPP1/RNBQKBNR w KQkq - 1 5");
    positions = new Positions(this.position);
    sfService = new StockfishService();
    myRef = React.createRef<HTMLDivElement>();
    squareRef = React.createRef<HTMLDivElement>();
    currentIndex = -1;
    currentPiece = -1;
    currentPromote = -1;
    evaluation = [];
    constructor(props: Props) {
        super(props);

        this.state = {
            modalMateIsOpen: false,
            modalStaleMateIsOpen: false,
            modalPromoteIsOpen: false
        };
    }

    componentDidMount() {
        const { init, playPos } = this.props;
        init(this.position.diag, this.position.trait, this.fen);
        const initClone = _.cloneDeep(this.position);
        this.game.push(initClone);
        Modal.setAppElement('#App');

        this.sfService.attachListener((e)=> {
            const regEval = new RegExp('info depth (15) seldepth ([0-9]*) multipv ([0-9]*) score (cp|mate) (-?[0-9]*) nodes ([0-9]*) nps ([0-9]*)( hashfull [0-9]*)? tbhits ([0-9]*) time ([0-9]*) pv (.*)');
            const matchesEval = e.data.match(regEval);
            if (matchesEval) {
                this.evaluation = matchesEval;
            }
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
                const lastMove = this.getLastMoveSquare(this.position, this.positions.list[index]);
                this.position = this.positions.list[index];
                const initClone = _.cloneDeep(this.position);
                this.game.push(initClone);

                playPos(this.position.diag, this.position.trait, lastMove, this.position.getFen(), this.evaluation, this.getAlgebraicGame());
                this.playAudio(this.position.move_type);

                this.positions.base = this.position;
                this.positions.generate();
                if (this.positions.list.length === 0) {
                    if (this.position.isInCheck()) {
                        this.openMateModal();
                    } else {
                        this.openStaleMateModal();
                    }
                }
            }

        });
        this.sfService.postMessage('uci');
    }

    squareMouseDown(index: number, e: any) {
        let { diag, trait, mouseDown } = this.props;

        if (trait && diag[index] > 0 && this.positions.isPieceMovable(index, this.position) && this.squareRef.current) {
            this.positions.base = JSON.parse(JSON.stringify(this.position));
            this.currentIndex = index;
            this.currentPiece = diag[index];
            this.position.diag[index] = 0;
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;
            mouseDown(diag, index, x, y, this.squareRef.current.offsetWidth);
        }
    }

    touchEnd(e: any) {
        if (this.squareRef.current) {
            const x = e.changedTouches[0].clientX;
            const y = e.changedTouches[0].clientY;
            const i = Math.floor(x / this.squareRef.current.offsetWidth);
            const j = Math.floor(y / this.squareRef.current.offsetWidth);
            this.squareMouseUp(i + j * 8);
        }
    }

    squareMouseUp(index: number) {
        let { diag, pieceMoved, initialSquare, mouseLeave } = this.props;

        if (pieceMoved) {
            if (diag[index] <= 0) {
                const prevPiece = this.position.diag[index];
                this.positions.handleCastle(index, pieceMoved, this.currentIndex, this.position);
                this.positions.handleEnPassant(index, pieceMoved, this.position);
                this.handlePromote(index, this.currentIndex);
                this.position.diag[index] = pieceMoved;
                this.handleMove(index, pieceMoved, initialSquare, prevPiece);
            } else {
                this.position.diag[this.currentIndex] = pieceMoved;
                mouseLeave(this.position.diag, pieceMoved, initialSquare);
            }
        }
    }

    handleMove(index: number, pieceMoved: number, initialSquare: number, prevPiece: number) {
        let { playPos, mouseLeave } = this.props;

        const positionIndex = this.positions.isPositionPossible(this.position);

        if(positionIndex !== -1) {
            const lastMove = this.getLastMoveSquare(this.positions.base, this.positions.list[positionIndex]);
            this.position = this.positions.list[positionIndex];
            const initClone = _.cloneDeep(this.position);
            this.game.push(initClone);
            this.playAudio(this.position.move_type);

            playPos(this.position.diag, this.position.trait, lastMove, this.position.getFen(), this.evaluation, this.getAlgebraicGame());

            this.positions.base = this.position;
            this.positions.generate();
            if (this.positions.list.length === 0) {
                if (this.position.isInCheck()) {
                    this.openMateModal();
                } else {
                    this.openStaleMateModal();
                }
            } else {
                this.sfService.postMessage('ucinewgame');
                this.sfService.postMessage('position fen ' + this.position.getFen());
                this.sfService.postMessage('go depth 15');
            }
        } else {
            this.position.diag[index] = prevPiece;
            this.position.diag[this.currentIndex] = pieceMoved;
            mouseLeave(this.position.diag, pieceMoved, initialSquare);
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
                const x = e.clientX || e.touches[0].clientX;
                const y = e.clientY || e.touches[0].clientY;
                this.myRef.current.style.left = x - this.myRef.current.offsetWidth/2 +  'px';
                this.myRef.current.style.top = y - this.myRef.current.offsetWidth/2 + 'px';
            }
        }
    }

    openMateModal() {
        this.setState((previousState, props) => ({
            modalMateIsOpen: true,
        }));
    }

    closeMateModal(){
        this.setState((previousState, props) => ({
            modalMateIsOpen: false,
        }));
    }

    openStaleMateModal() {
        this.setState((previousState, props) => ({
            modalStaleMateIsOpen: true,
        }));
    }

    closeStaleMateModal(){
        this.setState((previousState, props) => ({
            modalStaleMateIsOpen: false,
        }));
    }

    openPromoteModal() {
        this.setState((previousState, props) => ({
            modalPromoteIsOpen: true,
        }));
    }

    closePromoteModal(){
        this.setState((previousState, props) => ({
            modalPromoteIsOpen: false,
        }));
    }

    handlePromote(i: number, j: number): void {
        if (this.currentPiece === 1 && this.currentIndex > 7 && this.currentIndex < 16 && i < 8 && this.positions.isPromotePossible(i, j)) {
            this.currentPromote = i;
            this.openPromoteModal();
        }
    }

    choosePiece(e: any) {
        let { pieceMoved, initialSquare } = this.props;

        if (e.target.classList.contains('wn')) {
            this.position.diag[this.currentPromote] = 2;
        }
        if (e.target.classList.contains('wb')) {
            this.position.diag[this.currentPromote] = 3;
        }
        if (e.target.classList.contains('wr')) {
            this.position.diag[this.currentPromote] = 4;
        }
        if (e.target.classList.contains('wq')) {
            this.position.diag[this.currentPromote] = 5;
        }
        this.position.diag[this.currentIndex] = 0;
        this.handleMove(this.currentPromote, pieceMoved, initialSquare, 0);
        this.closePromoteModal();
    }

    render () {
        const { diag, pieceMoved, x, y, width, lastMove } = this.props;
        const { modalMateIsOpen, modalStaleMateIsOpen, modalPromoteIsOpen } = this.state;
        if (diag) {
            return (
                <div
                    className="board"
                    onMouseLeave={this.boardMouseLeave.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}
                    onTouchMove={this.mouseMove.bind(this)}
                >
                    {
                        diag.map((x: any, index: number) => {
                            let className = "square";
                            if (x) {
                                className += " " + pieces[x.toString()];
                            }
                            if (lastMove && lastMove.indexOf(index) !== -1) {
                                className += " lastMove";
                            }
                            return (
                                <div
                                    key={index}
                                    className={className}
                                    onMouseDown={this.squareMouseDown.bind(this, index)}
                                    onTouchStart={this.squareMouseDown.bind(this, index)}
                                    onMouseUp={this.squareMouseUp.bind(this, index)}
                                    onTouchEnd={this.touchEnd.bind(this)}
                                >
                                </div>
                            );
                        })
                    }
                    <div className="square hiddenPiece" ref={this.squareRef}>
                    </div>
                    <MovePiece pieceMoved={pieceMoved} pieceRef={this.myRef} x={x} y={y} width={width}/>
                    <Modal
                        isOpen={modalMateIsOpen}
                        contentLabel="Mate modal"
                    >
                        <h2>Mat !</h2>
                        <button onClick={this.closeMateModal.bind(this)}>Fermer</button>
                    </Modal>
                    <Modal
                        isOpen={modalStaleMateIsOpen}
                        contentLabel="Stale Mate modal"
                    >
                        <h2>Pat !</h2>
                        <button onClick={this.closeStaleMateModal.bind(this)}>Fermer</button>
                    </Modal>
                    <Modal
                        isOpen={modalPromoteIsOpen}
                        contentLabel="Promote modal"
                    >
                        <div className="container-promote">
                            <div className="square wn" onClick={this.choosePiece.bind(this)}>
                            </div>
                            <div className="square wb" onClick={this.choosePiece.bind(this)}>
                            </div>
                            <div className="square wr" onClick={this.choosePiece.bind(this)}>
                            </div>
                            <div className="square wq" onClick={this.choosePiece.bind(this)}>
                            </div>
                        </div>
                    </Modal>
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

    getLastMoveSquare(position1: Position, position2: Position): number[] {
        const lastMoveSquare = [];
        for (let i = 0; i < 64; i++) {
            if (position1.diag[i] !== position2.diag[i]) {
                lastMoveSquare.push(i);
            }
        }

        return lastMoveSquare;
    }

    getAlgebraicGame(): string[][] {
        const result = [];
        const tabs = [];

        for (let i = 1; i < this.game.length; i++) {
            let diffCount = 0;
            const tab: any = [];
            for (let j = 0; j < 64; j++) {
                const diff = this.game[i].diag[j] - this.game[i - 1].diag[j];
                if (diff !== 0) {
                    diffCount++;
                    if (this.game[i].diag[j] === 0) {
                        tab['begin'] = j;
                    } else {
                        tab['end'] = j;
                        tab['piece'] = Math.abs(this.game[i].diag[j]);
                        tab['prise'] = this.game[i].diag[j] * this.game[i-1].diag[j] !== 0;
                        tab['check'] = this.game[i].isInCheck();
                    }
                }
            }
            tab['diff'] = diffCount;
            tabs.push(tab);
        }

        for (let i = 0; i < tabs.length; i++) {
            let alg = '';
            let piece = '';
            if (tabs[i]['diff'] === 2) {
                if (tabs[i]['piece'] === 1) {
                    if (tabs[i]['prise']) {
                        alg += this.getCoordFromPos(tabs[i]['begin'])[0] + 'x' + this.getCoordFromPos(tabs[i]['end'])[0] + this.getCoordFromPos(tabs[i]['end'])[1];
                    } else {
                        alg += this.getCoordFromPos(tabs[i]['end'])[0] + '' + this.getCoordFromPos(tabs[i]['end'])[1];
                    }
                } else {
                    if (tabs[i]['prise']) {
                        alg += 'x' + this.getCoordFromPos(tabs[i]['end'])[0] + this.getCoordFromPos(tabs[i]['end'])[1];
                    } else {
                        alg += this.getCoordFromPos(tabs[i]['end'])[0] + '' + this.getCoordFromPos(tabs[i]['end'])[1];
                    }
                }
                if (tabs[i]['check']) {
                    alg+='+';
                }
                piece = this.getFontPiece(tabs[i]['piece']);
            }
            if (tabs[i]['diff'] === 4) {
                if (tabs[i]['begin'] === 63 && tabs[i]['end'] === 62 || tabs[i]['begin'] === 7 && tabs[i]['end'] === 6) {
                    alg = '0-0';
                } else {
                    alg = '0-0-0';
                }
            }
            result.push([i%2===0?Math.trunc(i / 2)+1+'.':'', alg, piece]);
        }

        return result;
    }

    getCoordFromPos(i: number) {
        const x = i % 8;
        const y = Math.trunc(i / 8);

        return [Tools.cols[x], (8-y)];
    }

    getFontPiece(piece: number): string {
        const tab: any = {
            1: '',
            2: 'h',
            3: 'b',
            4: 'r',
            5: 'q',
            6: 'k'
        };
        return tab[piece];
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Board);
