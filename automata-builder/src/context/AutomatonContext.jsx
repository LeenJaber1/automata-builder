// context/AutomatonContext.jsx
import React, { createContext, useState } from "react";
import html2canvas from "html2canvas";

export const AutomatonContext = createContext();

export function AutomatonContextProvider({ children }) {
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [tool, setTool] = useState("state");
  const [automatonType, setAutomatonType] = useState("DFA");
  const [highlightedStates, setHighlightedStates] = useState([]);
  const [stepData, setStepData] = useState(null);
  const [alphabet, setAlphabet] = useState([]);

  const addState = ({ x, y, name }) => {
  const id = states.length;
  setStates([
    ...states,
    {
      x,
      y,
      id,
      role: "none",
      name: typeof name === "string" && name.trim() !== "" ? name : `q${id}`
    }
  ]);
};


  const simulateString = (input) => {
    const start = states.find((s) => s.role === "start");
    if (!start) return alert("No start state defined.");

    if (automatonType === "DFA") {
      let current = start;
      const path = [current.id];
      for (let char of input) {
        const t = transitions.find((tr) => tr.from.id === current.id && tr.label === char);
        if (!t) return alert(`No transition for '${char}' from state ${current.id}`);
        current = t.to;
        path.push(current.id);
      }
      setHighlightedStates(path);
      const accepted = current.role === "accept";
      alert(accepted ? "String Accepted" : "String Rejected");
    } else {
      simulateNFA(input, start);
    }
  };

  const simulateNFA = (input, start) => {
    let currentStates = epsilonClosure([start.id]);

    for (const char of input) {
      const nextStates = new Set();
      currentStates.forEach((id) => {
        transitions.forEach((t) => {
          if (t.from.id === id && t.label === char) {
            nextStates.add(t.to.id);
          }
        });
      });
      currentStates = epsilonClosure(Array.from(nextStates));
    }

    setHighlightedStates(currentStates);
    const accepted = currentStates.some((id) => states.find((s) => s.id === id && s.role === "accept"));
    alert(accepted ? "String Accepted" : "String Rejected");
  };

  const epsilonClosure = (stateIds) => {
    const closure = new Set(stateIds);
    const stack = [...stateIds];
    while (stack.length > 0) {
      const stateId = stack.pop();
      transitions.forEach((t) => {
        if (t.from.id === stateId && t.label === "ε" && !closure.has(t.to.id)) {
          closure.add(t.to.id);
          stack.push(t.to.id);
        }
      });
    }
    return Array.from(closure);
  };

  const startStepByStep = (input) => {
    const start = states.find((s) => s.role === "start");
    if (!start) return alert("No start state defined.");

    setStepData({ current: start, index: 0, input, path: [start.id] });
  };

  const nextStep = () => {
    if (!stepData) return;
    const { current, index, input, path } = stepData;
    if (index >= input.length) {
      setHighlightedStates(path);
      setStepData(null);
      alert(current.role === "accept" ? "String Accepted" : "String Rejected");
      return;
    }
    const t = transitions.find(
      (tr) => tr.from.id === current.id && tr.label === input[index]
    );
    if (!t) {
      setStepData(null);
      alert(`No transition for '${input[index]}' from state ${current.id}`);
      return;
    }
    setStepData({ current: t.to, index: index + 1, input, path: [...path, t.to.id] });
  };

  const stopStepMode = () => {
    setStepData(null);
    setHighlightedStates([]);
  };

  const clearHighlights = () => setHighlightedStates([]);

  const saveAutomaton = () => {
    const data = JSON.stringify({ states, transitions });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "automaton.json";
    a.click();
  };

  
  const exportImage = () => {
    const svg = document.querySelector("svg");
    html2canvas(svg.parentElement).then((canvas) => {
      const link = document.createElement("a");
      link.download = "automaton.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <AutomatonContext.Provider
      value={{
        states,
        transitions,
        setStates,
        setTransitions,
        tool,
        setTool,
        automatonType,
        setAutomatonType,
        addState,
        simulateString,
        startStepByStep,
        nextStep,
        stopStepMode,
        clearHighlights,
        saveAutomaton,
        exportImage,
        highlightedStates,
        stepData,
        alphabet,
        setAlphabet
      }}
    >
      {children}
    </AutomatonContext.Provider>
  );
}
