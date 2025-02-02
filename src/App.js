import React, { useState } from 'react';
import CalculatorComponent from './Calculator';
import ShaderGenerator from './ShaderGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

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