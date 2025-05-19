// components/AlphabetInput.jsx
import React, { useContext } from "react";
import { AutomatonContext } from "../context/AutomatonContext";

export function AlphabetInput() {
  const { alphabet, setAlphabet } = useContext(AutomatonContext);

  // Controlled input for comma-separated values
  return (
    <div style={{ marginBottom: 24 }}>
      <label>
        <strong>Alphabet:</strong>
        <input
          type="text"
          placeholder="e.g. a,b"
          value={alphabet.join(",")}
          onChange={e => {
            setAlphabet(
              e.target.value
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
            );
          }}
          style={{ width: 140, marginLeft: 8 }}
        />
      </label>
      <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
        (comma-separated, e.g. a,b)
      </div>
    </div>
  );
}
