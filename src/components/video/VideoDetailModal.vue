<template>
  <Teleport to="body">
    <Transition name="video-modal">
      <div v-if="visible" class="video-modal-overlay" @click.self="handleClose">
        <div class="video-modal">
          <!-- 标题 -->
          <div class="video-modal-header">
            <span class="video-modal-title">{{ data?.name }}</span>
          </div>

          <!-- 关闭按钮 -->
          <button class="video-modal-close" @click="handleClose">
            <el-icon><Close /></el-icon>
          </button>

          <!-- 视频播放器 -->
          <div class="video-player-wrapper">
            <video
              ref="videoRef"
              :src="data?.url"
              class="video-element"
              @timeupdate="handleTimeUpdate"
              @loadedmetadata="handleLoadedMetadata"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              @ended="isPlaying = false"
              @click="togglePlay"
            />

            <!-- 自定义控制栏 -->
            <div class="video-controls">
              <!-- 播放/暂停按钮 -->
              <button class="control-btn play-btn" @click="togglePlay">
                <el-icon v-if="!isPlaying"><VideoPlay /></el-icon>
                <el-icon v-else><VideoPause /></el-icon>
              </button>

              <!-- 当前时间 -->
              <span class="time-display">{{ formatTime(currentTime) }}</span>

              <!-- 进度条 -->
              <div class="progress-bar" @click="seekVideo">
                <div class="progress-track">
                  <div class="progress-filled" :style="{ width: progressPercent + '%' }" />
                  <div class="progress-thumb" :style="{ left: progressPercent + '%' }" />
                </div>
              </div>

              <!-- 总时长 -->
              <span class="time-display">{{ formatTime(duration) }}</span>

              <!-- 倍速按钮 -->
              <el-popover placement="top" :width="120" trigger="click">
                <template #reference>
                  <button class="control-btn speed-btn">{{ playbackRate }}x</button>
                </template>
                <div class="speed-options">
                  <div
                    v-for="speed in speedOptions"
                    :key="speed"
                    :class="['speed-item', { active: playbackRate === speed }]"
                    @click="setPlaybackRate(speed)"
                  >
                    {{ speed }}x
                  </div>
                </div>
              </el-popover>

              <!-- 上一曲 -->
              <button class="control-btn" @click="$emit('prev')">
                <el-icon><DArrowLeft /></el-icon>
              </button>

              <!-- 下一曲 -->
              <button class="control-btn" @click="$emit('next')">
                <el-icon><DArrowRight /></el-icon>
              </button>

              <!-- 音量控制 -->
              <div class="volume-control">
                <button class="control-btn" @click="toggleMute">
                  <el-icon v-if="isMuted || volume === 0"><Mute /></el-icon>
                  <el-icon v-else><Microphone /></el-icon>
                </button>
                <div class="volume-slider-wrapper">
                  <input
                    type="range"
                    class="volume-slider"
                    min="0"
                    max="100"
                    :value="isMuted ? 0 : volume"
                    @input="handleVolumeChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Close, VideoPlay, VideoPause, DArrowLeft, DArrowRight, Mute, Microphone } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible', 'prev', 'next'])

const videoRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(100)
const isMuted = ref(false)
const playbackRate = ref(1)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

const progressPercent = ref(0)

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 播放/暂停切换
const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}

// 时间更新
const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  progressPercent.value = (videoRef.value.currentTime / videoRef.value.duration) * 100 || 0
}

// 元数据加载完成
const handleLoadedMetadata = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

// 进度条点击
const seekVideo = (e) => {
  if (!videoRef.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * videoRef.value.duration
}

// 倍速设置
const setPlaybackRate = (rate) => {
  playbackRate.value = rate
  if (videoRef.value) {
    videoRef.value.playbackRate = rate
  }
}

// 静音切换
const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

// 音量变化
const handleVolumeChange = (e) => {
  if (!videoRef.value) return
  const val = Number(e.target.value)
  volume.value = val
  videoRef.value.volume = val / 100
  isMuted.value = val === 0
}

// 关闭弹窗
const handleClose = () => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  emit('update:visible', false)
}

// 监听 visible 变化，打开时重置状态
watch(() => props.visible, (val) => {
  if (val) {
    currentTime.value = 0
    duration.value = 0
    progressPercent.value = 0
    isPlaying.value = false
    playbackRate.value = 1
    volume.value = 100
    isMuted.value = false
  }
})

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.src = ''
  }
})
</script>

<style scoped>
.video-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.video-modal {
  position: relative;
  width: 90vw;
  max-width: 1200px;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
}

.video-modal-header {
  padding: 16px 20px;
}

.video-modal-title {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.video-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.video-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  background: #000;
}

.video-element {
  width: 100%;
  max-height: 70vh;
  display: block;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.play-btn {
  width: 40px;
  height: 40px;
  background: #1d4ed8;
  font-size: 18px;
}

.play-btn:hover {
  background: #2563eb;
}

.speed-btn {
  width: auto;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.time-display {
  color: #fff;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.progress-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #1d4ed8;
  border-radius: 2px;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.speed-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.speed-item {
  padding: 6px 12px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
}

.speed-item:hover {
  background-color: #f5f7fa;
}

.speed-item.active {
  background-color: #1d4ed8;
  color: white;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-slider-wrapper {
  width: 80px;
}

.volume-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 弹窗过渡动画 */
.video-modal-enter-active,
.video-modal-leave-active {
  transition: opacity 0.3s ease;
}

.video-modal-enter-active .video-modal,
.video-modal-leave-active .video-modal {
  transition: transform 0.3s ease;
}

.video-modal-enter-from,
.video-modal-leave-to {
  opacity: 0;
}

.video-modal-enter-from .video-modal,
.video-modal-leave-to .video-modal {
  transform: scale(0.95);
}
</style>
