import React, { useState, useContext } from "react";
import { AutomatonContext } from "../context/AutomatonContext";

export function TestStringPanel() {
  const [input, setInput] = useState("");
  const {
    simulateString,
    clearHighlights,
    startStepByStep,
    nextStep,
    stepData,
    stopStepMode,
  } = useContext(AutomatonContext);

  return (
    <div className="test-panel">
      <h2>Test String</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="button-primary" onClick={() => simulateString(input)}>Simulate</button>
      <button className="button-secondary" onClick={() => startStepByStep(input)}>Start Step-by-Step</button>
      {stepData && (
        <>
          <button className="button-primary" onClick={nextStep}>Next Step</button>
          <button className="button-secondary" onClick={stopStepMode}>Reset</button>
        </>
      )}
      <button className="button-secondary" onClick={clearHighlights}>Clear Highlights</button>
    </div>
  );
}
