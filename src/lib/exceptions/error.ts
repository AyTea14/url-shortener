import { STATUS_CODES } from "http";

export class ExtendedError extends Error {
    statusCode: number;
    error: string;

    constructor(message: string, code: number) {
        super(message);
        this.statusCode = code;
        this.error = STATUS_CODES[this.statusCode] as string;
    }
}
