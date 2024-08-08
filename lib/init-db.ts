import { seed } from './db/seed';

let isInitialized = false;

export async function initializeDatabase() {
    if (isInitialized) {
        return;
    }

    try {
        await seed();
        isInitialized = true;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}