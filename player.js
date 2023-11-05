let renderCollision = false;

class Ghost {
    constructor(element, position, bounds) {
        this.element = element;
        this.position = position;
        this.bounds = bounds;
    }
}

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

        this.ghost = new Ghost(ghostElement, this.position.clone(), this.bounds.clone());
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

        // Pretend there's ground  
        // With this pretend ground, apply major friction.
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight;
        if (this.position.y > maxY) {
            this.velocity.y = 0;
            this.position.y = maxY;

            this.velocity.x /= 1.2;
        }

        this.position.add(this.velocity);

        // TODO: Collision detection
        // AimOffset goes from the center of your bounding box.
        renderCollision = PlayerInputsControllerKeyDown.DebugCollision;
        if (renderCollision) {
            const style = this.ghost.element.style;
            console.log(this.ghost.element);
            console.log(typeof(style.display));
            if (style.display === "none") {
                console.log("switch to block");
            }
            style.display = style.display === "none" ? "block" : "none";
            console.log(style.display);
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
    }

    render() {
        renderElement(this.element, this.position);
        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));

        renderElement(this.ghost.element, this.ghost.position);
        this.ghost.bounds.set(Polygon.fromBoundingRect(this.ghost.element.getBoundingClientRect()));
    }
}