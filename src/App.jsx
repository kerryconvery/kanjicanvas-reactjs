import React from 'react'
import { KanjiCanvas, useKanjiCanvas } from "./kanji-canvas/KanjiCanvas";

const App = () => {
    const { recognize, erase, undo, canvasRef } = useKanjiCanvas();

    const onKanjiRecognized = (matchedKanji) => {
        console.log('matched kanji', matchedKanji)
    }

    return (
        <>
            <button onClick={recognize}>Recognize</button>
            <button onClick={erase}>Erase</button>
            <button onClick={undo}>Undo</button>
            <div style={{ borderStyle: 'solid', borderWidth: '1px', borderColor: 'black', width: "500px", height: "500px" }}>
            <KanjiCanvas
                ref={canvasRef}
                width="500px"
                height="500px"
                onRecognized={onKanjiRecognized}
            />
            </div>
        </>
    )
}

export default App