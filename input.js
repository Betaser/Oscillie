/// INPUT
let mouseX = 0;
let mouseY = 0;
let mousePosition = new Vector2(mouseX, mouseY);
onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mousePosition.x = mouseX;
    mousePosition.y = mouseY;
};

function updateInputs(e, eventInfoToCheck = "code", keyDown = true) {
    let matched = false;
    checkInput: for (const input of Object.keys(PlayerInputs)) {
        const codes = PlayerInputs[input];

        for (const code of codes) {
            if (e[eventInfoToCheck] === code) {
                PlayerInputsController[input] = keyDown;
                matched = true;
                break checkInput;
            }
        }
    }
    if (!matched) {
        console.log(e[eventInfoToCheck]);
    }
}

onmouseup = (e) => {
    updateInputs(e, "button", false);
}

onmousedown = (e) => {
    updateInputs(e, "button", true);
};

function setupTips() {
    document.addEventListener("click", () => {
        let tips = document.getElementsByClassName("tips")[0];
        tips.querySelector("p").innerHTML += "!";
    });
}

function setupInput() {
    document.addEventListener("keyup", (e) => {
        updateInputs(e, "code", false);
    });

    document.addEventListener("keydown", (e) => {
        updateInputs(e, "code", true);
    });
    // I can do document.addEventListener "click", but it's annoying that it will only activate on clicks,
    //  and therefore I would have to invert the dependency of PlayerInputsController and PlayerInputsControllerKeyDown for just the mouse, bleh.
}

function updateInput() {
    // Proper way to toggle an input.
    for (const input of Object.keys(PlayerInputsController)) {
        PlayerInputsControllerKeyDown[input] = !LastPlayerInputs[input] && PlayerInputsController[input];
        LastPlayerInputs[input] = PlayerInputsController[input];
    }

    // Debugging toggling if checks go here.
    if (PlayerInputsControllerKeyDown.DebugBounds) {
        renderBounds = !renderBounds;
    }
    if (PlayerInputsControllerKeyDown.DebugCollision) {
        renderCollision = !renderCollision; 
    }

    if (PlayerInputsController.Jump) {
        // console.log("jumpable");
    }
    if (PlayerInputsController.MoveLeft) {
        // console.log("left");
    }
    if (PlayerInputsController.MoveRight) {
        // console.log("right");
    } 
    if (PlayerInputsControllerKeyDown.Reset) {
        console.log("reset");
    } 
    if (PlayerInputsControllerKeyDown.SwitchWeapon) {
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

    // Superset logic
}