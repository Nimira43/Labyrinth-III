import {
  MOVE_SPEED,
  TURN_SPEED,
  JUMP_DURATION,
  JUMP_BASE_HEIGHT,
  JUMP_AMPLITUDE
} from './config.js'

export function createPlayerController(labyrinth, audio) {
  let x = 1
  let z = 2

  let direction = 0
  let cosDir = Math.cos(direction)
  let sinDir = Math.sin(direction)

  let isTurningLeft = false
  let isTurningRight = false
  let isMovingForward = false

  let time = 0
  let jumpTime = -1000

  function handleKeyDown(event) {
    if (event.code === 'Space') {
      jumpTime = time
      audio.play('jump', 0.6)
    }

    if (event.code === 'ArrowUp') {
      isMovingForward = true
      audio.play('step', 0.2)
    }

    if (event.code === 'ArrowLeft') isTurningLeft = true
    if (event.code === 'ArrowRight') isTurningRight = true
  }

  function handleKeyUp(event) {
    if (event.code === 'ArrowLeft') isTurningLeft = false
    if (event.code === 'ArrowRight') isTurningRight = false
    if (event.code === 'ArrowUp') isMovingForward = false
  }

  function canMoveTo(nx, nz) {
    for (let i = -5; i <= 5; i++) {
      const testX = Math.round(nx + 0.3 * Math.cos(direction + i / 5))
      const testZ = Math.round(nz + 0.3 * Math.sin(direction + i / 5))
      if (labyrinth.isWall(testX, testZ)) return false
      return true
    }
  }

  function update() {
    time++

    if (isTurningLeft) direction -= TURN_SPEED
    if (isTurningRight) direction += TURN_SPEED

    cosDir = Math.cos(direction)
    sinDir = Math.sin(direction)

    if (isMovingForward) {
      const nx = x + 0.1 * cosDir
      const nz = z + 0.1 * sinDir

      if (canMoveTo(nx, nz)) {
        x += MOVE_SPEED * cosDir
        z += MOVE_SPEED * sinDir
      } else if (canMoveTo(x - 0.1 * cosDir, z + 0.05 * sinDir)) {
        z += MOVE_SPEED * sinDir
      } else if (canMoveTo(x + 0.05 * cosDir, z - 0.1 * sinDir)) {
        x += MOVE_SPEED * cosDir
      }
    }
  }

  function getJumpHeight() {
    if (time - jumpTime < JUMP_DURATION) {
      return (
        JUMP_BASE_HEIGHT +
        JUMP_AMPLITUDE *
          Math.cos(((time - jumpTime) / JUMP_DURATION) * 2 * Math.PI - Math.PI)
      )
    }
    return 0
  }

  return {
    update,
    handleKeyDown,
    handleKeyUp,
    getPosition: () => ({ x, z }),
    getDirection: () => ({ direction, cosDir, sinDir }),
    getJumpHeight
  }
}
