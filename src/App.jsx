import React from 'react'
import KanjiCanvas, { useKanjiCanvas } from "./kanji-canvas/KanjiCanvas";

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
            <KanjiCanvas
                ref={canvasRef}
                onRecognized={onKanjiRecognized}
            />
        </>
    )
}

export default App