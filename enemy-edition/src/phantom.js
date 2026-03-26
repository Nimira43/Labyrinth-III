// phantom.js
import * as THREE from 'three'

export function createBroadcastPhantom() {

  // --- Geometry (tall, stretched humanoid silhouette) ---
  const geometry = new THREE.PlaneGeometry(0.6, 2.2)

  // --- Shader Material ---
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      time: { value: 0 },
      noiseIntensity: { value: 0.35 },
      scanlineIntensity: { value: 0.25 },
      chromaOffset: { value: 0.0015 },
      fadeAlpha: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform float noiseIntensity;
      uniform float scanlineIntensity;
      uniform float chromaOffset;
      uniform float fadeAlpha;

      float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        // Noise flicker
        float noise = rand(vUv * time * 18.0) * noiseIntensity;

        // Horizontal scanlines
        float scan = sin(vUv.y * 900.0) * scanlineIntensity;

        // Vertical fade (legs taper)
        float fade = smoothstep(0.0, 0.2, vUv.y);

        // Base darkness
        float base = fade * 0.4 + noise + scan;

        // Chromatic drift (subtle)
        float r = base + chromaOffset;
        float g = base;
        float b = base - chromaOffset;

        // Dark silhouette
        vec3 color = vec3(r, g, b) * 0.6;

        // Alpha controls visibility
        float alpha = fade * 0.9 * fadeAlpha;

        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const phantom = new THREE.Mesh(geometry, material)
  phantom.position.set(0, 1.1, 0) // base offset; overridden in main

  // Board + gaze‑based visibility
  phantom.update = function (camera, time) {
    this.lookAt(camera.position)
    this.material.uniforms.time.value = time

    const toPhantom = new THREE.Vector3().subVectors(this.position, camera.position).normalize()
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)

    const dot = camForward.dot(toPhantom)

    // Looking at it → hide, looking away → show
    const targetAlpha = dot > 0.4 ? 0.0 : 1.0

    const currentAlpha = this.material.uniforms.fadeAlpha.value
    const newAlpha = THREE.MathUtils.lerp(currentAlpha, targetAlpha, 0.05)

    this.material.uniforms.fadeAlpha.value = newAlpha
  }

  return phantom
}
