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

document.addEventListener('DOMContentLoaded', async () => {

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

  // --- Camera ---
  const aspect = window.innerWidth / window.innerHeight
  const camera = new THREE.PerspectiveCamera(80, aspect)

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

  // --- Lights ---
  const { group: lightsGroup, spotlight } = createLights()
  scene.add(lightsGroup)

  // --- Audio System ---
  const audio = createAudioSystem()

  // Load audio files 
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

    const { x, z } = player.getPosition()
    const { cosDir, sinDir } = player.getDirection()

    spotlight.position.set(x, 0, z)
    spotlight.target.position.set(x + cosDir, -0.1, z + sinDir)

    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(drawFrame)
})
