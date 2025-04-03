import * as ExpoCrypto from 'expo-crypto';

if (!global.crypto) {
    global.crypto = {};
}

// Create a small pool of pre-generated random bytes
let randomPool = new Uint8Array(1024);
let poolOffset = randomPool.length;

// Fill the pool asynchronously
const fillPool = async () => {
    try {
        randomPool = await ExpoCrypto.getRandomBytesAsync(1024);
        poolOffset = 0;
    } catch (e) {
        console.warn('Failed to generate secure random bytes, falling back to Math.random');
        // Fallback to Math.random
        for (let i = 0; i < randomPool.length; i++) {
            randomPool[i] = Math.floor(Math.random() * 256);
        }
        poolOffset = 0;
    }
};

// Initial pool fill
fillPool();

if (!global.crypto.getRandomValues) {
    global.crypto.getRandomValues = (buffer) => {
        if (typeof buffer === 'number') {
            buffer = new Uint8Array(buffer);
        } else if (!(buffer instanceof Uint8Array)) {
            throw new TypeError('Expected Uint8Array');
        }
        
        // If we need more bytes than available in the pool, refill pool and use Math.random as fallback
        if (poolOffset + buffer.length > randomPool.length) {
            fillPool();
            // Fallback to Math.random since we need values synchronously
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] = Math.floor(Math.random() * 256);
            }
        } else {
            // Copy bytes from the pre-generated pool
            buffer.set(randomPool.subarray(poolOffset, poolOffset + buffer.length));
            poolOffset += buffer.length;
        }
        
        return buffer;
    };
}