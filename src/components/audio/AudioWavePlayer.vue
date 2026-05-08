<template>
  <div class="audio-wave-player">
    <div ref="waveformRef" class="waveform-container"></div>
    <div v-if="showControls" class="controls-bar">
      <el-popover v-if="showSpeed" placement="top" :width="200" trigger="click">
        <template #reference>
          <el-button class="speed-btn" size="small">
            {{ currentSpeed }}x
          </el-button>
        </template>
        <div class="speed-options">
          <div
            v-for="speed in speedOptions"
            :key="speed"
            class="speed-item"
            :class="{ active: currentSpeed === speed }"
            @click="setPlaybackRate(speed)"
          >
            {{ speed }}x
          </div>
        </div>
      </el-popover>
      <el-button :icon="VideoPlay" circle size="small" style="transform: rotate(180deg)" @click="$emit('prev')" />
      <el-button circle size="small" @click="togglePlay">
        <el-icon v-if="!isPlaying"><VideoPlay /></el-icon>
        <el-icon v-else><VideoPause /></el-icon>
      </el-button>
      <el-button :icon="VideoPlay" circle size="small" @click="$emit('next')" />
      <el-popover placement="top" :width="200" trigger="click">
        <template #reference>
          <el-button :icon="Microphone" circle size="small" />
        </template>
        <div class="volume-control">
          <el-slider v-model="volumeValue" :min="0" :max="100" @change="handleVolumeChange" />
        </div>
      </el-popover>
      <span class="time-display">{{ currentTime }} / {{ duration }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import { VideoPlay, VideoPause, Microphone } from '@element-plus/icons-vue'

const props = defineProps({
  src: { type: String, default: '' },
  height: { type: Number, default: 80 },
  showControls: { type: Boolean, default: true },
  showSpeed: { type: Boolean, default: true },
  volume: { type: Number, default: 1 }
})

const emit = defineEmits(['play', 'pause', 'ended', 'prev', 'next'])

const waveformRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref('00:00')
const duration = ref('00:00')
const currentSpeed = ref(1)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
const volumeValue = ref(props.volume * 100)

let wavesurfer = null

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function play() {
  wavesurfer?.play()
}

function pause() {
  wavesurfer?.pause()
}

function togglePlay() {
  wavesurfer?.playPause()
}

function setPlaybackRate(rate) {
  currentSpeed.value = rate
  wavesurfer?.setPlaybackRate(rate)
}

const handleVolumeChange = (val) => {
  if (wavesurfer) {
    wavesurfer.setVolume(val / 100)
  }
}

onMounted(() => {
  wavesurfer = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#d1d5db',
    progressColor: '#1d4ed8',
    cursorColor: '#1d4ed8',
    height: props.height,
    barWidth: 2,
    barGap: 1
  })

  wavesurfer.on('ready', () => {
    duration.value = formatTime(wavesurfer.getDuration())
  })

  wavesurfer.on('audioprocess', () => {
    currentTime.value = formatTime(wavesurfer.getCurrentTime())
  })

  wavesurfer.on('play', () => {
    isPlaying.value = true
    emit('play')
  })

  wavesurfer.on('pause', () => {
    isPlaying.value = false
    emit('pause')
  })

  wavesurfer.on('finish', () => {
    isPlaying.value = false
    currentTime.value = formatTime(wavesurfer.getDuration())
    emit('ended')
  })

  if (props.src) {
    wavesurfer.load(props.src)
  }
})

watch(
  () => props.src,
  (newSrc) => {
    if (wavesurfer && newSrc) {
      wavesurfer.load(newSrc)
    }
  }
)

onBeforeUnmount(() => {
  wavesurfer?.destroy()
  wavesurfer = null
})

defineExpose({ play, pause, togglePlay, setPlaybackRate })
</script>

<style scoped lang="scss">
.audio-wave-player {
  width: 100%;
}

.waveform-container {
  width: 100%;
  margin-bottom: 8px;
}

.controls-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-btn {
  min-width: 50px;
}

.speed-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.speed-item {
  padding: 6px 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #1d4ed8;
    color: white;
  }
}

.time-display {
  font-size: 13px;
  color: #606266;
}

.volume-control {
  padding: 10px;
}
</style>
