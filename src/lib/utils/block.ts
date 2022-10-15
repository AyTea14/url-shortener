import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import blockedHostname from "../../config/blocked.json";

export function isBlockedHostname(url: string, baseUrl?: string) {
    if (baseUrl) blockedHostname.push(baseUrl);
    try {
        url = new URL(url).host;
    } catch (error) {}

    let blocked = new Set(blockedHostname);
    if (blocked.has(url) || blocked.has(url.replace(/(?:.+\.)?(.+\..+)$/i, "$1")))
        throw new ExtendedError("Shortening that hostname is forbidden", HttpCode["Unprocessable Entity"]);
}
