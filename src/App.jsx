import React from 'react'
import { KanjiCanvas, useKanjiCanvas } from "./kanji-canvas/KanjiCanvas";

const App = () => {
    const { recognize, erase, undo, canvasRef } = useKanjiCanvas();

    const onKanjiRecognized = (matchedKanji) => {
        console.log('matched kanji', matchedKanji)
    }

    return (
        <div className='canvas-box' style={{  margin: 'auto' }}>
            <button onClick={recognize}>Recognize</button>
            <button onClick={erase}>Erase</button>
            <button onClick={undo}>Undo</button>
            <div style={{
                position: 'relative',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'black',
                width: "100%",
                height: "100%"
            }}>
                <KanjiCanvas
                    ref={canvasRef}
                    onRecognized={onKanjiRecognized}
                />
            </div>
        </div>
    )
}

export default App