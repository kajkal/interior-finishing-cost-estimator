/**
 * Error thrown when both access and refresh tokens are invalid (missing or expired).
 */
export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}
