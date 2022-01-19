const input = document.querySelector("#input");
const output = document.querySelector("#output");
const shortenBtn = document.querySelector("#shorten-btn");
const clipboardBtn = document.querySelector("#copy-btn");
const x = document.querySelector(".copy-box");
let shortUrl;

shortenBtn.addEventListener("click", async () => {
    fetch(`/api/url/shorten`, {
        method: "POST",
        body: JSON.stringify({ longUrl: `${input.value}` }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            const host = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port;
            shortUrl = data.urlCode ? `${protocol}//${host}${port ? `:${port}` : ""}/${data.urlCode}` : undefined;
            output.value = shortUrl;

            if (x.style.display === "none" && shortUrl) x.style.display = "flex";
            else x.style.display = "none";
        })
        .catch((e) => {
            shortUrl = undefined;
            x.style.display = "none";
            output.value = "";
            alert("Invalid URL");
        });
});

input.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        shortenBtn.click();
    }
});

clipboardBtn.addEventListener("click", () => {
    output.focus();
    output.setSelectionRange(0, shortUrl.length);
    setTimeout(() => output.setSelectionRange(0, 0), 1_500);
    if (shortUrl) return copyTextToClipboard(shortUrl);
});

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
    } catch (err) {}

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) return fallbackCopyTextToClipboard(text);
    navigator.clipboard.writeText(text);
    clipboardBtn.textContent = "Copied";
    setTimeout(() => (clipboardBtn.textContent = "Copy"), 1_500);
}
