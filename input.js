/// INPUT
function setupTips() {
    document.addEventListener("click", (e) => {
        let tips = document.getElementsByClassName("tips")[0];
        tips.querySelector("p").innerHTML += "!";
        console.log(e);
    });
}

function setupInput() {
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

let pressedRenderBounds = false;
function debugUpdateInput() {
    // Visual debugging with a ugly one-time-use (so far) of toggling an input.
    if (!pressedRenderBounds && PlayerInputsController.DebugBounds) {
        renderBounds = !renderBounds;
        pressedRenderBounds = true;
    }
    if (pressedRenderBounds && !PlayerInputsController.DebugBounds) {
        pressedRenderBounds = false;
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

    function movePlayer(x = 0, y = 0) {
        console.log(x, y);
        player.position.x += x;
        player.position.y += y;
    }

    // Movement
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