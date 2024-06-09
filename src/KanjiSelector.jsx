import React from 'react'
import refPatterns from "./kanji-canvas/ref-patterns";

export const KanjiSelector = ({ onSelect }) => {
    const renderOptions = () => {
      return refPatterns.map((pattern, index) => (
        <option key={index + 1}>{pattern[0]}</option>
      ))
    }

    const onChange = () => {
      const selectElement = document.getElementById("kanji-selector");
      onSelect(selectElement.value)
    }

    return (
      <select id='kanji-selector' onChange={onChange}>
        <option key={0}>Select Kanji</option>
        {renderOptions()}
      </select>
    )
}