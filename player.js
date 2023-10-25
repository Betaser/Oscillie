class Player {
    // Element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position ??= Vector2.fromBoundingRect(element.getBoundingClientRect());
    }
    update() {
        if (PlayerInputsController.MoveRight) {
            player.position.x += 5;
        }
        if (PlayerInputsController.MoveLeft) {
            player.position.x -= 5;
        }
    }
    render() {
        renderElement(this.element, this.position);
    }
}