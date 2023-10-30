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
            player.position.x += 5;
        }
        if (PlayerInputsController.MoveLeft) {
            player.position.x -= 5;
        }
        
        // Gravity
        this.velocity.add(new Vector2(0, 0.25));
        this.position.add(this.velocity);

        // Pretend there's ground  
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight;
        if (this.position.y > maxY) {
            this.velocity.y = 0;
            this.position.y = maxY;
        }

        // 476.8
        console.log(groundLevel);

        // TODO: Collision detection
    }

    render() {
        renderElement(this.element, this.position);
        /*
        // this.bounds.set(Polygon.fromBoundingRect(element.getBoundingClientRect()));

        // Choosing to render the bounds as well, as a wireframe
        const pt1 = this.bounds.points[0];
        const pt2 = this.bounds.points[1];
        const canvas = document.getElementById("default-entities-layer");
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
        */
    }
}