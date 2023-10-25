const entities = [];
const toRemove = [];

function addEntity(entity) {
    entities.push(entity);
}

function removeEntity(entity) {
    toRemove.push(entity);
}

function updateEntities(frames) {
    for (const entity of entities) {
        if (toRemove.includes(entity)) continue;

        entity.update(frames);
    }
}

function updateRenderEntities(frames) {
    for (const entity of entities) {
        // set the css bounds
        entity.render(frames);
    }
}