// audio.js
export function createAudioSystem() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  const sounds = {}
  let ambienceSource = null
  let unlocked = false

  async function unlockAndStartAmbience() {
    if (!unlocked && audioContext.state === 'suspended') {
      await audioContext.resume()
      unlocked = true

      // Start ambience immediately after unlock
      if (sounds['ambience']) {
        playAmbience('ambience', 0.4)
      }
    }
  }

  // Unlock on any user gesture
  window.addEventListener('keydown', unlockAndStartAmbience, { once: true })
  window.addEventListener('mousedown', unlockAndStartAmbience, { once: true })
  window.addEventListener('touchstart', unlockAndStartAmbience, { once: true })

  async function loadSound(name, url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    sounds[name] = audioBuffer
  }

  function play(name, volume = 1.0) {
    if (!unlocked) return
    const buffer = sounds[name]
    if (!buffer) return

    const source = audioContext.createBufferSource()
    const gain = audioContext.createGain()

    source.buffer = buffer
    gain.gain.value = volume

    source.connect(gain).connect(audioContext.destination)
    source.start()
  }

  function playAmbience(name, volume = 0.5) {
    if (!unlocked) return
    stopAmbience()

    const buffer = sounds[name]
    if (!buffer) return

    const source = audioContext.createBufferSource()
    const gain = audioContext.createGain()

    source.buffer = buffer
    source.loop = true
    gain.gain.value = volume

    source.connect(gain).connect(audioContext.destination)
    source.start()

    ambienceSource = source
  }

  function stopAmbience() {
    if (ambienceSource) {
      ambienceSource.stop()
      ambienceSource = null
    }
  }

  return {
    loadSound,
    play,
    playAmbience,
    stopAmbience
  }
}
