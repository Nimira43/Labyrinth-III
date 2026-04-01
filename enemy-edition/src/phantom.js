// phantom.js
import * as THREE from 'three'

export function createBroadcastPhantom() {
  // --- Geometry (tall, stretched humanoid silhouette) ---
  const geometry = new THREE.PlaneGeometry(0.6, 2.2, 32, 32)

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
        // Radial edge fade (curved silhouette)
        float dist = distance(vUv, vec2(0.5));
        float edgeFade = smoothstep(0.4, 0.7, dist);

        // Base darkness
        float base = fade * 0.4 + noise + scan;

        // Chromatic drift (subtle)
        float r = base + chromaOffset;
        float g = base;
        float b = base - chromaOffset;

        // Dark silhouette
        float fogBoost = smoothstep(0.0, 0.7, fadeAlpha);
        vec3 color = vec3(r, g, b) * (0.6 + fogBoost * 0.5);

        // Alpha controls visibility
        float alpha = fade * 0.9 * fadeAlpha * (1.0 - edgeFade);
        float shimmer = sin(vUv.y * 40.0 + time * 5.0) * 0.02;
        alpha += shimmer;
        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const phantom = new THREE.Mesh(geometry, material)
  phantom.lockOn = 0        // 0 → 1
  phantom.drain = 0         // 0 → 1
  phantom.manifestCooldown = 0
  phantom.isManifesting = false
  phantom.position.set(0, 1.1, 0) // base offset - overridden in main

  // Board + gaze‑based visibility
  phantom.update = function (camera, time, playerPos) {
    this.lookAt(camera.position)
    this.material.uniforms.time.value = time

    // --- Visibility Logic ---
    const toPhantom = new THREE.Vector3().subVectors(this.position, camera.position).normalize()
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const dot = camForward.dot(toPhantom)

    const lookingAtPhantom = dot > 0.75

    // Fade logic
    const targetAlpha = lookingAtPhantom ? 0.0 : 1.0
    const currentAlpha = this.material.uniforms.fadeAlpha.value
    this.material.uniforms.fadeAlpha.value = THREE.MathUtils.lerp(currentAlpha, targetAlpha, 0.05)

    // --- Distance ---
    const phantomPos = this.position
    const dx = phantomPos.x - playerPos.x
    const dz = phantomPos.z - playerPos.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    // Pull Phantom slightly closer when fog is heavy
    if (distance > 4 && this.lockOn > 0.2) {
      const pull = (this.lockOn * 0.002)
      this.position.x -= dx * pull
      this.position.z -= dz * pull
    }

    const desiredDist = 4.5

    // --- Lock-on Logic ---
    if (!lookingAtPhantom && distance < 10) {
      this.lockOn += 0.006
    } else {
      this.lockOn -= 0.01
    }
    this.lockOn = THREE.MathUtils.clamp(this.lockOn, 0, 1)

    // Distortion escalation during lock-on
    if (this.lockOn > 0.3) {
      this.position.x += Math.sin(time * 4) * 0.002 * this.lockOn
      this.position.z += Math.cos(time * 3.7) * 0.002 * this.lockOn
    }

    // --- Manifestation Event ---
    if (this.lockOn >= 1 && !this.isManifesting && this.manifestCooldown <= 0) {
      this.isManifesting = true

      const behindAngle = Math.atan2(camForward.z, camForward.x) + Math.PI
      const radius = 2.5

      this.position.set(
        playerPos.x + Math.cos(behindAngle) * radius,
        1.1,
        playerPos.z + Math.sin(behindAngle) * radius
      )

      // Randomised subtle vs soft-intense
      if (Math.random() < 0.5) {
        // Subtle flicker
        this.material.uniforms.fadeAlpha.value = 1.0
        setTimeout(() => {
          this.material.uniforms.fadeAlpha.value = 0.0
          this.isManifesting = false
        }, 120)
      } else {
        // Soft distortion surge
        this.material.uniforms.fadeAlpha.value = 1.0
        setTimeout(() => {
          this.material.uniforms.fadeAlpha.value = 0.0
          this.isManifesting = false
        }, 220)
      }

      this.lockOn = 0
      this.manifestCooldown = 300 // frames
    }

    if (this.manifestCooldown > 0) {
      this.manifestCooldown--
    }
                                                                                                                      
    // --- Signal Drain
    if (!lookingAtPhantom && this.manifestCooldown > 0) {
      this.drain += 0.002
    } else {
      this.drain -= 0.01
    }
    this.drain = THREE.MathUtils.clamp(this.drain, 0, 1)

    // Drain effects (movement slowdown etc.)
    if (this.drain > 0.1) {
      // Hook into player movement later
    }

    // --- Movement (refined drift/orbit logic) ---
    // Idle drift
    this.position.x += Math.sin(time * 0.3) * 0.003
    this.position.z += Math.cos(time * 0.27) * 0.003

    // Maintain orbit
    if (distance < desiredDist - 0.5) {
      const dirOut = new THREE.Vector3(dx, 0, dz).normalize()
      this.position.x += dirOut.x * 0.01
      this.position.z += dirOut.z * 0.01
    }

    if (distance > desiredDist + 0.5 && !lookingAtPhantom) {
      const dirIn = new THREE.Vector3(
        playerPos.x - phantomPos.x,
        0,
        playerPos.z - phantomPos.z
      ).normalize()

      this.position.x += dirIn.x * 0.012
      this.position.z += dirIn.z * 0.012
    }

    // Orbit drift
    if (!lookingAtPhantom) {
      const tangent = new THREE.Vector3(-dz, 0, dx).normalize()
      this.position.x += tangent.x * 0.004
      this.position.z += tangent.z * 0.004
    }

    // Jitter
    if (Math.random() < 0.003) {
      this.position.x += (Math.random() - 0.5) * 0.1
      this.position.z += (Math.random() - 0.5) * 0.1
    }

    // --- Soft Drift Reposition (no teleport pops) ---
    if (distance > 20) {
      const angle = Math.random() * Math.PI * 2
      const radius = desiredDist + (Math.random() * 2 - 1)

      const targetX = playerPos.x + Math.cos(angle) * radius
      const targetZ = playerPos.z + Math.sin(angle) * radius

      // Smooth ghost-like drift toward the new position
      this.position.x = THREE.MathUtils.lerp(this.position.x, targetX, 0.05)
      this.position.z = THREE.MathUtils.lerp(this.position.z, targetZ, 0.05)
    }
  }
  return phantom
}
