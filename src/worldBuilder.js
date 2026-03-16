// worldBuilder.js
import * as THREE from 'three'
import {
  LABYRINTH_WIDTH,
  LABYRINTH_HEIGHT
} from './config.js'

export function buildWorld(labyrinth) {
  const world = new THREE.Group()

  // --- Ground ---
  const innerGround = new THREE.Mesh(
    new THREE.BoxGeometry(LABYRINTH_WIDTH * 2 + 4, 0.1, LABYRINTH_HEIGHT * 2 + 4),
    new THREE.MeshPhongMaterial({
      color: '#cc3c07',
      shininess: 5
    })
  )
  innerGround.position.set(LABYRINTH_WIDTH - 1, -0.4, LABYRINTH_HEIGHT)
  world.add(innerGround)

  const outerGround = new THREE.Mesh(
    new THREE.BoxGeometry(2000, 0.1, 2000),
    new THREE.MeshPhongMaterial({
      color: '#d29b05',
      shininess: 0,
      specular: '#000000'
    })
  )
  outerGround.position.set(0, -0.5, 0)
  world.add(outerGround)

  // --- Goal ---
  const goalSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({
      color: '#ff9d00',
      shininess: 100,
      emissive: '#ffa500'
    })
  )
  goalSphere.position.set(2 * LABYRINTH_WIDTH - 3, 1.5, 2 * LABYRINTH_HEIGHT)
  world.add(goalSphere)

  // --- Walls & Borders ---
  const blockGeometry = new THREE.BoxGeometry(1, 1, 1)

  const labyrinthMaterial = new THREE.MeshPhongMaterial({
    color: '#d73e06',
    shininess: 10
  })

  const borderMaterial = new THREE.MeshPhongMaterial({
    color: '#510909'
  })

  const labyrinthGroup = new THREE.Group()
  const borderGroup = new THREE.Group()

  for (let x = 0; x < 2 * labyrinth.width + 1; x++) {
    for (let y = 0; y < 2 * labyrinth.height + 2; y++) {
      if (labyrinth.isWall(x, y)) {
        // Main wall block
        let wallMesh = new THREE.Mesh(blockGeometry, labyrinthMaterial)
        const wallHeight = 0.4 + 1.2 * Math.random()
        wallMesh.scale.set(1, wallHeight, 1)
        wallMesh.position.set(x, wallHeight / 2 - 0.5, y)
        labyrinthGroup.add(wallMesh)

        // Optional cap block
        if (wallHeight < 0.7) {
          const cap = wallMesh.clone()
          cap.scale.set(2, 0.2, 1)
          cap.position.set(x, 0.5, y)
          labyrinthGroup.add(cap)
        }

        // Border block
        const border = new THREE.Mesh(blockGeometry, borderMaterial)
        border.scale.set(1.05, 1, 1.05)
        border.position.set(x, -0.8, y)
        borderGroup.add(border)
      }
    }
  }

  world.add(labyrinthGroup)
  world.add(borderGroup)

  return world
}
