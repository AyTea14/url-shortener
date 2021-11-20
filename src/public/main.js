const input = document.querySelector("#input");
const shortenBtn = document.querySelector("#shorten-btn");
const clipboardBtn = document.querySelector("#copy-btn");
const result = document.querySelector("#result");
let shortUrl;

shortenBtn.addEventListener("click", () => {
    result.innerText = "Loading...";
    fetch(`/api/url/shorten`, {
        method: "POST",
        body: JSON.stringify({ longUrl: `${input.value}` }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then(async (data) => {
            shortUrl = data.shortUrl;
            result.innerText = shortUrl;
            result.setAttribute("href", shortUrl);
        })
        .catch((error) => {
            shortUrl = undefined;
            result.setAttribute("href", "");
            result.innerText = "Invalid URL";
        });
});

clipboardBtn.addEventListener("click", () => {
    const url = shortUrl;
    if (url) {
        return copyTextToClipboard(url);
    }
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
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text);
    alert("Copied url to the clipboard");
}
