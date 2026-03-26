// postprocessing.js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import * as THREE from 'three'

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  // --- Bloom ---
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.25,
    0.0
  )
  composer.addPass(bloomPass)

  // --- Vignette ---
  const vignetteShader = {
    uniforms: {
      tDiffuse: { value: null },
      offset: { value: 1.0 },
      darkness: { value: 1.1 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform float offset;
      uniform float darkness;
      uniform sampler2D tDiffuse;
      varying vec2 vUv;

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float dist = distance(vUv, vec2(0.5));
        float vignette = smoothstep(0.5, offset, dist * darkness);
        texel.rgb *= (1.0 - vignette);
        gl_FragColor = texel;
      }
    `
  }
  const vignettePass = new ShaderPass(vignetteShader)
  composer.addPass(vignettePass)

  // --- Chromatic Aberration ---
  const aberrationShader = {
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.001 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float amount;
      varying vec2 vUv;

      void main() {
        vec2 offset = amount * vec2(0.5 - vUv.y, vUv.x - 0.5);

        float r = texture2D(tDiffuse, vUv + offset).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - offset).b;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  }
  const aberrationPass = new ShaderPass(aberrationShader)
  composer.addPass(aberrationPass)

  // --- Film Grain ---
  const grainShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      varying vec2 vUv;

      float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float noise = rand(vUv * time) * 0.08;
        gl_FragColor = vec4(texel.rgb + noise, texel.a);
      }
    `
  }
  const grainPass = new ShaderPass(grainShader)
  composer.addPass(grainPass)

  // --- CRT Scanlines ---
  const scanlineShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0.0 },
      intensity: { value: 0.15 },
      scanlineCount: { value: 800.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      uniform float scanlineCount;
      varying vec2 vUv;

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float line = sin(vUv.y * scanlineCount) * 0.5 + 0.5;
        texel.rgb *= mix(1.0, line, intensity);
        gl_FragColor = texel;
      }
    `
  }
  const scanlinePass = new ShaderPass(scanlineShader)
  composer.addPass(scanlinePass)

  return {
    composer,
    grainPass,
    vignettePass,
    aberrationPass,
    scanlinePass
  }
}
