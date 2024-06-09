## Kanji Canvas React JS
A React adaption of the [Kanji Canvas](https://github.com/asdfjkl/kanjicanvas) library.

### KanjiCanvas Props
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| axesColor | string | #BCBDC3 | Color of the axes |
| onRecognized | function | | Callback function that is called when a kanji character is recognized and returned as a string array of matched kanji characters |
| onErase | function | | Callback function that is called when the drawing is clears |
| onUndo | function | | Callback function that is called when the last change is undone |

### useKanjiCanvas return object

#### values
| Name | Type | Description |
| --- | --- | --- |
| canvasRef | React ref | A reference to the canvas.  Assign it to the KanjiCanvas ref prop before using any of the returned methods |

#### methods
| Name | Parameters | Return Type | Description |
| --- | --- | --- | --- |
| recognise |  | void | Invoke to recognise the the drawn kanji character. |
| erase |  | void | Invoke to clear the canvas |
| undo |  | void | Invoke to recognise the the draw kanji character |
| writeKanji | string | void | Invoke to write the provided kanji character to the canvas |

### Usage
```
import { KanjiCanvas, useKanjiCanvas } from "kanjicanvas";

const App = () => {
    const { recognize, erase, undo, writeKanji, canvasRef } = useKanjiCanvas();

    const onKanjiRecognized = (matchedKanji) => {
        console.log('matched kanji', matchedKanji)
    }

    return (
        <>
            <button onClick={recognize}>Recognize</button>
            <button onClick={erase}>Erase</button>
            <button onClick={undo}>Undo</button>
            <button onClick={() => writeKanji('自')}>Write 自 to canvas</button>
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
```

Copyright and License
Copyright (c) 2019-2020 Dominik Klein

Copyright (c) 2020 Seth Clydesdale

licensed under MIT (cf. LICENSE.TXT).