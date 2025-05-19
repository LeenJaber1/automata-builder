import React, { useState } from "react";
import { AutomatonCanvas } from "./components/AutomatonCanvas";
import { Toolbar } from "./components/ToolBar";
import { TestStringPanel } from "./components/TeststringPanel";
import { AutomatonContextProvider } from "./context/AutomatonContext";
import "./App.css";

export default function App() {
  return (
    <AutomatonContextProvider>
      <div className="app-container">
        <Toolbar />
        <div className="main-content">
          <AutomatonCanvas />
          <TestStringPanel />
        </div>
      </div>
    </AutomatonContextProvider>
  );
}