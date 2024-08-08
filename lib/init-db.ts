import { seed } from './db/seed';

let isInitialized = false;

export async function initializeDatabase() {
    if (isInitialized) {
        return;
    }

    try {
        console.log('Starting database initialization...');
        const result = await seed();
        isInitialized = true;
        console.log('Database initialized successfully:', result);
    } catch (error) {
        console.error('Error initializing database:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        // You might want to throw the error here if you want to prevent the app from starting
        // throw error;
    }
}