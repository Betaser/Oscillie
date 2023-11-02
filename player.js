class Player {

    // element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        this.position ??= Vector2.fromBoundingRect(element.getBoundingClientRect());
        this.bounds = Polygon.fromBoundingRect(element.getBoundingClientRect());
        this.velocity = new Vector2(0, 0);
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
            this.position.add(this.velocity);

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
        }

        // TODO: Collision detection
    }

    renderBounds() {
        // Choosing to render the bounds as well, as a wireframe.
        const canvas = document.getElementById("default-entities-layer");
        let ctx = canvas.getContext("2d");
        // This is the total width, therefore set to nice even values for clean lines.
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgb(255, 0, 0)`;
        for (let i = 0; i < this.bounds.points.length; i++) {
            const pt1 = this.bounds.points[i];
            const pt2 = this.bounds.points[(i + 1) % this.bounds.points.length];
            ctx.beginPath();
            ctx.moveTo(Math.floor(pt1.x), Math.floor(pt1.y));
            ctx.lineTo(Math.floor(pt2.x), Math.floor(pt2.y));
            ctx.stroke();
        }
    }

    render() {
        renderElement(this.element, this.position);

        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));
    }
}