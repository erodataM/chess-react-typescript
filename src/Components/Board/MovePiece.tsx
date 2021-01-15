import React from "react";
import {connect} from "react-redux";
import "./MovePiece.css";
import { pieces } from "../../constants/chess";

interface Props {
    pieceMoved: number,
    pieceRef: any,
    x: number,
    y: number,
    width: number
}

class MovePiece extends React.Component<Props>  {
    render () {
        const { pieceMoved, pieceRef, x, y, width} = this.props;
        if (pieceMoved) {
            const className = "hidden " + pieces[pieceMoved.toString()];
            const style= {
                left: (x - width/2) + 'px',
                top: (y-width/2) + 'px'
            }
            return (
                <div className={className} ref={pieceRef} style={style}>

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
    null,
    null
)(MovePiece);