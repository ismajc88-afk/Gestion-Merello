
/**
 * Security Utilities for PIN Hashing
 * Uses Web Crypto API (native browser API, no dependencies required)
 */

/**
 * Hashes a PIN using SHA-256
 * @param pin - The PIN to hash
 * @returns Promise<string> - Hex string of the hash
 */
export async function hashPin(pin: string): Promise<string> {
    // Convert PIN to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);

    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * Verifies a PIN against a stored hash
 * @param pin - The PIN to verify
 * @param storedHash - The stored hash to compare against
 * @returns Promise<boolean> - True if PIN matches
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    const pinHash = await hashPin(pin);
    return pinHash === storedHash;
}

/**
 * Generates a salted hash for better security
 * @param pin - The PIN to hash
 * @param salt - Optional salt (will generate random if not provided)
 * @returns Promise<{hash: string, salt: string}>
 */
export async function hashPinWithSalt(pin: string, salt?: string): Promise<{ hash: string, salt: string }> {
    // Generate random salt if not provided
    const actualSalt = salt || Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Combine PIN with salt
    const saltedPin = pin + actualSalt;
    const hash = await hashPin(saltedPin);

    return { hash, salt: actualSalt };
}

/**
 * Verifies a PIN against a salted hash
 * @param pin - The PIN to verify
 * @param storedHash - The stored hash
 * @param salt - The salt used for hashing
 * @returns Promise<boolean>
 */
export async function verifyPinWithSalt(pin: string, storedHash: string, salt: string): Promise<boolean> {
    const { hash } = await hashPinWithSalt(pin, salt);
    return hash === storedHash;
}

/**
 * Rate limiting helper for login attempts
 */
export class LoginRateLimiter {
    private attempts: Map<string, number> = new Map();
    private lockouts: Map<string, number> = new Map();

    constructor(
        private maxAttempts: number = 3,
        private lockoutDuration: number = 60000 // 1 minute
    ) { }

    /**
     * Records a failed login attempt
     * @param identifier - User identifier (role in this case)
     * @returns boolean - True if user is now locked out
     */
    recordAttempt(identifier: string): boolean {
        const current = this.attempts.get(identifier) || 0;
        const newCount = current + 1;
        this.attempts.set(identifier, newCount);

        if (newCount >= this.maxAttempts) {
            this.lockouts.set(identifier, Date.now() + this.lockoutDuration);
            return true;
        }

        return false;
    }

    /**
     * Resets attempts for a user after successful login
     */
    resetAttempts(identifier: string): void {
        this.attempts.delete(identifier);
        this.lockouts.delete(identifier);
    }

    /**
     * Checks if a user is currently locked out
     * @returns {isLocked: boolean, remainingTime: number}
     */
    isLockedOut(identifier: string): { isLocked: boolean; remainingTime: number } {
        const lockoutTime = this.lockouts.get(identifier);

        if (!lockoutTime) {
            return { isLocked: false, remainingTime: 0 };
        }

        const now = Date.now();
        if (now < lockoutTime) {
            return {
                isLocked: true,
                remainingTime: Math.ceil((lockoutTime - now) / 1000) // seconds
            };
        }

        // Lockout expired, clean up
        this.lockouts.delete(identifier);
        this.attempts.delete(identifier);

        return { isLocked: false, remainingTime: 0 };
    }

    /**
     * Gets current attempt count for a user
     */
    getAttempts(identifier: string): number {
        return this.attempts.get(identifier) || 0;
    }
}
