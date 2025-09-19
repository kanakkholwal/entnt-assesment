// Debug utilities to test database and MSW initialization
export const debugDatabase = async () => {
    try {
        console.log('[DEBUG] Testing database initialization...')

        // Test database import
        const { db } = await import('./db/index')
        console.log('[DEBUG] Database imported successfully:', db)

        // Test database open
        await db.open()
        console.log('[DEBUG] Database opened successfully')

        // Test database stats
        const { DatabaseUtils } = await import('./db/services')
        const stats = await DatabaseUtils.getStats()
        console.log('[DEBUG] Database stats:', stats)

        return true
    } catch (error) {
        console.error('[DEBUG] Database test failed:', error)
        return false
    }
}

export const debugMSW = async () => {
    try {
        console.log('[DEBUG] Testing MSW initialization...')

        // Test MSW import
        const { worker } = await import('./mocks/browser')
        console.log('[DEBUG] MSW worker imported successfully:', worker)

        // Test worker start
        await worker.start({
            onUnhandledRequest: 'bypass',
            quiet: false
        })
        console.log('[DEBUG] MSW worker started successfully')

        return true
    } catch (error) {
        console.error('[DEBUG] MSW test failed:', error)
        return false
    }
}

// Expose to window for console testing
if (typeof window !== 'undefined') {
    (window as any).debugUtils = {
        testDatabase: debugDatabase,
        testMSW: debugMSW,
        testBoth: async () => {
            const dbResult = await debugDatabase()
            const mswResult = await debugMSW()
            console.log('[DEBUG] Results - Database:', dbResult, 'MSW:', mswResult)
            return { database: dbResult, msw: mswResult }
        }
    }
}