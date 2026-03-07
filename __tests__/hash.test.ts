
import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin, hashPinWithSalt } from '../utils/hash';

describe('hashPin', () => {
    it('hashes a PIN correctly', async () => {
        const pin = '1234';
        const hash = await hashPin(pin);
        expect(hash).toBeDefined();
        // SHA-256 is 64 hex chars
        expect(hash.length).toBe(64);
    });

    it('produces same hash for same PIN', async () => {
        const pin = '1234';
        const hash1 = await hashPin(pin);
        const hash2 = await hashPin(pin);
        expect(hash1).toBe(hash2);
    });

    it('produces different hash for different PIN', async () => {
        const hash1 = await hashPin('1234');
        const hash2 = await hashPin('0000');
        expect(hash1).not.toBe(hash2);
    });
});

describe('verifyPin', () => {
    it('verifies correct PIN', async () => {
        const pin = '1234';
        const hash = await hashPin(pin);
        const isValid = await verifyPin(pin, hash);
        expect(isValid).toBe(true);
    });

    it('rejects incorrect PIN', async () => {
        const pin = '1234';
        const hash = await hashPin(pin);
        const isValid = await verifyPin('0000', hash);
        expect(isValid).toBe(false);
    });
});

describe('hashPinWithSalt', () => {
    it('generates salt and hash', async () => {
        const result = await hashPinWithSalt('1234');
        expect(result.salt).toBeDefined();
        expect(result.hash).toBeDefined();
        expect(result.salt.length).toBeGreaterThan(0);
        expect(result.hash.length).toBe(64);
    });

    it('produces different hashes for same PIN with different salts', async () => {
        const pin = '1234';
        // Since salt is random, calling it twice should produce different salts
        const result1 = await hashPinWithSalt(pin);
        const result2 = await hashPinWithSalt(pin);

        expect(result1.salt).not.toBe(result2.salt);
        expect(result1.hash).not.toBe(result2.hash);
    });
});
