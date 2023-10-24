/// INPUT
function setupTips() {
    document.addEventListener("click", (e) => {
        let tips = document.getElementsByClassName("tips")[0];
        tips.querySelector("p").innerHTML += "!";
        console.log(e);
    });
}

function setupPlayerInput() {
    function movePlayer(x = 0, y = 0) {
        console.log(x, y);
        let player = document.getElementsByClassName("player")[0];
        const bounds = player.getBoundingClientRect();
        player.style.top = (bounds.y + y) + "px";
        player.style.left = (bounds.x + x) + "px";
    }
    document.addEventListener("keydown", (e) => {
        let matched = false;
        checkInput: for (const input of Object.keys(PlayerInputs)) {
            const codes = PlayerInputs[input];

            for (const code of codes) {
                if (e.code === code) {
                    // console.log("code " + code);
                    /*
                    console.log(Object.values(PlayerInputs.Jump));
                    console.log("jump " + PlayerInputs.Jump);
                    */
                    if (PlayerInputs.Jump.includes(code)) {
                        console.log("jumpable");
                    } else if (PlayerInputs.MoveLeft.includes(code)) {
                        console.log("left");
                    } else if (PlayerInputs.MoveRight.includes(code)) {
                        console.log("right");
                    } else if (PlayerInputs.Reset.includes(code)) {
                        console.log("reset");
                    } else if (PlayerInputs.SwitchWeapon.includes(code)) {
                        console.log("switch weapon");
                    } else if (PlayerInputs.DebugLeft.includes(code)) {
                        movePlayer(-5, 0);
                    } else if (PlayerInputs.DebugRight.includes(code)) {
                        movePlayer(5, 0);
                    } else if (PlayerInputs.DebugUp.includes(code)) {
                        movePlayer(0, -5);
                    } else if (PlayerInputs.DebugDown.includes(code)) {
                        movePlayer(0, 5);
                    }

                    matched = true;
                    break checkInput;
                }
            }
        }
        if (!matched) {
            console.log(e.code);
        }
    });
}
