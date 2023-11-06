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
        this.renderCalls = () => {};
    }

    update() {
        if (PlayerInputsController.MoveRight) {
            this.velocity.x += 1;
        }
        if (PlayerInputsController.MoveLeft) {
            this.velocity.x -= 1;
        }
        
        if (!PlayerInputsController.DebugTurnOffGravity) {
            // Gravity
            this.velocity.add(new Vector2(0, 0.25));
        }

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

        // TODO: Collision detection
        // AimOffset goes from the center of your bounding box.
        // The location the ghost is being set to is a temporary thing, until collision detection algorithsm are in testing phase.
        const bounds = this.element.getBoundingClientRect();
        const playerCenter = new Vector2(
            (bounds.right - bounds.left) / 2,
            (bounds.bottom - bounds.top) / 2
        );

        const cursorVelocity = mousePosition.minus(playerCenter);
        this.setGhost();

        const moundBounds = [];
        for (const entity of entities) {
            if (entity.element !== undefined && entity.element.className === "mound") {
                moundBounds.push(entity.bounds);
            }
        }

        const collision = this.bounds.calcCollision(moundBounds, cursorVelocity);
        if (collision === null) {
            this.collidedGhost.position = cursorVelocity.minus(playerCenter);
        } else {
            this.collidedGhost.position = collision.intersection;

            const [p1, p2] = collision.side;

            this.renderCalls = () => {
                if (!renderCollision) {
                    return;
                }
                const canvas = document.getElementById("debug-layer");
                let ctx = canvas.getContext("2d");
                ctx.lineWidth = 4;
                ctx.strokeStyle = `rgb(0, 0, 255)`;
                ctx.moveTo(Math.floor(p1.x), Math.floor(p1.y));
                ctx.lineTo(Math.floor(p2.x), Math.floor(p2.y));
                ctx.stroke();
            };
        }
    }

    setGhost() {
        if (PlayerInputsControllerKeyDown.DebugCollision) {
            const ghostStyle = this.ghost.element.style;
            ghostStyle.display = ghostStyle.display === "none" ? "block" : "none";
            const collidedStyle = this.collidedGhost.element.style;
            collidedStyle.display = ghostStyle.display;
        }

        const bounds = this.element.getBoundingClientRect();
        const playerCenter = new Vector2(
            (bounds.right - bounds.left) / 2,
            (bounds.bottom - bounds.top) / 2
        );
        this.ghost.position = mousePosition.minus(playerCenter);
    }

    renderBounds() {
        renderElementBounds(this.bounds);
        renderElementBounds(this.ghost.bounds);
        renderElementBounds(this.collidedGhost.bounds);
    }

    render() {
        this.renderCalls();

        renderElement(this.element, this.position);
        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));

        renderElement(this.ghost.element, this.ghost.position);
        this.ghost.bounds.set(Polygon.fromBoundingRect(this.ghost.element.getBoundingClientRect()));

        renderElement(this.collidedGhost.element, this.collidedGhost.position);
        this.collidedGhost.bounds.set(Polygon.fromBoundingRect(this.collidedGhost.element.getBoundingClientRect()));
    }
}