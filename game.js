/*
TODO:
- Poll all types of necessary input; WAD, left click,
-  S, Spacebar, R
- Figure out how to split js code into multiple files
- Add some css
*/

const PlayerInputs = Object.freeze({
    Jump: ["KeyW", "Space"],
    DebugLeft: ["ArrowLeft"],
    DebugRight: ["ArrowRight"],
    DebugUp: ["ArrowUp"],
    DebugDown: ["ArrowDown"],
    MoveLeft: ["KeyA"],
    MoveRight: ["KeyD"],
    Reset: ["KeyR", "Backspace"],
    SwitchWeapon: ["KeyS"]
});

const PlayerInputsController = {
    Jump: false,
    DebugLeft: false,
    DebugRight: false,
    DebugUp: false,
    DebugDown: false,
    MoveLeft: false,
    MoveRight: false,
    Reset: false,
    SwitchWeapon: false
};

/// INPUT
setupTips();
setupPlayerInput();

// SETUP DEBUG GRID
const grid = document.getElementsByClassName("test-grid")[0];
for (let i = 0; i < 20; i++) {
    const gridCell = document.createElement("div");
    gridCell.innerHTML = i;
    grid.appendChild(gridCell);
}

// For now, only position is updated. This is a helper function, which does not need to be used but is nice and simple.
function renderElement(element, position) {
    element.style.top = position.y + "px";
    element.style.left = position.x + "px";
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromBoundingRect(rect) {
        let vector = new Vector2(rect.x, rect.y);
        return vector;
    }
}

class Player {
    // Element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position ??= Vector2.fromBoundingRect(element.getBoundingClientRect());
    }
    render() {
        renderElement(this.element, this.position);
    }
}

const player = new Player(document.getElementsByClassName("player")[0]);

// UPDATE LOOP
function update() {
    requestAnimationFrame(update);
    debugUpdateInput();

    if (PlayerInputsController.MoveRight) {
        player.position.x += 5;
    }
    if (PlayerInputsController.MoveLeft) {
        player.position.x -= 5;
    }
}

update();

// RENDERING LOOP (RUNS ASYNCHRONOUSLY)
function updateRender() {
    requestAnimationFrame(updateRender);
    player.render();
}

updateRender();