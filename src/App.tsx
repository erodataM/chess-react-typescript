import React from 'react';
import './App.css';

import Board from "./Components/Board/Board";
import Infos from "./Components/Infos/Infos";
import Notation from "./Components/Notation/Notation";

function App() {
    return (
        <div id="App" className="App">
            <Board />
            <div className="rightContainer">
                <Infos />
                <Notation />
            </div>
        </div>
    );
}

export default App;
