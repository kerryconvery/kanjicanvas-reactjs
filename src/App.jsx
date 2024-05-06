import React, { useRef } from 'react'
import KanjiCanvas from "./kanji-canvas/KanjiCanvas";

const App = () => {
    const kajiCanvaseRef = useRef(null);

    const onKanjiRecognized = (matchedKanji) => {
        console.log('matched kanji', matchedKanji)
    }

    return (
        <>
            <button onClick={() => kajiCanvaseRef.current.recognize()}>Recognize</button>
            <button onClick={() => kajiCanvaseRef.current.erase()}>Erase</button>
            <button onClick={() => kajiCanvaseRef.current.undo()}>Undo</button>
            <KanjiCanvas
                ref={kajiCanvaseRef}
                onRecognized={onKanjiRecognized}
            />
        </>
    )
}

export default App