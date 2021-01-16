import {BOARD_INIT, BOARD_MOUSE_DOWN, BOARD_MOUSE_UP, BOARD_MOUSE_LEAVE, BOARD_PLAY_POS} from "../constants/actionTypes";

export const init = (diag: number[], trait: boolean, fen: string) => (dispatch: any) => {
    dispatch({
        type: BOARD_INIT,
        payload: {
            diag,
            trait,
            fen
        },
    });
}

export const mouseDown = (diag: number[], index: number, x: number, y: number, width: number) => (dispatch: any) => {
    dispatch({
        type: BOARD_MOUSE_DOWN,
        payload: {
            diag: diag,
            index: index,
            x,
            y,
            width
        },
    });
}

export const mouseUp = (diag:number[] , index:number , pieceMoved: number) => (dispatch: any) => {
    dispatch({
        type: BOARD_MOUSE_UP,
        payload: {
            diag: diag,
            index: index,
            pieceMoved
        },
    });
}

export const mouseLeave = (diag: number[], pieceMoved: number, initialSquare: number) => (dispatch: any) => {
    dispatch({
        type: BOARD_MOUSE_LEAVE,
        payload: {
            diag: diag,
            initialSquare,
            pieceMoved
        },
    });
}

export const playPos = (diag: number[], trait: boolean, lastMove: number[], fen: string, evaluation: any[], moves: string[][]) => (dispatch: any) => {
    dispatch({
        type: BOARD_PLAY_POS,
        payload: {
            diag,
            trait,
            lastMove,
            fen,
            evaluation,
            moves
        },
    });
}