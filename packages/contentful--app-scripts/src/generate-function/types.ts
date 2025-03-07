export class HTTPResponseError extends Error {}
export class InvalidTemplateError extends Error {}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}
