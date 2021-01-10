import {BOARD_INIT, BOARD_MOUSE_DOWN, BOARD_MOUSE_UP, BOARD_MOUSE_LEAVE} from "../constants/actionTypes";

interface Message {
    diag: any,
    init: () => void,
    trait: boolean,
    index: number,
    pieceMoved: number,
    mouseDown: (diag: any, index: number) => void,
    mouseUp: (diag: any, index: number, pieceMoved: number) => void,
    initialSquare: number
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
            const { diag, index } = action.payload;
            let newDiag = [...diag];
            let pieceMoved = newDiag[index];
            newDiag[index] = 0;
            return {
                ...state,
                diag: newDiag,
                pieceMoved,
                initialSquare: index
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
        default:
            break;
    }
    return state;
}