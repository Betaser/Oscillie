// This is literally just shorthand for PlayerInputsController.DebugCollision.
let renderCollision = false;
let passedThru = false;

class Player {
    // element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        this.position ??= Vector2.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = Polygon.fromBoundingRect(this.element.getBoundingClientRect()).clone();
        this.initialBoundsPosition = this.bounds.points[0].clone();

        this.acrossInitialGap = new Vector2(0, 0);
        this.acrossFinalGap = new Vector2(0, 0);

        this.onGround = false;

        this.velocity = new Vector2(0, 0);

        // And for the collidedGhostElement (it's almost the exact same code).
        /* keep as example for debugging entities.
        const collidedGhostElement = getElement("player collided-ghost");
        collidedGhostElement.style.display = getComputedStyle(collidedGhostElement).getPropertyValue("display");
        this.collidedGhost = new Entity(collidedGhostElement, this.position.clone(), this.bounds.clone());
        */

        // For dirty rendering tests.
        this.renderCalls = [];
    }

    mtmCollision(cursorVelocity) {
        const moundBounds = [];
        for (const entity of entities) {
            if (entity.element.className === "mound") {
                // mounds have bounds.
                moundBounds.push(entity.bounds);
            }
        }

        const collision = this.bounds.calcCollision(moundBounds, cursorVelocity, []);

        // If collision is null, make the translucent green collidedGhost at the location of the mousePosition.
        if (collision === null) {
            return null;
        }

        // Collision detection math, continued here
        const intersection = collision.intersection;
        let toIntersection = intersection.minus(collision.point);
        // Build in a gap. It should probably be a small forced value.
        const floatingDisplacement = this.bounds.calcFloatingDisplacement(collision, GAP_DIST);

        toIntersection.add(floatingDisplacement);
        const gappedPosition = collision.invertedRaycast 
            ? this.position.minus(toIntersection)
            : this.position.plus(toIntersection);
        collision.gappedPosition = gappedPosition;

        return collision;
    }

    // This is the normal, every frame ran collision function.
    calcCollision() {
        const velocityWithGapHelp = this.velocity.along(this.acrossInitialGap)
            ? this.velocity.plus(this.acrossInitialGap)
            : this.velocity;

        const initialCollision = this.mtmCollision(velocityWithGapHelp);

        if (initialCollision === null) {
            this.position.add(this.velocity);
            this.acrossInitialGap.set(new Vector2(0, 0));

            return;
        }

        const initialSide = initialCollision.side[1].minus(initialCollision.side[0]);

        // To get the acrossInitialGap.
        this.acrossInitialGap = initialSide.perp().normalized().scaled(GAP_DIST * 1.2);
        
        // console.log(this.acrossInitialGap);

        // if the side is the bottom
        if (initialCollision.invertedRaycast) {
            if (initialCollision.sideIdx === 2)  {
                this.onGround = true;
            }
        } else {
            // say all floors are the 3rd side of every mound.
            for (const entity of entities) {
                if (entity.element.className !== "mound") {
                    continue;
                }
                if (entity.bounds === initialCollision.polygonRef) {
                    // console.log(initialCollision.sideIdx);
                }
                if (entity.bounds === initialCollision.polygonRef && initialCollision.sideIdx === 0) {
                    this.onGround = true;
                }
            }
        }

        // Now do slide collision.
        this.position.set(initialCollision.gappedPosition);
        // renderElement(this.element, this.position);
        // this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));
        this.bounds.moveTo(this.initialBoundsPosition, this.position)

        // remember, this.position was set to something different given that there was a collision.
        const projectedVelocity = this.velocity.projected(initialSide);
        this.velocity.set(projectedVelocity);
        const projectedVelocityWithGapHelp = projectedVelocity.along(this.acrossFinalGap)
            ? projectedVelocity.plus(this.acrossFinalGap)
            : projectedVelocity;
        
        const finalCollision = this.mtmCollision(projectedVelocityWithGapHelp);

        if (finalCollision === null) {
            this.position.add(projectedVelocity);
            this.acrossFinalGap.set(new Vector2(0, 0));
            return;
        }

        const finalSide = finalCollision.side[1].minus(finalCollision.side[0]);


        this.position.set(finalCollision.gappedPosition);
        // To get the acrossFinalGap.
        this.acrossFinalGap = finalSide.perp()
            .normalized().scaled(GAP_DIST * 1.2);
    }

    relativeCenter() {
        const bounds = this.element.getBoundingClientRect();
        return relativeCenterOf(bounds);
    } 

    update() {
        if (passedThru) {
            return;
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
            const maxY = groundLevel - playerHeight - 6;

            if (this.position.y > maxY) {
                this.velocity.y = 0;
                this.position.y = maxY + 1;

                this.velocity.x /= 1.2;
                this.onGround = true;
                // console.log("aboveMaxY");
            }

            if (PlayerInputsControllerKeyDown.ResetVelocity) {
                this.velocity.set(new Vector2(0, 0));
            }
        } else {
            // Since this is teleporting, this overrides this.position.
            if (PlayerInputsControllerKeyDown.MoveToMouse) {
                console.log("try to move to mouse, but that debugging doesn't seem useful");
            }
        }

        // On a ground surface.
        if (this.onGround) {
            this.velocity.x /= 1.2;
        }
        if (PlayerInputsController.MoveRight) {
            this.velocity.x += this.onGround ? 1 : 0.1;
        }
        if (PlayerInputsController.MoveLeft) {
            this.velocity.x -= this.onGround ? 1 : 0.1;
        }
        if (this.onGround && PlayerInputsController.Jump) {
            this.velocity.y -= 10;
        }
        if (this.onGround && PlayerInputsControllerKeyDown.Hop) {
            this.velocity.y -= 3;
        }
        if (PlayerInputsControllerKeyDown.DiveRight) {
            this.velocity.y += 4;
            this.velocity.x += 4;
        }
        // since we bounce on polygons with our large GAP, there isn't a perfect solution to this.
        this.onGround = false;

        if (!renderCollision) {
            // determines final value for onGround.
            this.calcCollision();
            // unshift to 0,0 plus the initial position.
            this.bounds.moveTo(this.initialBoundsPosition, this.position)
            return;
        }

        // The location the ghost is being set to is a temporary thing, 
        //   until collision detection algorithsm are in testing phase.

        // old debug ghost code.
        /*
        this.renderCalls = [];
        this.setGhost();
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
        */
    }

    calcMaxY() {
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight - 6;
        return maxY;
    }

    setGhost() {
        // If debug collision was just pressed!
        /*
        if (PlayerInputsControllerKeyDown.DebugCollision) {
            const ghostStyle = this.ghost.element.style;
            ghostStyle.display = ghostStyle.display === "none" ? "block" : "none";
        }
        */
    }

    renderBounds() {
        renderElementBounds(this.bounds);
    }

    render() {
        for (const renderCall of this.renderCalls) {
            renderCall();
        }

        renderElement(this.element, this.position);
        // Instead, we shift bounds to our position.
        // this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));
    }
}