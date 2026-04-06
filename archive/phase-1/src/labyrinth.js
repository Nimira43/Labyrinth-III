import { LABYRINTH_WIDTH, LABYRINTH_HEIGHT } from './config.js'

export function generateLabyrinthGrid() {
  const width = LABYRINTH_WIDTH
  const height = LABYRINTH_HEIGHT

  const labyrinth = []
  const left = []
  const right = []

  let currentX
  let currentY

  function plotVerticalStart() {
    labyrinth[currentX][currentY] = true
    labyrinth[currentX][currentY + 1] = true
    currentX++
  }

  function plotVertical() {
    labyrinth[currentX + 1][currentY] = true
    labyrinth[currentX + 1][currentY + 1] = true
  }

  function plotHorizontal() {
    labyrinth[currentX][currentY + 1] = true
    labyrinth[currentX + 1][currentY + 1] = true
  }

  function plotNewRow() {
    currentX = 0
    currentY += 2
  }

  // --- original logic, but scoped inside this function ---
  for (let x = 0; x < 2 * width; x++) {
    labyrinth[x] = []
    for (let y = 0; y < 2 * height; y++) {
      labyrinth[x][y] = false
    }
  }

  currentX = 0
  currentY = 0
  left[0] = 1
  let remainingWidth = width

  while (remainingWidth) {
    left[remainingWidth] = remainingWidth
    right[remainingWidth] = remainingWidth
    remainingWidth--
    if (remainingWidth) {
      plotHorizontal()
    }
    currentX += 2
  }

  labyrinth[currentX - 2][currentY + 1] = true
  plotNewRow()
  plotVerticalStart()

  let remainingHeight = height
  while (remainingHeight > 1) {
    remainingHeight--
    let columnIndex = width
    while (columnIndex > 1) {
      columnIndex--
      let endIndex = left[columnIndex - 1]
      if (columnIndex !== endIndex && Math.random() > 0.5) {
        right[endIndex] = right[columnIndex]
        left[right[columnIndex]] = endIndex
        right[columnIndex] = columnIndex - 1
        left[columnIndex - 1] = columnIndex
      } else {
        plotVertical()
      }

      endIndex = left[columnIndex]
      if (columnIndex !== endIndex && Math.random() > 0.5) {
        right[endIndex] = right[columnIndex]
        left[right[columnIndex]] = endIndex
        left[columnIndex] = columnIndex
        right[columnIndex] = columnIndex
        plotHorizontal()
      }

      labyrinth[currentX + 1][currentY + 1] = true
      currentX += 2
    }

    plotNewRow()
    plotVerticalStart()
  }

  let columnIndex = width
  while (columnIndex > 1) {
    columnIndex--
    let endIndex = left[columnIndex - 1]
    if (
      columnIndex !== endIndex &&
      (columnIndex === right[columnIndex] || Math.random() > 0.5)
    ) {
      right[endIndex] = right[columnIndex]
      left[right[columnIndex]] = endIndex
      right[columnIndex] = columnIndex - 1
      left[columnIndex - 1] = columnIndex
    } else {
      plotVertical()
    }

    endIndex = left[columnIndex]
    right[endIndex] = right[columnIndex]
    left[right[columnIndex]] = endIndex
    left[columnIndex] = columnIndex
    right[columnIndex] = columnIndex
    plotHorizontal()
    currentX += 2
  }

  return labyrinth
}

export function createLabyrinth() {
  const grid = generateLabyrinthGrid()

  function isWall(x, y) {
    return grid[x] && grid[x][y]
  }

  function isFree(x, y) {
    return !isWall(x, y)
  }

  return {
    width: LABYRINTH_WIDTH,
    height: LABYRINTH_HEIGHT,
    grid,
    isWall,
    isFree
  }
}

