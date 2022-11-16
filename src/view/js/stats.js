dayjs.extend(window.dayjs_plugin_relativeTime);
const visitsHTML = document.querySelector(".visits");
const createdAtHTML = document.querySelector(".createdAt");
const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
const socket = io();

const detectedLocale = detectLocale();
const createdUtc = Number(createdAtHTML.title) * 1000;

const dateTitle = `${dayjs(createdUtc).format(`ddd, MMM DD, YYYY, hh:mm:ss A`)} ${getTimeZoneName(new Date(createdUtc))}`;
createdAtHTML.outerHTML = `It was created on ${dateTitle}`;

const code = window.location.pathname.slice(1, -1);

socket.on(code, (data) => {
    visitsHTML.textContent = `${data.visits}`;
});

function detectLocale() {
    const navLangs = navigator.languages || (navigator.language ? [navigator.language] : false);
    if (!navLangs || navLangs.length === 0) return null;
    return navLangs[0].toLowerCase();
}

function getTimeZoneName(date) {
    if (Intl?.DateTimeFormat) {
        // Modern method
        const timeZoneName = new Intl.DateTimeFormat("default", {
            timeZoneName: "long",
        })
            .formatToParts(date)
            .find((p) => p.type.toLowerCase() === "timezonename");
        if (timeZoneName) return timeZoneName.value;
    }
    // Fallback method
    const dateString = date.toString();
    if (dateString.includes("(")) {
        return dateString.split("(")[1].slice(0, -1);
    } else if (dateString.includes("GMT")) {
        return "GMT" + dateString.split("GMT")[1].slice(0, -1);
    }
    return "";
}
