import React from "react";
import "./Infos.css";
import {connect} from "react-redux";

interface Props {
    fen?: string,
    trait?: boolean,
    evaluation?: any[]
}

interface State {

}

const mapStateToProps = (state: any) => ({
    fen: state.board.fen,
    trait: state.board.trait,
    evaluation: state.board.evaluation
});

class Infos extends React.Component<Props,State>  {
    render () {
        const { fen, trait, evaluation } = this.props;
        let e = '0';
        if (evaluation) {
            e = evaluation[5]?evaluation[5]:'0';
        }
        const className = trait ? "trait blanc": "trait noir";
        return (
            <div className="infos">
                <div className="container traitContainer">
                    <b>trait:</b>
                    <span className={className}>
                    </span>
                </div>
                <div className="container">
                    <b>fen:</b> {fen}
                </div>
                <div className="container">
                    <b>evaluation:</b> {-1*parseInt(e)/100}
                </div>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    null
)(Infos);