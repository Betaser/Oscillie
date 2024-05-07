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

function updateRenderBoundsEntities(frames) {
    for (const entity of entities) {
        // Lazy, since this is for debugging anyways.
        if (entity.renderBounds !== undefined) {
            entity.renderBounds(frames);
        }
    }
}

class Entity {
    constructor(element, position, bounds) {
        this.element = element;
        this.position = position;
        this.bounds = bounds;
    }
}