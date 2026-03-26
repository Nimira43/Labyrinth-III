import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

export function createDistortionPass() {
  const DistortionShader = {
    uniforms: {
      tDiffuse: { value: null },
      proximity: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float proximity;
      varying vec2 vUv;

      void main() {
        // UV wobble
        float wobble = sin(vUv.y * 40.0 + proximity * 20.0) * 0.002 * proximity;

        // Chromatic offset
        vec2 rUV = vUv + vec2(wobble, 0.0);
        vec2 gUV = vUv;
        vec2 bUV = vUv - vec2(wobble, 0.0);

        float r = texture2D(tDiffuse, rUV).r;
        float g = texture2D(tDiffuse, gUV).g;
        float b = texture2D(tDiffuse, bUV).b;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  }

  return new ShaderPass(DistortionShader)
}
