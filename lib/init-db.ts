import { seed } from './db/seed';

let isInitialized = false;

export async function initializeDatabase() {
    if (isInitialized) {
        console.log('Database already initialized, skipping...');
        return;
    }

    try {
        console.log('Starting database initialization...');
        const result = await seed(true);
        isInitialized = true;
        console.log('Database initialized successfully:', result);
    } catch (error) {
        console.error('Error initializing database:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        // Optionally, you can throw the error here if you want to prevent the app from starting
        // throw error;
    }
}
