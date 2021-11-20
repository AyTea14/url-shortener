const input = document.querySelector("#input");
const shortenBtn = document.querySelector("#shorten-btn");
const clipboardBtn = document.querySelector("#copy-btn");
const result = document.querySelector("#result");

shortenBtn.addEventListener("click", () => {
    result.innerText = "Loading...";
    fetch(`/api/url/shorten`, {
        method: "POST",
        body: JSON.stringify({ longUrl: `${input.value}` }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            result.innerText = data.shortUrl;
            result.setAttribute("href", data.shortUrl);
        })
        .catch((error) => {
            result.setAttribute("href", "");
            result.innerText = "Invalid URL";
        });
});

clipboardBtn.addEventListener("click", () => {
    const url = result.href;
    console.log(url === "http://localhost:3000/");
    console.log(url === "https://shorten.aytea14.repl.co/");
    if (!url === "http://localhost:3000/" || !url === "https://shorten.aytea14.repl.co/") {
        console.log(result.href);
        copyTextToClipboard(url);
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
