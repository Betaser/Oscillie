const PlayerInputs = Object.freeze({
    Jump: ["KeyW", "Space"],
    DebugLeft: ["ArrowLeft"],
    DebugRight: ["ArrowRight"],
    DebugUp: ["ArrowUp"],
    DebugDown: ["ArrowDown"],
    DebugBounds: ["KeyB"],
    DebugTurnOffGravity: ["KeyG"],
    DebugCollision: ["KeyC"],
    MoveLeft: ["KeyA"],
    MoveRight: ["KeyD"],
    Reset: ["KeyR", "Backspace"],
    SwitchWeapon: ["KeyS"],
    MoveToMouse: [0], // left mouse click.
    ResetVelocity: ["KeyV"],
});

const PlayerInputsController = Object.assign({}, PlayerInputs);
for (const action of Object.keys(PlayerInputsController)) {
    PlayerInputsController[action] = false;
}

const LastPlayerInputs = Object.assign({}, PlayerInputs);
for (const action of Object.keys(LastPlayerInputs)) {
    LastPlayerInputs[action] = false;
}

const PlayerInputsControllerKeyDown = Object.assign({}, PlayerInputs);
for (const action of Object.keys(PlayerInputsController)) {
    PlayerInputsControllerKeyDown[action] = false;
}

/// DEBUG UI
getElement("debug-panel-close").addEventListener("click", () => {
    const debugPanel = getElement("debug-panel");
    const text = debugPanel.getElementsByClassName("debug-text")[0];
    text.innerHTML = "TODO, centering this button in this div took way longer than I'd like to admit :( Omg why does it have to be sideways 😭";
});

/// INPUT
setupTips();
setupInput();

/// SETUP DEBUG GRID
const grid = getElement("test-grid");
for (let i = 0; i < 20; i++) {
    const gridCell = document.createElement("div");
    gridCell.innerHTML = i;
    grid.appendChild(gridCell);
}

function getElement(uniqueClassName) {
    return document.getElementsByClassName(uniqueClassName)[0];
}

function getUnits(unitsType="px") {
    switch (unitsType) {
        case "px": return ["px", "px"];
        case "v": return ["vw", "vh"];
    }
    return "px";
}
// Both calls addEntity and puts the node into the DOM
function loadEntity(entity) {
    addEntity(entity);
    document.body.appendChild(entity.element);
}

function renderElementSize(element, size, units="px") {
    units = getUnits(units);
    element.style.width = size.x + units[0];
    element.style.height = size.y + units[1];
}

// For now, only position is updated. This is a helper function, which does not need to be used but is nice and simple.
function renderElement(element, position, units="px") {
    units = getUnits(units);
    element.style.left = position.x + units[0];
    element.style.top = position.y + units[1];
}

function renderElementBounds(bounds, colorString=`rgb(255, 0, 0)`) {
    // Choosing to render the bounds as well, as a wireframe.
    const canvas = document.getElementById("default-entities-layer");
    let ctx = canvas.getContext("2d");
    // This is the total width, therefore set to nice even values for clean lines.
    ctx.lineWidth = 4;
    ctx.strokeStyle = colorString;
    for (let i = 0; i < bounds.points.length; i++) {
        const pt1 = bounds.points[i];
        const pt2 = bounds.points[(i + 1) % bounds.points.length];
        ctx.moveTo(Math.floor(pt1.x), Math.floor(pt1.y));
        ctx.lineTo(Math.floor(pt2.x), Math.floor(pt2.y));
        ctx.stroke();
    }
}

/// SETUP ENTITIES
const player = new Player(getElement("player"));
addEntity(player);

const ballElement = document.createElement("div");
ballElement.className = "oscillating-ball";
const ball = new OscillatingBall(ballElement, new Vector2(50, 200));
loadEntity(ball);

// Create mounds
{
    const positionsAndSizes = [
        [new Vector2(60, 60), new Vector2(10, 10)],
        [new Vector2(70, 62), new Vector2(10, 8)],
        [new Vector2(80, 58), new Vector2(10, 12)],
    ];
    for (const [position, size] of positionsAndSizes) {
        const moundElement = document.createElement("div");
        moundElement.className = "mound";
        const mound = Mound.MakeDiv(position, size);
        // Mound calls document.body.appendChild so that it can get its own boundingClientRect in its constructor
        addEntity(mound);
    }
}

/// UPDATE LOOP
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

// Or like this
/*
function update() {
    setTimeout(() => {
        requestAnimationFrame(update);

        now = Date.now();
        elapsed = now - prevTime;
        prevTime = now - (elapsed % fpsInterval);

        updateInput();

        updateEntities(frames);
        frames++;

        const layers = document.getElementById("layers");
        for (const canvas of layers.getElementsByTagName("canvas")) {
            const screenRectangle = document.getElementById("screen-rect").getBoundingClientRect();
            canvas.width = screenRectangle.width;
            canvas.height = screenRectangle.height;
        }

        if (frames % displayFrameInterval === 0) {
            elapsedDisplay = now - prevDisplayTime;
            prevDisplayTime = now - (elapsedDisplay % displayFrameInterval);
            const currentFps = 1000 / (elapsedDisplay / displayFrameInterval);
            getElement("fps").innerHTML = "FPS: " + currentFps;
        }
    }, 1000 / fps);
}
*/

function update() {
    requestAnimationFrame(update);

    now = Date.now();
    elapsed = now - prevTime;

    if (elapsed > fpsInterval) {
        prevTime = now - (elapsed % fpsInterval);

        updateInput();

        updateEntities(frames);
        frames++;

        const layers = document.getElementById("layers");
        for (const canvas of layers.getElementsByTagName("canvas")) {
            const screenRectangle = document.getElementById("screen-rect").getBoundingClientRect();
            canvas.width = screenRectangle.width;
            canvas.height = screenRectangle.height;
        }

        if (frames % displayFrameInterval === 0) {
            elapsedDisplay = now - prevDisplayTime;
            prevDisplayTime = now - (elapsedDisplay % displayFrameInterval);
            const currentFps = 1000 / ( elapsedDisplay / displayFrameInterval);
            getElement("fps").innerHTML = "FPS: " + currentFps;
        }
    }
}

update();

let renderBounds = true;

/// RENDERING LOOP (RUNS ASYNCHRONOUSLY)
function updateRender() {
    requestAnimationFrame(updateRender);
    updateRenderEntities(frames);
    if (renderBounds) {
        updateRenderBoundsEntities(frames);
    }
}

updateRender();