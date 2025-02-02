import React, { useState, useEffect } from 'react';
import init, { Calculator } from 'wasm-calculator';

function CalculatorComponent() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [calculator, setCalculator] = useState(null);

  useEffect(() => {
    init().then(() => {
      setCalculator(new Calculator());
    });
  }, []);

  const handleCalculate = () => {
    if (calculator) {
      try {
        const res = calculator.calculate(input);
        setResult(res.toString());
      } catch (error) {
        setResult('Error: ' + error);
      }
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter calculation (e.g., 2 + 2)"
      />
      <button onClick={handleCalculate}>Calculate</button>
      <div>Result: {result}</div>
    </div>
  );
}

export default CalculatorComponent; 