import React, { useContext, useRef, useState } from "react";
import { AutomatonContext } from "../context/AutomatonContext";
import { validateAutomaton } from "../utils/validator";

export function AutomatonCanvas() {
  const {
    states,
    transitions,
    addState,
    tool,
    setTransitions,
    setStates,
    highlightedStates,
    stepData,
    automatonType,
    alphabet,
  } = useContext(AutomatonContext);

  const canvasRef = useRef();
  const [selected, setSelected] = useState(null);
  const [pendingTransition, setPendingTransition] = useState(null);

  const removeState = (index) => {
    const id = states[index].id;
    setStates(states.filter((_, i) => i !== index));
    setTransitions(transitions.filter((t) => t.from.id !== id && t.to.id !== id));
  };

  const removeTransition = (index) => {
    setTransitions(transitions.filter((_, i) => i !== index));
  };

  const handleClick = (e) => {
    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    if (tool === "state") {
      const name = prompt("State name (e.g. q0):");
      addState({ x, y, name: name || `q${states.length}` });
    } else if (tool === "transition") {
      const clickedState = states.find((s) => Math.hypot(s.x - x, s.y - y) < 20);
      if (!clickedState) {
        setSelected(null);
        setPendingTransition(null);
        return;
      }
      if (!selected) {
        setSelected(clickedState); // First click: source state
      } else {
        // Second click: destination state, show alphabet choices here
        setPendingTransition({
          from: selected,
          to: clickedState,
          x: clickedState.x,
          y: clickedState.y,
        });
        setSelected(null);
      }
    } else {
      setSelected(null);
    }
  };

  const handleRightClick = (e, i) => {
    e.preventDefault();
    const type = prompt("Set as (start/accept/none):");
    setStates((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, role: type } : s))
    );
  };

  const handleDoubleClick = (i) => {
    const name = prompt("Rename state:", states[i].name || "");
    if (name) {
      setStates(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, name } : s))
      );
    }
  };
  const validate = () => {
    const validStates = Array.isArray(states) ? states : [];
    const validTransitions = Array.isArray(transitions) ? transitions : [];
    const validAlphabet = Array.isArray(alphabet) ? alphabet : [];

    const dfaErrors = [];

    if (automatonType === "DFA") {
      // 1. Epsilon transitions not allowed
      validTransitions.forEach((t) => {
        if (t.label === "ε") {
          const stateLabel = t.from.name || t.from.id || "unknown";
          dfaErrors.push(
            `DFA cannot have epsilon (ε) transitions. Problem at state '${stateLabel}'.`
          );
        }
      });

      // 2. For each state, for each symbol: exactly ONE outgoing transition
      validStates.forEach((state, idx) => {
        const stateLabel =
          (typeof state.name === "string" && state.name.trim() !== "")
            ? state.name
            : state.id || `q${idx}`;

        // Only consider OUTGOING transitions for this state (no mutation)
        const outgoing = validTransitions.filter(
          (t) => t.from.id === state.id && t.label !== "ε"
        );

        validAlphabet.forEach((symbol) => {
          const matches = outgoing.filter((t) => t.label === symbol);
          if (matches.length === 0) {
            dfaErrors.push(
              `DFA state '${stateLabel}' is missing a transition for symbol '${symbol}'.`
            );
          } else if (matches.length > 1) {
            dfaErrors.push(
              `DFA state '${stateLabel}' has multiple transitions for symbol '${symbol}'.`
            );
          }
        });
      });
    }

    // -- Here you can add more validation rules for NFA, etc. --
    const generalErrors = validateAutomaton(
      automatonType,
      validStates,
      validTransitions,
      validAlphabet
    );

    // Show all errors
    const allErrors = [...dfaErrors, ...generalErrors];
    if (allErrors.length > 0) {
      alert("Validation errors:\n" + allErrors.join("\n"));
    } else {
      alert("Automaton is valid.");
    }
  };

  // Group transitions (not self-loops) by from-to pair
  const grouped = {};
  transitions.forEach((t, i) => {
    if (t.from.id !== t.to.id) {
      const key = `${t.from.id}->${t.to.id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ ...t, _idx: i });
    }
  });

  // Group self-loops by state
  const selfLoopsByState = {};
  transitions.forEach((t, i) => {
    if (t.from.id === t.to.id) {
      if (!selfLoopsByState[t.from.id]) selfLoopsByState[t.from.id] = [];
      selfLoopsByState[t.from.id].push({ label: t.label, i });
    }
  });

  return (
    <>
      <div style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "rgba(255,255,255,0.97)",
        padding: "8px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px 0 #0001"
      }}>
        <button onClick={validate}>Validate Automaton</button>
      </div>
      <svg ref={canvasRef} style={{ width: "100%", height: "100vh", background: "#fff" }} onClick={handleClick}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
          </marker>
        </defs>

        {/* Render grouped transitions (as curves) */}
        {Object.entries(grouped).map(([key, ts]) => {
          const { from, to } = ts[0];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dr = Math.sqrt(dx * dx + dy * dy);

          return ts.map((t, j) => {
            // alternate direction for curves
            const direction = j % 2 === 0 ? 1 : -1;
            const offset = (Math.floor(j / 2) + 1) * 25 * direction;
            const cx = (from.x + to.x) / 2 - offset * (dy / dr);
            const cy = (from.y + to.y) / 2 + offset * (dx / dr);

            return (
              <g key={t._idx}>
                <path
                  d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                  fill="transparent"
                  stroke="black"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={cx}
                  y={cy - 5}
                  fontSize="12"
                  textAnchor="middle"
                  onContextMenu={e => {
                    e.preventDefault();
                    if (e.shiftKey) removeTransition(t._idx);
                  }}
                >
                  {t.label}
                </text>
              </g>
            );
          });
        })}

        {/* Render grouped self-loops */}
        {Object.entries(selfLoopsByState).map(([stateId, loops]) => {
          const s = states.find(st => st.id === +stateId);
          if (!s) return null;
          // Remove duplicate labels
          const allLabels = [...new Set(loops.map(l => l.label))].join(", ");
          return (
            <g key={stateId}>
              <path
                d={`M ${s.x} ${s.y - 20} C ${s.x - 30} ${s.y - 60}, ${s.x + 30} ${s.y - 60}, ${s.x} ${s.y - 20}`}
                fill="transparent"
                stroke="black"
                markerEnd="url(#arrow)"
              />
              <text
                x={s.x}
                y={s.y - 70}
                fontSize="12"
                textAnchor="middle"
                onContextMenu={e => {
                  e.preventDefault();
                  if (e.shiftKey) {
                    setTransitions(transitions.filter(t => !(t.from.id === s.id && t.to.id === s.id)));
                  }
                }}
              >
                {allLabels}
              </text>
            </g>
          );
        })}

        {/* Render states */}
        {states.map((s, i) => (
          <g key={i}>
            <circle
              cx={s.x}
              cy={s.y}
              r="20"
              fill={highlightedStates.includes(s.id)
                ? "lime"
                : stepData && stepData.current?.id === s.id
                ? "orange"
                : "lightblue"}
              stroke="black"
              strokeWidth={highlightedStates.includes(s.id) ? 3 : 1}
              onContextMenu={(e) => {
                e.preventDefault();
                if (e.shiftKey) {
                  removeState(i);
                } else {
                  handleRightClick(e, i);
                }
              }}
              onDoubleClick={() => handleDoubleClick(i)}
            />
            <text x={s.x - 10} y={s.y + 5} fontSize="14">
              {s.role === "start" ? "→" : ""}
              {s.role === "accept" ? "✔" : ""}
            </text>
            <text
              x={s.x}
              y={s.y + 35}
              fontSize="13"
              textAnchor="middle"
              style={{ userSelect: "none" }}
            >
              {s.name || `q${i}`}
            </text>
          </g>
        ))}
      </svg>

      {pendingTransition && (
        <div
          style={{
            position: "absolute",
            left: pendingTransition.x + 40,
            top: pendingTransition.y,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 10,
            zIndex: 5,
            boxShadow: "0 4px 18px 0 #0002",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ marginBottom: 6 }}>Choose a symbol:</div>
          <div style={{ display: "flex", gap: 8 }}>
            {alphabet.map((symbol) => (
              <button
                key={symbol}
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  border: "1px solid #007bff",
                  background: "#e9f2ff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setTransitions((prev) => [
                    ...prev,
                    { from: pendingTransition.from, to: pendingTransition.to, label: symbol },
                  ]);
                  setPendingTransition(null);
                }}
              >
                {symbol}
              </button>
            ))}
            {/* Optionally, allow epsilon for NFA/e-NFA */}
            {(automatonType === "NFA" || automatonType === "ε-NFA") && (
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  border: "1px solid #aaa",
                  background: "#fafafa",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setTransitions((prev) => [
                    ...prev,
                    { from: pendingTransition.from, to: pendingTransition.to, label: "ε" },
                  ]);
                  setPendingTransition(null);
                }}
              >
                ε
              </button>
            )}
            <button
              style={{
                padding: "6px 12px",
                borderRadius: 5,
                border: "1px solid #e00",
                background: "#fee",
                color: "#e00",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={() => setPendingTransition(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
