class Mound {

    static MakeDiv(position, size, units="v") {
        const element = document.createElement("div");
        element.className = "mound";
        renderElementSize(element, size, units);
        renderElement(element, position, units);
        document.body.appendChild(element);

        const mound = new Mound(element, position);
        return mound;
    }

    constructor(element, position) {
        this.element = element;
        this.position = position;
        this.bounds = Polygon.fromBoundingRect(this.element.getBoundingClientRect());
    }

    update() {}

    render() {
        renderElement(this.element, this.position, "v");
    }

    renderBounds() {
        renderElementBounds(this.bounds);

        // this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));
    }

}