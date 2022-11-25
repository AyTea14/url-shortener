import { ExtendedError } from "#lib/exceptions";
import { HttpCode } from "#lib/types";
import { blockedHostnames } from "#config";

// https://raw.githubusercontent.com/sambokai/ShortURL-Services-List/master/shorturl-services-list.csv

export function isBlockedHostname(url: string, baseUrl?: string) {
    if (baseUrl) blockedHostnames.push(baseUrl);
    try {
        url = new URL(url).hostname;
    } catch (error) {
        url = url;
    }

    let blocked = new Set(blockedHostnames);
    if (blocked.has(url) || blocked.has(url.replace(/(?:.+\.)?(.+\..+)$/i, "$1")))
        throw new ExtendedError("Shortening that hostname is forbidden", HttpCode["Unprocessable Entity"]);
}
