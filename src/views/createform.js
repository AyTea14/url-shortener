const submitbutton = document.querySelector(".submitbutton");
const outputBox = document.querySelector(".shorten_url");
const logo = document.querySelector(".logo");
const oriurl = document.querySelector(".oriurl");
const copyBtn = document.querySelector(".copy_button");
const input = document.querySelector(".urlbox");
const shorturlbox = document.querySelector(".shorturlbox");
const short_url = document.querySelector("#short_url");
const loading = document.querySelector(".lds-dual-ring");
const output = document.querySelector("#short_url");
const line = document.querySelector("#line");
const urls = document.querySelector("#count #urls");
const clicks = document.querySelector("#count #clicks");
const socket = io();
let shortUrl, statusCode;

submitbutton.addEventListener("click", () => {
    let protoregex = /^([-A-Za-z0-9]{1,15}:)/;
    let urlregex = /.\../;
    let test = input.value.search(urlregex);
    let test2 = input.value.search(protoregex);
    if (!input.value && input.value.length < 4) {
        submitError("Please enter a valid URL to shorten.");
        input.focus();
        input.select();
        return false;
    }
    if (shorturlbox.value.length) {
        if (shorturlbox.value.length > 30 || shorturlbox.value.length < 5) {
            submitError("Custom short URLs must be between 5 and 30 characters long.");
            shorturlbox.focus();
            shorturlbox.select();
            return false;
        }
        let shorturlregex = /^[a-zA-Z0-9_-]+$/;
        test = shorturlbox.value.search(shorturlregex);
        if (test == -1) {
            submitError("Custom short URLs can only contain alphanumeric characters and underscores.");
            shorturlbox.focus();
            shorturlbox.select();
            return false;
        }
    }

    outputBox.style.display = "none";
    logo.style.display = "none";
    line.style.display = "none";
    loading.style.display = "block";
    fetch(`/api/url/shorten`, {
        method: "POST",
        body: JSON.stringify({ longUrl: `${input.value}`, shorturl: shorturlbox.value }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => {
            statusCode = res.status;
            return res.json();
        })
        .then(async (data) => {
            if (statusCode == 406) return submitError("The shortened URL you selected is already taken. Try something more unusual.");
            const host = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port;
            shortUrl = data.urlCode ? `${protocol}//${host}${port ? `:${port}` : ""}/${data.urlCode}` : undefined;
            if (!shortUrl) return submitError("Please enter a valid URL to shorten.");
            loading.style.display = "none";

            if (shortUrl) {
                fetch("/api/url/stats")
                    .then((res) => res.json())
                    .then((data) => {
                        socket.emit("new_shortURL_data", data);
                        socket.on("new_shortURL_data", (data) => {
                            urls.textContent = data.shortURLs;
                            clicks.textContent = data.clicks;
                        });
                    });
            }

            output.value = shortUrl;
            short_url.textContent = shortUrl;
            short_url.href = shortUrl;
            oriurl.textContent = `Your shortened URL goes to: ${data.longUrl}`;

            if (line.style.display == "none" && outputBox.style.display == "none" && logo.style.display == "none") {
                outputBox.style.display = "block";
                logo.style.display = "none";
                line.style.display = "block";
            }
        })
        .catch((e) => {
            outputBox.style.display = "none";
            logo.style.display = "block";
            line.style.display = "none";
            loading.style.display = "none";
            submitError("Sorry, there was an unexpected error or timeout when submitting your request.");
        });
});

input.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        submitbutton.click();
    }
});
shorturlbox.addEventListener("keyup", (event) => {
    if (event.keyCode == 13) {
        event.preventDefault();
        submitbutton.click();
    }
});

copyBtn.addEventListener("click", () => {
    if (shortUrl) copyTextToClipboard(shortUrl);
});

// copyBtn.addEventListener("click", () => {
//     output.focus();
//     output.setSelectionRange(0, shortUrl.length);
//     setTimeout(() => output.setSelectionRange(0, 0), 1_500);
//     if (shortUrl) return copyTextToClipboard(shortUrl);
// });

function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
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
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1_500);
}

