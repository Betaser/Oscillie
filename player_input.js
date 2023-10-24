/// INPUT
function setupTips() {
    document.addEventListener("click", (e) => {
        let tips = document.getElementsByClassName("tips")[0];
        tips.querySelector("p").innerHTML += "!";
        console.log(e);
    });
}

function setupPlayerInput() {
    document.addEventListener("keyup", (e) => {
        let matched = false;
        checkInput: for (const input of Object.keys(PlayerInputs)) {
            const codes = PlayerInputs[input];

            for (const code of codes) {
                if (e.code === code) {
                    PlayerInputsController[input] = false;
                    matched = true;
                    break checkInput;
                }
            }
        }
        if (!matched) {
            console.log(e.code);
        }
    });

    document.addEventListener("keydown", (e) => {
        let matched = false;
        checkInput: for (const input of Object.keys(PlayerInputs)) {
            const codes = PlayerInputs[input];

            for (const code of codes) {
                if (e.code === code) {
                    PlayerInputsController[input] = true;
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

function debugUpdateInput() {
    function movePlayer(x = 0, y = 0) {
        console.log(x, y);
        let player = document.getElementsByClassName("player")[0];
        const bounds = player.getBoundingClientRect();
        player.style.top = (bounds.y + y) + "px";
        player.style.left = (bounds.x + x) + "px";
    }

    if (PlayerInputsController.Jump) {
        console.log("jumpable");
    }
    if (PlayerInputsController.MoveLeft) {
        console.log("left");
    }
    if (PlayerInputsController.MoveRight) {
        console.log("right");
    } 
    if (PlayerInputsController.Reset) {
        console.log("reset");
    } 
    if (PlayerInputsController.SwitchWeapon) {
        console.log("switch weapon");
    } 
    // Debugging
    if (PlayerInputsController.DebugLeft) {
        movePlayer(-5, 0);
    } 
    if (PlayerInputsController.DebugRight) {
        movePlayer(5, 0);
    } 
    if (PlayerInputsController.DebugUp) {
        movePlayer(0, -5);
    } 
    if (PlayerInputsController.DebugDown) {
        movePlayer(0, 5);
    }
}