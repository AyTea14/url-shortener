const input = document.querySelector("#input");
const expandBtn = document.querySelector("#expand-btn");
const result = document.querySelector("#result");

expandBtn.addEventListener("click", () => {
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
            result.innerText = "Invalid URL";
        });
});
