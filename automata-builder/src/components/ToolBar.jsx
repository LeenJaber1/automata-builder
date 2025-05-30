import React, { useContext, useState } from "react";
import { AutomatonContext } from "../context/AutomatonContext";

export function Toolbar() {
  const {
    setTool,
    tool,
    automatonType,
    setAutomatonType,
    saveAutomaton,
    exportImage,
    setAlphabet
  } = useContext(AutomatonContext);

  const [alphabetInput, setAlphabetInput] = useState("");

  const handleAlphabetChange = (e) => {
    const value = e.target.value;
    setAlphabetInput(value);
    setAlphabet(
      value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    );
  };

  return (
    <div className="toolbar" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <select value={automatonType} onChange={(e) => setAutomatonType(e.target.value)}>
        <option value="DFA">DFA</option>
        <option value="NFA">NFA</option>
        <option value="ε-NFA">ε-NFA</option>
      </select>
      <button className={tool === "state" ? "active" : ""} onClick={() => setTool("state")}>Add State</button>
      <button className={tool === "transition" ? "active" : ""} onClick={() => setTool("transition")}>Add Transition</button>
      <button onClick={saveAutomaton}>Save</button>
      <button onClick={exportImage}>Export Image</button>
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Alphabet:
        <input
          type="text"
          placeholder="e.g. a,b,c"
          value={alphabetInput}
          onChange={handleAlphabetChange}
          style={{
            width: 100,
            marginLeft: 4,
            padding: "2px 6px",
            fontSize: 14,
          }}
        />
      </label>
    </div>
  );
}
