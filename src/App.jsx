import React, { useRef, useLayoutEffect } from 'react'
import { KanjiCanvas, useKanjiCanvas } from "./kanji-canvas/KanjiCanvas";

const App = () => {
    const boxRef = useRef(null);
    const { recognize, erase, undo, canvasRef } = useKanjiCanvas();

    const onKanjiRecognized = (matchedKanji) => {
        console.log('matched kanji', matchedKanji)
    }

    return (
        <div style={{ width :'50%', height: '100%', margin: 'auto'}}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <h1>Kanji Canvas Demo</h1>
                <div ref={boxRef}  style={{ borderStyle: 'solid', borderWidth: '1px', borderColor: 'black', width: "100%", height: "100%" }}>
                    <KanjiCanvas
                        ref={canvasRef}
                        width="500px"
                        height="500px"
                        onRecognized={onKanjiRecognized}
                    />
                </div>
            </div>
        </div>
    )
}

export default App