function submitError(errortext) {
    const createformlabel = document.getElementById("errortext");
    if (createformlabel.style.display == "none") createformlabel.style.display = "block";
    document.getElementById("errortext").innerHTML = errortext;
    outputBox.style.display = "none";
    logo.style.display = "block";
    line.style.display = "none";
    loading.style.display = "none";
    setTimeout(() => {
        document.getElementById("errortext").innerHTML = "";
    }, 3000);
}

function submitForm() {
    let thisform = document.getElementById("mainform");
    if (!input.value && input.value.length < 4) {
        submitError("Please enter a valid URL to shorten.");
        input.focus();
        input.select();
        return false;
    }

    let protoregex = /^([-A-Za-z0-9]{1,15}:)/;
    let urlregex = /.\../;
    let test = input.value.search(urlregex);
    let test2 = input.value.search(protoregex);
    let precheck = 0;

    if (test2 == -1 && test == -1) {
        submitError("Please enter a valid URL to shorten.");
        input.focus();
        input.select();
        return false;
    }

    if (shorturlbox.value.length) {
        if (shorturlbox.value.length > 30 || shorturlbox.value.length < 5) {
            submitError("Custom short URLs must be between 5 and 30 characters long.");
            shorturlbox.focus();
            shorturlbox.select();
            return false;
        }
        let shorturlregex = /^[a-zA-Z0-9_-]+$/;
        test = shorturlbox.value.search(shorturlregex);
        if (test == -1) {
            submitError("Custom short URLs can only contain alphanumeric characters and underscores.");
            shorturlbox.focus();
            shorturlbox.select();
            return false;
        }
        precheck = 1;
    }

    if (precheck) {
        let xhr;
        let url = encodeURIComponent(document.querySelector(".urlbox").value);
        let shorturl = encodeURIComponent(shorturlbox.value);
        let params = "shorturl=" + shorturl;
        //let params="url="+url+"&shorturl="+shorturl+"&format=int1";
        if (window.XMLHttpRequest) xhr = new XMLHttpRequest();
        // for older IE 5/6
        else xhr = new ActiveXObject("Microsoft.XMLHTTP");

        if (!xhr) return true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 406) {
                    submitError("The shortened URL you selected is already taken. Try something more unusual.");
                    shorturlbox.focus();
                    shorturlbox.select();
                    //document.getElementById("shorturl").focus();
                    return false;
                }
                if (xhr.status == 200) {
                    document.getElementById("mainform").submit();
                    return true;
                } else {
                    submitError("Sorry, there was an unexpected error or timeout when submitting your request.");
                    return false;
                }
            }
        };

        xhr.open("POST", "checkurl.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
        return false;
    }
    return true;
}

// function shortURLChanged() {
//     let options = document.getElementById("options");

//     if (shorturlbox.value.length > 0) options.style.display = "none";
//     else options.style.display = "block";
// }

function shorturlon() {
    let box;
    let label;
    let label2;
    let label3;
    let options;
    let statsopt;
    box = document.getElementById("shorturlboxcontainer");
    label = document.getElementById("shorturllabel");
    label2 = document.getElementById("shorturllabel2");
    label3 = document.getElementById("shorturllabel3");
    // options = document.getElementById("options");
    // statsopt = document.getElementById("statsopt");
    label.style.display = "none";
    label2.style.display = "block";
    label3.style.display = "none";
    box.style.display = "block";
    // options.style.display = "block";
    // statsopt.style.display = "block";
    document.querySelector(".shorturlbox").focus();
}
function shorturloff() {
    let box;
    let label;
    let label2;
    let label3;
    let options;
    let statsopt;
    // let radiobutton = document.getElementById("r1");
    // radiobutton.checked = true;
    box = document.getElementById("shorturlboxcontainer");
    label = document.getElementById("shorturllabel");
    label2 = document.getElementById("shorturllabel2");
    label3 = document.getElementById("shorturllabel3");
    // options = document.getElementById("options");
    // statsopt = document.getElementById("statsopt");
    label.style.display = "block";
    label2.style.display = "none";
    label3.style.display = "none";
    box.style.display = "none";
    // options.style.display = "none";
    // statsopt.style.display = "none";
    document.querySelector(".shorturlbox").value = "";
}
