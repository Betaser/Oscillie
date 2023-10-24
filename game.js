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
    Reset: ["Backspace"],
    SwitchWeapon: ["KeyS"]
});

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