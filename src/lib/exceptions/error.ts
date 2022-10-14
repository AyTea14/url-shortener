import { HttpCode } from "#lib/types";

export class ExtendedError extends Error {
    statusCode: number;
    error: string;

    constructor(message: string, code: number) {
        super(message);
        this.statusCode = code;
        this.error = HttpCode[this.statusCode]
    }
}
