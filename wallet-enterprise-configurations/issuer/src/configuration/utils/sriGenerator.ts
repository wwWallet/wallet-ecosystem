import crypto from "crypto";

type Algorithm = 'sha256' | 'sha384' | 'sha512';

/**
 * Creates an SRI hash from a JS object
 * @param data - The object to hash
 * @param algorithm - Hash algorithm: 'sha256', 'sha384', or 'sha512'
 * @returns SRI string in the format: algorithm-base64Hash
 */

export function createSRIFromObject(data: Record<string, any>, algorithm: Algorithm = 'sha256'): string {
	const jsonString = JSON.stringify(data);
	const hash = crypto.createHash(algorithm).update(jsonString).digest('base64');
	return `${algorithm}-${hash}`;
}
