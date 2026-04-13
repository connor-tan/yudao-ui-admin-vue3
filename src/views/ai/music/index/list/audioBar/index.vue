<template>
  <div class="flex items-center justify-between px-2 h-72px bg-[var(--el-bg-color-overlay)] b-solid b-1 b-[var(--el-border-color)] b-l-none">
    <!-- 歌曲信息 -->
    <div class="flex gap-[10px]">
      <el-image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" class="w-[45px]"/>
      <div>
        <div>{{ currentSong.name || currentSong.title }}</div>
        <div class="text-[12px] text-gray-400">{{ currentSong.singer || '' }}</div>
      </div>
    </div>
      
    <!-- 音频controls -->
    <div class="flex gap-[12px] items-center">
      <Icon icon="majesticons:back-circle" :size="20" class="text-gray-300 cursor-pointer"/>
      <Icon :icon="audioProps.paused ? 'mdi:arrow-right-drop-circle' : 'solar:pause-circle-bold'" :size="30" class=" cursor-pointer" @click="toggleStatus('paused')"/>
      <Icon icon="majesticons:next-circle" :size="20" class="text-gray-300 cursor-pointer"/>
      <div class="flex gap-[16px] items-center">
        <span>{{ formatAudioTime(audioProps.currentTime) }}</span>
        <el-slider
          v-model="audioProps.currentTime"
          :max="audioProps.duration || 0"
          color="#409eff"
          class="w-[160px!important] "
          @change="handleSeek"
        />
        <span>{{ formatAudioTime(audioProps.duration) }}</span>
      </div>
      <!-- 音频 -->
      <audio
        :autoplay="audioProps.autoplay"
        :muted="audioProps.muted"
        ref="audioRef"
        controls
        v-show="false"
        @timeupdate="audioTimeUpdate"
      >
        <source :src="audioUrl"/>
      </audio>
    </div>

    <!-- 音量控制器 -->
    <div class="flex gap-[16px] items-center">
      <Icon :icon="audioProps.muted ? 'tabler:volume-off' : 'tabler:volume'" :size="20" class="cursor-pointer" @click="toggleStatus('muted')"/>
      <el-slider v-model="audioProps.volume" color="#409eff" class="w-[160px!important] " @change="handleVolumeChange"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatPast } from '@/utils/formatTime'
import audioUrl from '@/assets/audio/response.mp3'
import { createDefaultSong, type MusicSongVO } from '../types'

defineOptions({ name: 'Index' })

const currentSong = inject('currentSong', ref<MusicSongVO>(createDefaultSong()))

const audioRef = ref<HTMLAudioElement | null>(null)
// 音频相关属性https://www.runoob.com/tags/ref-av-dom.html
const audioProps = reactive({
  autoplay: true,
  paused: false,
  currentTime: 0,
  duration: 0,
  muted:  false,
  volume: 50,
})

const formatAudioTime = (value: number) => {
  return formatPast(new Date(value * 1000), 'mm:ss')
}

function toggleStatus (type: 'paused' | 'muted') {
  audioProps[type] = !audioProps[type]
  if (type === 'muted' && audioRef.value) {
    audioRef.value.muted = audioProps.muted
    return
  }
  if (type === 'paused' && audioRef.value) {
    if (audioProps[type]) {
      audioRef.value.pause()
    } else {
      void audioRef.value.play()
    }
  }
}

function handleSeek (value: number | number[]) {
  if (audioRef.value) {
    audioRef.value.currentTime = Array.isArray(value) ? value[0] : value
  }
}

function handleVolumeChange (value: number | number[]) {
  const nextValue = Array.isArray(value) ? value[0] : value
  if (audioRef.value) {
    audioRef.value.volume = nextValue / 100
  }
}

// 更新播放位置
function audioTimeUpdate (event: Event) {
  const target = event.target as HTMLAudioElement
  audioProps.currentTime = target.currentTime
  audioProps.duration = Number.isFinite(target.duration) ? target.duration : 0
  audioProps.paused = target.paused
  audioProps.muted = target.muted
  audioProps.volume = target.volume * 100
}
</script>
