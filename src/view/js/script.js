const urls = document.querySelector("#count #urls");
const visits = document.querySelector("#count #visits");
const submitButton = document.querySelector(".submitbutton");
const urlBox = document.querySelector("#urlboxcontainer .urlbox");
const socket = io();

socket.on("created", (data) => {
    urls.textContent = data.urls;
});
socket.on("visited", (data) => {
    visits.textContent = data.visits;
});

submitButton.addEventListener("click", () => {
    console.log(urlBox.value);
});
