import { GameState, GameAction } from './lib/game-types';

// Mock specific parts of the reducer logic to isolate the smelting bug
// We don't need the whole state, just the relevant parts

interface MockState {
    inventory: { [key: string]: number };
    charcoalSmeltingQueue: number;
    smeltingTimestamps: {
        charcoal: number | null;
    };
    statistics: any;
    log: any[];
}

const initialState: MockState = {
    inventory: {
        wood: 100,
        charcoal: 0
    },
    charcoalSmeltingQueue: 0,
    smeltingTimestamps: {
        charcoal: null
    },
    statistics: { totalItemsGained: {} },
    log: []
};

function reducer(state: MockState, action: any): MockState {
    switch (action.type) {
        case 'START_SMELTING_ALL': {
            const { type, amount } = action.payload;
            if (type !== 'charcoal') return state;

            const newInventory = { ...state.inventory };
            const totalWoodNeeded = 5 * amount;
            newInventory.wood -= totalWoodNeeded;

            const newTimestamps = { ...state.smeltingTimestamps };
            if (state.charcoalSmeltingQueue === 0) {
                newTimestamps.charcoal = Date.now();
            }

            return {
                ...state,
                inventory: newInventory,
                charcoalSmeltingQueue: state.charcoalSmeltingQueue + amount,
                smeltingTimestamps: newTimestamps
            };
        }

        case 'FINISH_SMELTING_CHARCOAL': {
            if (state.charcoalSmeltingQueue <= 0) return state;

            // Add item
            const newInventory = { ...state.inventory };
            newInventory.charcoal += 1;

            const newSmeltingQueue = state.charcoalSmeltingQueue - 1;
            const newTimestamps = { ...state.smeltingTimestamps };

            if (newSmeltingQueue > 0) {
                newTimestamps.charcoal = Date.now(); // RESET TIMER
            } else {
                newTimestamps.charcoal = null;
            }

            return {
                ...state,
                inventory: newInventory,
                charcoalSmeltingQueue: newSmeltingQueue,
                smeltingTimestamps: newTimestamps,
                statistics: state.statistics,
                log: [...state.log, 'Finished charcoal']
            };
        }
    }
    return state;
}

async function runSimulation() {
    let state = initialState;

    // 1. Queue 5 charcoal
    console.log('Queuing 5 charcoal...');
    state = reducer(state, { type: 'START_SMELTING_ALL', payload: { type: 'charcoal', amount: 5 } });

    const startTimestamp = state.smeltingTimestamps.charcoal;
    console.log(`Start Timestamp: ${startTimestamp}`);

    // 2. Simulate Loop
    // We will advance time in steps of 1000ms
    // Real logic: if (now - timestamp >= 10000) -> dispatch finish

    let now = Date.now();
    // Override Date.now for deterministic behavior? 
    // Better to just use 'now' variable for logic checks

    // Adjust 'now' to match basic start time
    now = startTimestamp!;

    for (let tick = 0; tick < 50; tick++) {
        const elapsed = now - state.smeltingTimestamps.charcoal!;
        console.log(`Tick ${tick}: Now=${now}, TS=${state.smeltingTimestamps.charcoal}, Elapsed=${elapsed}, Queue=${state.charcoalSmeltingQueue}`);

        if (state.charcoalSmeltingQueue > 0 && state.smeltingTimestamps.charcoal) {
            if (now - state.smeltingTimestamps.charcoal >= 10000) {
                console.log('!!! TRIGGER FINISH !!!');

                // Mock the delay of dispatch/reducer update?
                // In real app, Date.now() in reducer is slightly after checks

                // Let's assume reducer runs immediately with current `now` (simulating instant dispatch)
                // But WAIT, in the reducer above we use Date.now(). We should mock Date.now() to be `now`.

                const originalDateNow = Date.now;
                Date.now = () => now;

                state = reducer(state, { type: 'FINISH_SMELTING_CHARCOAL' });

                Date.now = originalDateNow;
            }
        }

        if (state.charcoalSmeltingQueue === 0) {
            console.log('Queue empty. Done.');
            break;
        }

        // Advance time
        now += 1000;
    }
}

runSimulation();
