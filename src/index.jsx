import React from 'react'
import ReactDOM from 'react-dom/client'
import KanjiCanvas from './kanji-canvas/KanjiCanvas';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>
        <div>Kanji Canvas Demo</div>
        <KanjiCanvas/>
    </>
);



