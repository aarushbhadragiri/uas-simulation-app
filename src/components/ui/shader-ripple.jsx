"use client";

import { useEffect, useRef } from "react";

export function ShaderRipple({
  loopDuration = 0.9,
  waveIntensity = 0.2,
  timeScale = 1,
  backgroundColor = "#000000",
  color1 = "#1a1a2e",
  color2 = "#16213e", 
  color3 = "#0f3460",
  rotation = 0,
  mod = 0.5,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_loopDuration;
      uniform float u_waveIntensity;
      uniform float u_timeScale;
      uniform float u_rotation;
      uniform float u_mod;
      uniform vec3 u_backgroundColor;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;

      vec2 rotate(vec2 uv, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c) * uv;
      }

      void main() {
        vec2 uv = v_uv - 0.5;
        uv = rotate(uv, u_rotation * 3.14159 / 180.0);
        uv += 0.5;
        
        float t = u_time * u_timeScale;
        float dist = length(uv - 0.5);
        
        float wave1 = sin(dist * 20.0 - t * 3.0) * u_waveIntensity;
        float wave2 = sin(dist * 15.0 - t * 2.5 + 1.0) * u_waveIntensity * 0.8;
        float wave3 = sin(dist * 25.0 - t * 3.5 + 2.0) * u_waveIntensity * 0.6;
        
        float wave = wave1 + wave2 + wave3;
        wave = wave * u_mod;
        
        float loopT = mod(t, u_loopDuration) / u_loopDuration;
        
        vec3 color = u_backgroundColor;
        color = mix(color, u_color1, smoothstep(0.0, 0.3, wave + 0.5));
        color = mix(color, u_color2, smoothstep(0.3, 0.6, wave + 0.5));
        color = mix(color, u_color3, smoothstep(0.6, 1.0, wave + 0.5));
        
        float ripple = sin(dist * 30.0 - t * 4.0);
        ripple = smoothstep(-0.1, 0.1, ripple) * 0.1;
        color += ripple * u_color3;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [0, 0, 0];
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const loopDurationLocation = gl.getUniformLocation(program, "u_loopDuration");
    const waveIntensityLocation = gl.getUniformLocation(program, "u_waveIntensity");
    const timeScaleLocation = gl.getUniformLocation(program, "u_timeScale");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const modLocation = gl.getUniformLocation(program, "u_mod");
    const backgroundColorLocation = gl.getUniformLocation(program, "u_backgroundColor");
    const color1Location = gl.getUniformLocation(program, "u_color1");
    const color2Location = gl.getUniformLocation(program, "u_color2");
    const color3Location = gl.getUniformLocation(program, "u_color3");

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render(time) {
      resize();
      
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(loopDurationLocation, loopDuration);
      gl.uniform1f(waveIntensityLocation, waveIntensity);
      gl.uniform1f(timeScaleLocation, timeScale);
      gl.uniform1f(rotationLocation, rotation);
      gl.uniform1f(modLocation, mod);
      gl.uniform3fv(backgroundColorLocation, hexToRgb(backgroundColor));
      gl.uniform3fv(color1Location, hexToRgb(color1));
      gl.uniform3fv(color2Location, hexToRgb(color2));
      gl.uniform3fv(color3Location, hexToRgb(color3));

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    }

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loopDuration, waveIntensity, timeScale, backgroundColor, color1, color2, color3, rotation, mod]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}

export default ShaderRipple;
