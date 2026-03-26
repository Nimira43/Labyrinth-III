// cameraRig.js
import {
  CAMERA_LOOK_AHEAD,
  CAMERA_HEIGHT_MULTIPLIER
} from './config.js'

import * as THREE from 'three'

export function createCameraRig(camera) {
  const lookTarget = new THREE.Vector3()

  function update(player) {
    const { x, z } = player.getPosition()
    const { direction, cosDir, sinDir } = player.getDirection()
    const jumpHeight = player.getJumpHeight()

    camera.position.set(
      x - 0.1 * cosDir,
      jumpHeight,
      z - 0.1 * sinDir
    )

    lookTarget.set(
      x + CAMERA_LOOK_AHEAD * cosDir,
      CAMERA_HEIGHT_MULTIPLIER * jumpHeight,
      z + CAMERA_LOOK_AHEAD * sinDir
    )

    camera.lookAt(lookTarget)
  }

  return { update }
}
