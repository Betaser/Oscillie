// This is literally just shorthand for PlayerInputsController.DebugCollision.
let renderCollision = false;

class Player {
    // element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        this.position ??= Vector2.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = Polygon.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = this.bounds.clone();

        this.velocity = new Vector2(0, 0);

        // Make a duplicate Node for player-collision-ghost.
        const ghostElement = getElement("player collision-ghost");
        // Because we will be toggling this.
        ghostElement.style.display = getComputedStyle(ghostElement).getPropertyValue("display");

        this.ghost = new Entity(ghostElement, this.position.clone(), this.bounds.clone());

        // And for the collidedGhostElement (it's almost the exact same code).
        const collidedGhostElement = getElement("player collided-ghost");
        collidedGhostElement.style.display = getComputedStyle(collidedGhostElement).getPropertyValue("display");
        this.collidedGhost = new Entity(collidedGhostElement, this.position.clone(), this.bounds.clone());

        // For dirty rendering tests.
        this.renderCalls = [];
    }

    updateVelocity() {
        if (PlayerInputsController.MoveRight) {
            this.velocity.x += 1;
        }
        if (PlayerInputsController.MoveLeft) {
            this.velocity.x -= 1;
        }
    }

    moveToMouse() {
        // Let's build in the slide move too.
        const goHere = mousePosition.minus(relativeCenterOf(this.element.getBoundingClientRect()));

        // But don't actually go here, apply collision detection.
        const collision = this.calcMoundCollision();
        this.position.set(collision === null ? goHere : collision.gappedPosition);
    }

    relativeCenter() {
        const bounds = this.element.getBoundingClientRect();
        return relativeCenterOf(bounds);
    }

    calcMoundCollision(render, FLOAT_DIST = 20) {
        const playerCenter = Vector2.fromBoundingRect(this.element.getBoundingClientRect())
            .plus(this.relativeCenter());

        const cursorVelocity = mousePosition.minus(playerCenter);
        const moundBounds = [];
        for (const entity of entities) {
            if (entity.element !== undefined && entity.element.className === "mound") {
                moundBounds.push(entity.bounds);
            }
        }

        const collision = this.bounds.calcCollision(moundBounds, cursorVelocity, render);

        // If collision is null, make the translucent green collidedGhost at the location of the mousePosition.
        if (collision === null) {
            return null;
        }

        // Collision detection math, continued here
        const intersection = collision.intersection;
        let toIntersection = intersection.minus(collision.point);
        // Build in a gap. It should probably be a small forced value.
        const floatingDisplacement = this.bounds.calcFloatingDisplacement(collision, FLOAT_DIST);
        toIntersection = toIntersection.plus(floatingDisplacement);
        const gappedPosition = collision.invertedRaycast 
            ? this.position.minus(toIntersection)
            : this.position.plus(toIntersection);
        collision["gappedPosition"] = gappedPosition;

        return collision;
    }

    update() {
        this.updateVelocity();
        if (PlayerInputsControllerKeyDown.ResetVelocity) {
            this.velocity.set(new Vector2(0, 0));
        }
        
        // Gravity
        if (!PlayerInputsController.DebugTurnOffGravity && !renderCollision) {
            this.velocity.add(new Vector2(0, 0.25));
        }

        if (!renderCollision) {
            // Pretend there's ground, and for collision detection reasons, float a little above it.
            // With this pretend ground, apply major friction.
            const ground = getElement("ground");
            const groundLevel = ground.getBoundingClientRect().top;
            const playerHeight = this.element.getBoundingClientRect().height;
            const maxY = groundLevel - playerHeight - 10;

            if (this.position.y > maxY) {
                this.velocity.y = 0;
                this.position.y = maxY;

                this.velocity.x /= 1.2;
            }

            this.position.add(this.velocity);
        } else {
            // Since this is teleporting, this overrides this.position.
            if (PlayerInputsController.MoveToMouse) {
                this.moveToMouse();
            }
        }

        // TODO: Collision detection
        // The location the ghost is being set to is a temporary thing, 
        //   until collision detection algorithsm are in testing phase.
        this.renderCalls = [];

        this.setGhost();

        // Obtain collision
        const render = [];
        const collision = this.calcMoundCollision(render);
        this.collidedGhost.position = collision === null 
            ? mousePosition.minus(this.relativeCenter())
            : collision.gappedPosition;

        if (collision !== null) {
            const [p1, p2] = collision.side;
            if (renderCollision) {
                this.renderCalls.push(() => {
                    const canvas = document.getElementById("debug-layer");
                    let ctx = canvas.getContext("2d");
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = `rgb(0, 0, 255)`;
                    ctx.beginPath();
                    ctx.moveTo(Math.floor(p1.x), Math.floor(p1.y));
                    ctx.lineTo(Math.floor(p2.x), Math.floor(p2.y));
                    ctx.stroke();
                });
                this.renderCalls.push(() => {
                    for (const call of render) {
                        call();
                    }
                });
            }
        }
    }

    setGhost() {
        // If debug collision was just pressed!
        if (PlayerInputsControllerKeyDown.DebugCollision) {
            const ghostStyle = this.ghost.element.style;
            ghostStyle.display = ghostStyle.display === "none" ? "block" : "none";
            const collidedStyle = this.collidedGhost.element.style;
            collidedStyle.display = ghostStyle.display;
        }

        const bounds = this.element.getBoundingClientRect();
        const playerRelativeCenter = relativeCenterOf(bounds);
        this.ghost.position = mousePosition.minus(playerRelativeCenter);
    }

    renderBounds() {
        renderElementBounds(this.bounds);
        renderElementBounds(this.ghost.bounds);
        renderElementBounds(this.collidedGhost.bounds);
    }

    render() {
        for (const renderCall of this.renderCalls) {
            renderCall();
        }

        renderElement(this.element, this.position);
        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));

        renderElement(this.ghost.element, this.ghost.position);
        this.ghost.bounds.set(Polygon.fromBoundingRect(this.ghost.element.getBoundingClientRect()));

        renderElement(this.collidedGhost.element, this.collidedGhost.position);
        this.collidedGhost.bounds.set(Polygon.fromBoundingRect(this.collidedGhost.element.getBoundingClientRect()));
    }
}