import type { Memory, Person } from '../types'

export const demoPeople: Person[] = [
  { id: 'p-family', name: 'Family', relationship: 'Family' },
  { id: 'p-friend', name: 'Alex', relationship: 'Friend' },
  { id: 'p-partner', name: 'Mina', relationship: 'Partner' }
]

const now = new Date().toISOString()

export const demoMemories: Memory[] = [
  {
    id: 'demo-positano',
    title: 'A Perfect Evening in Positano',
    description: 'Warm stone streets, sea air, and the kind of sunset that makes time slow down.',
    memoryDate: '2026-06-19',
    datePrecision: 'exact',
    latitude: 40.6281,
    longitude: 14.485,
    city: 'Positano',
    country: 'Italy',
    emotion: 'Romantic',
    people: [demoPeople[2]],
    tags: ['Travel', 'Summer', 'Sea'],
    media: [{ id: 'm-pos-1', type: 'image', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=85' }],
    isFavorite: true,
    createdAt: now,
    updatedAt: now,
    demo: true
  },
  {
    id: 'demo-kyoto',
    title: 'Cherry Blossoms in Kyoto',
    description: 'A quiet morning under pale pink branches. The city felt almost weightless.',
    memoryDate: '2025-04-06',
    datePrecision: 'exact',
    latitude: 35.0116,
    longitude: 135.7681,
    city: 'Kyoto',
    country: 'Japan',
    emotion: 'Peaceful',
    people: [demoPeople[1]],
    tags: ['Travel', 'Spring', 'Japan'],
    media: [{ id: 'm-kyo-1', type: 'image', url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=85' }],
    isFavorite: true,
    createdAt: now,
    updatedAt: now,
    demo: true
  },
  {
    id: 'demo-iceland',
    title: 'Northern Lights in Iceland',
    description: 'Green ribbons across a silent sky. Nobody wanted to speak too loudly.',
    memoryDate: '2024-11-12',
    datePrecision: 'exact',
    latitude: 64.1466,
    longitude: -21.9426,
    city: 'Reykjavík',
    country: 'Iceland',
    emotion: 'Inspired',
    people: [],
    tags: ['Adventure', 'Night', 'Nature'],
    media: [{ id: 'm-ice-1', type: 'image', url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1400&q=85' }],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    demo: true
  },
  {
    id: 'demo-barcelona',
    title: 'Barcelona Weekend',
    description: 'Architecture, late dinners, street music, and a camera roll full of tiny details.',
    memoryDate: '2023-09-23',
    datePrecision: 'exact',
    latitude: 41.3874,
    longitude: 2.1686,
    city: 'Barcelona',
    country: 'Spain',
    emotion: 'Excited',
    people: [demoPeople[1]],
    tags: ['Travel', 'Friends', 'Cinema'],
    media: [{ id: 'm-bcn-1', type: 'image', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=85' }],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    demo: true
  },
  {
    id: 'demo-home',
    title: 'Home With Family',
    description: 'Nothing dramatic. Tea, laughter, familiar voices, and the feeling of being exactly where I belong.',
    memoryDate: '2022-12-30',
    datePrecision: 'approximate',
    latitude: 35.6892,
    longitude: 51.389,
    city: 'Tehran',
    country: 'Iran',
    emotion: 'Grateful',
    people: [demoPeople[0]],
    tags: ['Family', 'Home', 'Winter'],
    media: [{ id: 'm-home-1', type: 'image', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85' }],
    isFavorite: true,
    createdAt: now,
    updatedAt: now,
    demo: true
  }
]
