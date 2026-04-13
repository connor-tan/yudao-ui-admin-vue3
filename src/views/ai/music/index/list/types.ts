export interface MusicSongVO {
  id: number
  title: string
  name?: string
  singer?: string
  imageUrl: string
  desc: string
  date: string
  lyric: string
  audioUrl: string
  videoUrl: string
}

export const createDefaultSong = (): MusicSongVO => ({
  id: 0,
  title: '',
  name: '',
  singer: '',
  imageUrl: '',
  desc: '',
  date: '',
  lyric: '',
  audioUrl: '',
  videoUrl: ''
})
