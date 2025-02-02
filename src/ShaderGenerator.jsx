import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ShaderGenerator() {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  // Fixed vertex shader that never changes
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const defaultFragmentShader = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;

  // Remove shaderCode state and only use fragmentShader
  const [fragmentShader, setFragmentShader] = useState(defaultFragmentShader);
  let animationFrameId;

  useEffect(() => {
    initWebGL(fragmentShader);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [fragmentShader]);

  const generateShader = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/generate_shader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('Raw shader response:', data.shader_code); // Debug log
      
      if (response.ok) {
        if (!data.shader_code) {
          setError('Server response missing shader code');
          return;
        }

        // Extract only the fragment shader part if both are present
        const fragmentOnly = data.shader_code.split('// Fragment Shader')[1] || data.shader_code;
        setFragmentShader(fragmentOnly.trim());

      } else {
        setError(data.error || 'Failed to generate shader');
      }
    } catch (err) {
      console.error('Server error:', err);
      setError(`Failed to connect to server: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initWebGL = (fsSource) => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      setError('WebGL not supported');
      return;
    }

    // Always use the fixed vertex shader
    const program = createProgram(gl, vertexShaderSource, fsSource);
    if (!program) return;

    // Set up a full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Set up attributes and uniforms
    const positionLocation = gl.getAttribLocation(program, 'position');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Animation loop
    let startTime = Date.now();
    function render() {
      const time = (Date.now() - startTime) * 0.001; // time in seconds
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      if (timeLocation) {
        gl.uniform1f(timeLocation, time);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render();
  };

  function createProgram(gl, vsSource, fsSource) {
    const program = gl.createProgram();
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    if (!vertexShader || !fragmentShader) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setError(`Link error: ${gl.getProgramInfoLog(program)}`);
      return null;
    }

    return program;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      setError(`Compile error: ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  return (
    <div className="shader-generator">
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the shader you want (e.g., 'A rotating cube with a gradient background') or 'test shader' to check if the server is working"
          rows={4}
        />
        <button 
          onClick={generateShader}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate Shader'}
        </button>
      </div>

      <div className="output-section">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{ border: '1px solid #ccc' }}
        />
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h3>Fragment Shader</h3>
          <textarea
            className="shader-code"
            value={fragmentShader}
            onChange={(e) => {
              const newCode = e.target.value;
              setFragmentShader(newCode);
              try {
                initWebGL(newCode);
              } catch (err) {
                setError(`WebGL Error: ${err.message}`);
              }
            }}
            rows={15}
            spellCheck="false"
            style={{
              fontFamily: 'monospace',
              width: '100%',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1rem',
              border: '1px solid #333'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ShaderGenerator; 