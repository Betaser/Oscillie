
// Beginning of getting shooting input.
document.addEventListener("click", (e) => {
    let tips = document.getElementsByClassName("tips")[0];
    tips.querySelector("p").innerHTML += "!";
    console.log(e);
});
