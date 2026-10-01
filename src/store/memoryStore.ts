import { demoMemories, demoPeople } from '../data/demo'
import type { Memory, Person, StoryCollection } from '../types'

const MEMORY_KEY = 'memory-map:memories:v1'
const PEOPLE_KEY = 'memory-map:people:v1'
const STORIES_KEY = 'memory-map:stories:v1'
const PROFILE_KEY = 'memory-map:profile:v1'

export interface LocalProfile {
  name: string
  avatar?: string
  joinedAt: string
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

export function loadMemories(useDemoFallback = true): Memory[] {
  return safeParse(localStorage.getItem(MEMORY_KEY), useDemoFallback ? demoMemories : [])
}

export function saveMemories(memories: Memory[]) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memories))
}

export function loadPeople(): Person[] {
  const fromStorage = safeParse<Person[]>(localStorage.getItem(PEOPLE_KEY), [])
  if (fromStorage.length) return fromStorage
  const derived = new Map<string, Person>()
  ;[...demoPeople, ...loadMemories().flatMap(m => m.people)].forEach(p => derived.set(p.id, p))
  return [...derived.values()]
}

export function savePeople(people: Person[]) {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people))
}

export function loadStories(): StoryCollection[] {
  return safeParse(localStorage.getItem(STORIES_KEY), [])
}

export function saveStories(stories: StoryCollection[]) {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
}

export function loadProfile(): LocalProfile {
  return safeParse(localStorage.getItem(PROFILE_KEY), {
    name: 'Memory Explorer',
    joinedAt: new Date().toISOString()
  })
}

export function saveProfile(profile: LocalProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function resetLocalDemo() {
  localStorage.removeItem(MEMORY_KEY)
  localStorage.removeItem(PEOPLE_KEY)
  localStorage.removeItem(STORIES_KEY)
}
