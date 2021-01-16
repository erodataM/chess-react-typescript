import {BOARD_INIT, BOARD_MOUSE_DOWN, BOARD_MOUSE_UP, BOARD_MOUSE_LEAVE, BOARD_PLAY_POS} from "../constants/actionTypes";

interface Message {
    diag: any,
    init: () => void,
    trait: boolean,
    index: number,
    pieceMoved: number,
    mouseDown: (diag: any, index: number) => void,
    mouseUp: (diag: any, index: number, pieceMoved: number) => void,
    initialSquare: number,
    x: number,
    y: number,
    width: number,
    lastMove: number[]
}

interface Action {
  type: any,
  payload: Message
}


export default function boardReducer(state = {}, action: Action) {
    switch (action.type) {
        case BOARD_INIT: {
            const { diag, trait } = action.payload;
            return {
                ...state,
                diag,
                trait
            };
        }
        case BOARD_MOUSE_DOWN: {
            const { diag, index, x, y, width } = action.payload;
            let newDiag = [...diag];
            let pieceMoved = newDiag[index];
            newDiag[index] = 0;
            return {
                ...state,
                diag: newDiag,
                pieceMoved,
                initialSquare: index,
                x,
                y,
                width
            };
        }
        case BOARD_MOUSE_UP: {
            const { diag, index, pieceMoved } = action.payload;
            let newDiag = [...diag];
            newDiag[index] = pieceMoved;
            return {
                ...state,
                diag: newDiag,
                pieceMoved: null,
                initialSquare: null
            };
        }
        case BOARD_MOUSE_LEAVE: {
            const { diag, pieceMoved, initialSquare } = action.payload;
            let newDiag = [...diag];
            newDiag[initialSquare] = pieceMoved;
            return {
                ...state,
                diag: newDiag,
                pieceMoved: null,
                initialSquare: null
            };
        }
        case BOARD_PLAY_POS: {
            const { diag, trait, lastMove } = action.payload;
            let newDiag = [...diag];

            return {
                ...state,
                diag: newDiag,
                trait,
                pieceMoved: null,
                initialSquare: null,
                lastMove
            };
        }
        default:
            break;
    }
    return state;
}