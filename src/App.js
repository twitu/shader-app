import React from 'react';
import CalculatorComponent from './Calculator';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>WASM Calculator</h1>
        <CalculatorComponent />
      </header>
    </div>
  );
}

export default App; 