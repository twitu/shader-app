import React, { useState, useEffect, useRef } from 'react';

function ShaderGenerator() {
  const [prompt, setPrompt] = useState('');
  const [shaderCode, setShaderCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  // Default shader code
  const defaultShader = `
    // Vertex Shader
    attribute vec4 a_position;
    void main() {
      gl_Position = a_position;
    }
    
    // Fragment Shader
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;

  useEffect(() => {
    // Initialize with default shader
    initWebGL(defaultShader);
  }, []);

  const generateShader = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4000/api/generate_shader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShaderCode(data.shader_code);
        initWebGL(data.shader_code);
      } else {
        setError(data.error || 'Failed to generate shader');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const initWebGL = (shaderSource) => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      setError('WebGL not supported');
      return;
    }

    // Split shader source into vertex and fragment shaders
    const [vertexSource, fragmentSource] = shaderSource.split('// Fragment Shader');
    
    // Create shader program
    const program = createShaderProgram(gl, vertexSource, fragmentSource);
    if (!program) return;
    
    gl.useProgram(program);

    // Create a square
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];

    // Create and bind buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Set up attribute
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  function createShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize shader program:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
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
          placeholder="Describe the shader you want (e.g., 'A rotating cube with a gradient background')"
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

        {shaderCode && (
          <pre className="shader-code">
            {shaderCode}
          </pre>
        )}
      </div>
    </div>
  );
}

export default ShaderGenerator; 