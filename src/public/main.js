const input = document.querySelector("#input");
const shortenBtn = document.querySelector("#shorten-btn");
const clipboardBtn = document.querySelector("#copy-btn");
const result = document.querySelector("#result");
const x = document.querySelector(".copy-box");
let shortUrl;

shortenBtn.addEventListener("click", async () => {
    result.innerText = "Loading...";
    fetch(`/api/url/shorten`, {
        method: "POST",
        body: JSON.stringify({ longUrl: `${input.value}` }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => res.json())
        .then((data) => {
            const baseUrl = "https://shrter.cf";
            shortUrl = `${baseUrl}/${data.urlCode}`;
            result.innerText = shortUrl;
            result.setAttribute("href", shortUrl);

            if (x.style.display === "none" && shortUrl) {
                x.style.display = "block";
            } else if (x.style.display === "none" && !shortUrl) {
                x.style.display = "none";
            } else if (x.style.display === "none" && shortUrl) {
                x.style.display = "none";
            } else if (result.innerHTML === "undefined") {
                x.style.display = "none";
            }
        })
        .catch((e) => {
            shortUrl = undefined;
            x.style.display = "none";
            result.innerText = "";
            result.setAttribute("href", "");
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
    const url = shortUrl;
    if (url) return copyTextToClipboard(url);
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
    clipboardBtn.innerText = "Copied url";
    clipboardBtn.style["background-color"] = "#57867c";
    setTimeout(() => {
        clipboardBtn.innerText = "copy url";
        clipboardBtn.style["background-color"] = "#6da89c";
    }, 1_250);
    // alert("Copied url to the clipboard");
}
