/*
TODO:
- Create a sinusoidally bouncing ball
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
setupInput();

// SETUP DEBUG GRID
const grid = getElement("test-grid");
for (let i = 0; i < 20; i++) {
    const gridCell = document.createElement("div");
    gridCell.innerHTML = i;
    grid.appendChild(gridCell);
}

function getElement(uniqueClassName) {
    return document.getElementsByClassName(uniqueClassName)[0];
}

// For now, only position is updated. This is a helper function, which does not need to be used but is nice and simple.
function renderElement(element, position) {
    element.style.top = position.y + "px";
    element.style.left = position.x + "px";
}

// Both calls addEntity and puts the node into the DOM
function loadEntity(entity) {
    addEntity(entity);
    document.body.appendChild(entity.element);
}

const player = new Player(getElement("player"));
addEntity(player);

const ballElement = document.createElement("div");
ballElement.className = "oscillating-ball";
const ball = new OscillatingBall(ballElement, new Vector2(50, 200));
loadEntity(ball);

// UPDATE LOOP
let frames = 0;

let fps, displayFrameInterval, fpsInterval, prevTime, prevDisplayTime, startTime;
let now, elapsed, elapsedDisplay;

function initFps(fpsValue) {
    fps = fpsValue;
    displayFrameInterval = fps / 2;
    fpsInterval = 1000 / fps;
    prevTime = Date.now();
    prevDisplayTime = Date.now();
    startTime = prevTime;
}
initFps(60);

function update() {
    requestAnimationFrame(update);

    now = Date.now();
    elapsed = now - prevTime;

    if (elapsed > fpsInterval) {
        prevTime = now - (elapsed % fpsInterval);

        debugUpdateInput();

        updateEntities(frames);
        frames++;

        const canvas = document.getElementById("default-entities-layer");
        const screenRectangle = document.getElementById("screen-rect").getBoundingClientRect();
        canvas.width = screenRectangle.width;
        canvas.height = screenRectangle.height;

        if (frames % displayFrameInterval === 0) {
            elapsedDisplay = now - prevDisplayTime;
            prevDisplayTime = now - (elapsedDisplay % displayFrameInterval);
            const currentFps = 1000 / ( elapsedDisplay / displayFrameInterval);
            getElement("fps").innerHTML = "FPS: " + currentFps;
        }
    }
}

update();

// RENDERING LOOP (RUNS ASYNCHRONOUSLY)
function updateRender() {
    requestAnimationFrame(updateRender);
    updateRenderEntities(frames);
}

updateRender();
