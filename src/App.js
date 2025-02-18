import React, { useState } from 'react';
import CalculatorComponent from './Calculator';
import ShaderGenerator from './ShaderGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [userInput, setUserInput] = useState("");
  const [calcResult, setCalcResult] = useState(null);

  const handleCalculate = () => {
    fetch('http://localhost:4000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput })
    })
      .then(response => response.json())
      .then(data => setCalcResult(data.result))
      .catch(error => console.error('Error calling calculate endpoint:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button 
            className={`tab-button ${activeTab === 'shader' ? 'active' : ''}`}
            onClick={() => setActiveTab('shader')}
          >
            Shader Generator
          </button>
        </div>
        
        {activeTab === 'calculator' ? (
          <>
            <h1>WASM Calculator</h1>
            <input
              type="text"
              placeholder="Enter your input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button onClick={handleCalculate}>Calculate</button>
            {calcResult && <p>Result: {calcResult}</p>}
            <CalculatorComponent />
          </>
        ) : (
          <>
            <h1>Shader Generator</h1>
            <ShaderGenerator />
          </>
        )}
      </header>
    </div>
  );
}

export default App; 