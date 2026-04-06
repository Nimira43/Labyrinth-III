import * as THREE from 'three'

export function createMaterials() {
  return {
    wall: new THREE.MeshPhongMaterial({
      color: '#932d08',
      shininess: 10
    }),

    border: new THREE.MeshPhongMaterial({
      color: '#510909'
    }),

    innerGround: new THREE.MeshPhongMaterial({
      color: '#cc3c07',
      shininess: 5
    }),

    outerGround: new THREE.MeshPhongMaterial({
      color: '#d29b05',
      shininess: 0,
      specular: '#000000'
    }),

    goal: new THREE.MeshPhongMaterial({
      color: '#ff9d00',
      shininess: 100,
      emissive: '#ffa500'
    })
  }
}
