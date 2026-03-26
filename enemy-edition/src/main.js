// main.js
import * as THREE from 'three'
import './styles.css'

import {
  FOG_COLOUR,
  BACKGROUND_COLOUR
} from './config.js'

import { createLabyrinth } from './labyrinth.js'
import { createPlayerController } from './playerController.js'
import { createCameraRig } from './cameraRig.js'
import { buildWorld } from './worldBuilder.js'
import { createLights } from './lights.js'
import { createMaterials } from './materials.js' 
import { createAudioSystem } from './audio.js'
import { createPostProcessing } from './postprocessing.js'
import { createBroadcastPhantom } from './phantom.js'

document.addEventListener('DOMContentLoaded', async () => {
  let smoothProximity = 0

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  if ('useLegacyLights' in renderer) {
    renderer.useLegacyLights = true
  }

  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // --- Scene ---
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BACKGROUND_COLOUR)
  scene.fog = new THREE.FogExp2(FOG_COLOUR, 0.012)
  const baseFogDensity = 0.012

  // --- Camera ---
  const aspect = window.innerWidth / window.innerHeight
  const camera = new THREE.PerspectiveCamera(80, aspect)

  const {
    composer,
    grainPass,
    vignettePass,
    aberrationPass,
    scanlinePass
  } = createPostProcessing(renderer, scene, camera)

  // --- Starfield ---
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 5000
  const starPositions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 1800
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(Math.random() * 2 - 1)

    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
    starPositions[i + 2] = radius * Math.cos(phi)
  }

  starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(starPositions, 3)
  )

  const starMaterial = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 2.5,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.5,
    depthWrite: true,
    fog: false
  })

  const starField = new THREE.Points(starGeometry, starMaterial)
  starField.renderOrder = -9999
  scene.add(starField)

  // --- Labyrinth Data ---
  const labyrinth = createLabyrinth()

  // --- Materials ---
  const materials = createMaterials()

  // --- Build World ---
  const world = buildWorld(labyrinth, materials)
  scene.add(world)

  // --- Phantom ---
  const phantom = createBroadcastPhantom()
  phantom.position.set(5, 1.1, 5)
  scene.add(phantom)

  // --- Lights ---
  const { group: lightsGroup, spotlight } = createLights()
  scene.add(lightsGroup)

  // --- Audio System ---
  const audio = createAudioSystem()
  await audio.loadSound('ambience', '/audio/bg.mp3')
  await audio.loadSound('step', '/audio/steps.mp3')
  await audio.loadSound('jump', '/audio/jump.wav')

  // --- Player & Camera Systems ---
  const player = createPlayerController(labyrinth, audio)
  const cameraRig = createCameraRig(camera)

  document.addEventListener('keydown', player.handleKeyDown)
  document.addEventListener('keyup', player.handleKeyUp)

  // --- Frame Loop ---
  function drawFrame() {
    starField.rotation.y += 0.0002
    player.update()
    cameraRig.update(player)
    phantom.update(camera, performance.now() / 1000, player.getPosition())

    // --- Phantom Proximity Distortion ---
    const phantomPos = phantom.position
    const playerPos = player.getPosition()
    const dx = phantomPos.x - playerPos.x
    const dz = phantomPos.z - playerPos.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    // 0 = far, 1 = very close
    // Eased and smooth proximity
    let proximity = 1.0 - Math.min(distance / 8.0, 1.0)

    // Ease-in curve (softens the start)
    proximity = Math.pow(proximity, 2.5)

    // Smooth over time (removes popping)
    smoothProximity = THREE.MathUtils.lerp(smoothProximity, proximity, 0.05)

    // Fog uses smoothed proximity
    const targetFog = baseFogDensity + smoothProximity * 0.02
    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetFog, 0.02)

    // Fog thickens
    aberrationPass.uniforms.amount.value = 0.001 + smoothProximity * 0.01
    vignettePass.uniforms.darkness.value = 1.1 + smoothProximity * 1.5
    scanlinePass.uniforms.intensity.value = 0.15 + smoothProximity * 0.3
    // Grain animates
    grainPass.uniforms.time.value = performance.now() / 1000

    const { x, z } = player.getPosition()
    const { cosDir, sinDir } = player.getDirection()

    spotlight.position.set(x, 0, z)
    spotlight.target.position.set(x + cosDir, -0.1, z + sinDir)
    composer.render()
  }
  renderer.setAnimationLoop(drawFrame)
})
