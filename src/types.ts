export type Emotion =
  | 'Happy'
  | 'Excited'
  | 'Peaceful'
  | 'Romantic'
  | 'Nostalgic'
  | 'Grateful'
  | 'Inspired'
  | 'Sad'
  | 'Lonely'
  | 'Anxious'
  | 'Proud'
  | 'Surprised'

export type MediaType = 'image' | 'video' | 'audio'

export interface Person {
  id: string
  name: string
  relationship: string
  photo?: string
  notes?: string
}

export interface MemoryMedia {
  id: string
  type: MediaType
  url: string
  name?: string
  mime?: string
  storagePath?: string
}

export interface Memory {
  id: string
  title: string
  description: string
  memoryDate: string
  datePrecision: 'exact' | 'approximate' | 'year'
  latitude: number
  longitude: number
  city: string
  country: string
  emotion: Emotion
  people: Person[]
  tags: string[]
  media: MemoryMedia[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  demo?: boolean
}

export interface StoryCollection {
  id: string
  title: string
  memoryIds: string[]
  createdAt: string
}

export type ViewKey =
  | 'map'
  | 'timeline'
  | 'add'
  | 'rooms'
  | 'profile'
  | 'people'
  | 'places'
  | 'emotions'
  | 'journey'
  | 'stories'
  | 'favorites'
  | 'settings'
