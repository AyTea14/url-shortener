const urls = document.querySelector("#count #urls");
const visits = document.querySelector("#count #visits");
const submitButton = document.querySelector(".submitbutton");
const urlBox = document.querySelector("#urlboxcontainer .urlbox");
const socket = io();

socket.on("data", (data) => {
    urls.textContent = data.urls;
    visits.textContent = data.visits;
});

submitButton.addEventListener("click", () => {
    console.log(urlBox.value);
});
