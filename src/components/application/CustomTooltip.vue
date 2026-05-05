<template>
  <div class="custom-tooltip-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot />
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="visible"
          ref="tooltipRef"
          class="custom-tooltip"
          :style="tooltipStyle"
        >
          <div :class="['tooltip-arrow', `arrow-${placement}`]"></div>
          <div class="tooltip-content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  placement: {
    type: String,
    default: 'top'
  },
  showAfter: {
    type: Number,
    default: 200
  }
})

const emit = defineEmits(['show', 'hide'])

const visible = ref(false)
const tooltipRef = ref(null)
const timer = ref(null)
const position = ref({ top: 0, left: 0 })

const tooltipStyle = computed(() => {
  return {
    top: `${position.value.top}px`,
    left: `${position.value.left}px`
  }
})

const showTooltip = (e) => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  timer.value = setTimeout(() => {
    visible.value = true
    emit('show')
    nextTick(() => {
      updatePosition(e.target)
    })
  }, props.showAfter)
}

const hideTooltip = () => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
  visible.value = false
  // visible.value = true
  emit('hide')
}

const updatePosition = (target) => {
  if (!target || !tooltipRef.value) return

  const targetRect = target.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

  let top, left

  switch (props.placement) {
    case 'top':
      top = targetRect.top + scrollTop - tooltipRect.height - 8
      left = targetRect.left + scrollLeft + (targetRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = targetRect.bottom + scrollTop + 8
      left = targetRect.left + scrollLeft + (targetRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = targetRect.top + scrollTop + (targetRect.height - tooltipRect.height) / 2
      left = targetRect.left + scrollLeft - tooltipRect.width - 8
      break
    case 'right':
      top = targetRect.top + scrollTop + (targetRect.height - tooltipRect.height) / 2
      left = targetRect.right + scrollLeft + 8
      break
    default:
      top = targetRect.top + scrollTop - tooltipRect.height - 8
      left = targetRect.left + scrollLeft + (targetRect.width - tooltipRect.width) / 2
  }

  position.value = { top, left }
}
</script>

<style scoped>
.custom-tooltip-wrapper {
  display: inline-block;
}

.tooltip-content {
  color: #262626;
}
</style>

<style>
.custom-tooltip {
  position: absolute;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: #262626;
  line-height: 1.5;
  max-width: 400px;
  word-wrap: break-word;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.arrow-top {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: #fff;
}

.arrow-top::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-top-color: #ffffff;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
}

.arrow-bottom {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #e4e7ed;
}

.arrow-bottom::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-bottom-color: #ffffff;
  top: 1px;
  left: 50%;
  transform: translateX(-50%);
}

.arrow-left {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: #e4e7ed;
}

.arrow-left::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-left-color: #ffffff;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-right {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: #e4e7ed;
}

.arrow-right::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-right-color: #ffffff;
  left: 1px;
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
