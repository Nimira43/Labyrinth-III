import * as THREE from 'three'
import { LABYRINTH_WIDTH, LABYRINTH_HEIGHT } from './config.js'

export function createLights() {
  const group = new THREE.Group()

  // --- Ambient ---
  const ambient = new THREE.AmbientLight('#ffe8d0', 0.35)
  group.add(ambient)

  // --- Hemisphere ---
  const hemi = new THREE.HemisphereLight('#ffe7b3', '#8b4a00', 0.9)
  group.add(hemi)

  // --- Directional Key Light ---
  const keyLight = new THREE.DirectionalLight('#ffe7c2', 1.4)
  keyLight.position.set(LABYRINTH_WIDTH, 25, LABYRINTH_HEIGHT)
  keyLight.target.position.set(LABYRINTH_WIDTH / 2, 0, LABYRINTH_HEIGHT / 2)
  group.add(keyLight)
  group.add(keyLight.target)

  // --- Corner Lights ---
  const cornerIntensity = 1.8
  const cornerDistance = 90
  const cornerDecay = 2

  const corners = [
    [-LABYRINTH_WIDTH, 12, -LABYRINTH_HEIGHT],
    [ LABYRINTH_WIDTH, 12, -LABYRINTH_HEIGHT],
    [ LABYRINTH_WIDTH, 12,  LABYRINTH_HEIGHT],
    [-LABYRINTH_WIDTH, 12,  LABYRINTH_HEIGHT]
  ]

  corners.forEach(([x, y, z]) => {
    const light = new THREE.PointLight('#f8d1b0', cornerIntensity, cornerDistance, cornerDecay)
    light.position.set(x, y, z)
    group.add(light)
  })

  // --- Player Spotlight ---
  const spotlight = new THREE.SpotLight('#ffffff', 3.2, 18, 0.55, 0.5, 2)
  spotlight.target = new THREE.Object3D()
  group.add(spotlight)
  group.add(spotlight.target)

  return {
    group,
    spotlight
  }
}
