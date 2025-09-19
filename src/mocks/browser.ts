// ./mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { db } from '../db'
import { nanoid } from "nanoid"
import { initDevUtils } from './dev-utils'

export const worker = setupWorker(...handlers)

let initialized = false
export async function initializeDataOnce() {
  if (initialized) return
  initialized = true

  // Make sure Dexie opens before seeding
  await db.open()

  // Seed jobs, candidates, etc.
  await db.transaction('rw', db.jobs, db.candidates, async () => {
    if ((await db.jobs.count()) === 0) {
      await db.jobs.add({ 
        id: nanoid(),
        title: 'Frontend Dev', 
        status: 'active', 
        order: 1, 
        slug: 'frontend-dev', 
        tags: [], 
        createdAt: Date.now(), 
        updatedAt: Date.now() 
      })
    }
  })

  // Initialize development utilities
  initDevUtils()
}
