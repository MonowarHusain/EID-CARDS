import CryptoJS from 'crypto-js';

/**
 * Generates a random, secure 128-bit key.
 * Encodes it in URL-safe Base64 to keep the link short and clean.
 */
export function generateSecretKey(): string {
    // 1. Generate 16 bytes (128 bits) of random cryptographic data
    const rawKey = CryptoJS.lib.WordArray.random(16);

    // 2. Convert to Base64 and make it URL-safe (remove +, /, and =)
    return rawKey
        .toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Encrypts the raw text message using the generated secret key.
 * This outputs the "gibberish" that we will actually save to Firestore.
 */
export function encryptMessage(message: string, secretKey: string): string {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
}

/**
 * Decrypts the gibberish back into readable text using the key from the URL.
 * Returns null if the key is wrong or the data is corrupted.
 */
export function decryptMessage(encryptedMessage: string, secretKey: string): string | null {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText) return null;
        return originalText;
    } catch {
        return null;
    }
}