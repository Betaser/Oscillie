// This is literally just shorthand for PlayerInputsController.DebugCollision.
let renderCollision = false;
let debugPhysics = false;
let passedThru = false;

class Player {
    // element is like document.getElementsByClassName("...")[0]
    constructor(element, position = null) {
        this.element = element;
        this.position = position;
        this.position ??= Vector2.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = Polygon.fromBoundingRect(this.element.getBoundingClientRect());
        this.bounds = this.bounds.clone();

        this.acrossInitialGap = new Vector2(0, 0);
        this.acrossFinalGap = new Vector2(0, 0);

        this.onGround = false;

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

        const initialCollisionGhostElement = getElement("player initial-collision-ghost");
        initialCollisionGhostElement.style.display = getComputedStyle(initialCollisionGhostElement).getPropertyValue("display");
        this.initialCollisionGhost = new Entity(initialCollisionGhostElement, this.position.clone(), this.bounds.clone());

        // For dirty rendering tests.
        this.renderCalls = [];
    }

    mtmCollision(cursorVelocity = this.calcVelocity) {
        const moundBounds = [];
        for (const entity of entities) {
            // if (entity.element !== undefined && 
            if (entity.element.className === "mound") {
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
        // collision["gappedPosition"] = gappedPosition;

        return collision;
    }

    calcCollision() {
        /*
        maybe you could go from one frame?
           c2|
         c1  |
         ____|
        to 
           c1|
         c2  |
         ____|
        in which case, acrossIntialGap and acrossFinalGap should be swapped I guess?
        */

        // Note this should not activate in the air
        const velocityWithGapHelp = this.velocity.along(this.acrossInitialGap)
            ? this.velocity.plus(this.acrossInitialGap)
            : this.velocity;

        const initialCollision = this.mtmCollision(velocityWithGapHelp);

        if (initialCollision === null) {
            this.position.add(this.velocity);
            this.acrossInitialGap.set(new Vector2(0, 0));

            return;
        }

        if (initialCollision.invertedRaycast) {
            // console.log("init invert");
        }

        const initialSide = initialCollision.side[1].minus(initialCollision.side[0]);

        // To get the acrossInitialGap.
        this.acrossInitialGap = initialSide.perp()
                .normalized().scaled(GAP_DIST * 1.2);
        
        // console.log(this.acrossInitialGap);
        if (initialCollision.invertedRaycast) {
            // console.log(initialSide);
            // console.log(this.acrossInitialGap);
        }

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

        // nah, this is trying to detect when gapped is an issue.
        /*
        const toIntersection = initialCollision.intersection.minus(initialCollision.point);
        const collisionPosition = toIntersection.invertedRaycast
            ? this.position.minus(toIntersection)
            : this.position.plus(toIntersection);
        const gappedVelocity = initialCollision.gappedPosition.minus(collisionPosition);
        const gappedCollision = this.mtmCollision(gappedVelocity);

        if (gappedCollision === null) {
            this.position.set(initialCollision.gappedPosition);
        }
        */

        // Above is actually not a bad idea.

        // Now do slide collision.
        this.position.set(initialCollision.gappedPosition);
        renderElement(this.element, this.position);
        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));

        // remember, this.position was set to something different given that there was a collision.
        const projectedVelocity = this.velocity.projected(initialSide);
        this.velocity.set(projectedVelocity);
        const projectedVelocityWithGapHelp = projectedVelocity.along(this.acrossFinalGap)
            ? projectedVelocity.plus(this.acrossFinalGap)
            : projectedVelocity;
        
        const finalCollision = this.mtmCollision(projectedVelocityWithGapHelp);

        if (finalCollision === null) {
            this.position.add(projectedVelocity);
            /*
            if (this.position.y > this.calcMaxY()) {
                passedThru = true;
                console.log(this.acrossFinalGap);
                console.log(this.acrossInitialGap);
                console.log(initialCollision);
                console.log(projectedVelocity);
                console.log(projectedVelocityWithGapHelp);
                console.log("silly shits gone to fan");
            }
            */
            this.acrossFinalGap.set(new Vector2(0, 0));
            return;
        }

        const finalSide = finalCollision.side[1].minus(finalCollision.side[0]);


        this.position.set(finalCollision.gappedPosition);
        // To get the acrossFinalGap.
        this.acrossFinalGap = finalSide.perp()
            .normalized().scaled(GAP_DIST * 1.2);

        /*
        if (finalCollision.invertedRaycast) {
            console.log("final invert");
            console.log(finalSide);
            console.log(this.acrossFinalGap);
        }
        */
    }

    moveToMouse() {
        // Let's build in the slide move too.
        const initialGoHere = mousePosition.minus(relativeCenterOf(this.element.getBoundingClientRect()));

        // But don't actually go here, apply collision detection.
        const initialCollision = this.mtmCollision();
        // There are situations where we are less than GAP away from an object, and moving to
        //  gappedPosition sends us backwards into a different object.
        /*
        // Before
        this.position.set(initialCollision === null ? initialGoHere 
            : initialCollision.gappedPosition);
        // End before
        */
        if (initialCollision === null) {
            this.position.set(initialGoHere);
        } else {
            // It is possible that going to gappedPosition sends us backward into a different object.
            // If we then try take that movement and gap away from the different object, we can be sent
            //  back into the original object.
            // That's dumb, so instead, it means we are in a corner, and let's just slide out of it.
            const toIntersection = initialCollision.intersection.minus(initialCollision.point);
            const collisionPosition = initialCollision.invertedRaycast 
                ? this.position.minus(toIntersection)
                : this.position.plus(toIntersection);
            const gappedVelocity = initialCollision.gappedPosition.minus(collisionPosition);
            const gappedCollision = this.mtmCollision(gappedVelocity);
            if (gappedCollision === null) {
                this.position.set(initialCollision.gappedPosition); 
            } 
            // Else, we are stuck in a corner. Do nothing. Perform a slide.
        }
        
        if (initialCollision === null) {
            this.initialCollisionGhost.element.style.display = "none";
            return;
        }

        // This is where we have the correct visualization for pre-slide collision.
        this.initialCollisionGhost.position.set(this.position);
        this.initialCollisionGhost.element.style.display = "block";

        // Now perform the sliding operation.
        const restOfVelocity = initialGoHere.minus(this.position);
        // console.log(restOfVelocity);
        const side = initialCollision.side[1].minus(initialCollision.side[0]);

        // Get the projection of the rest of the velocity onto the colliding surface.
        const projectedVelocity = restOfVelocity.projected(side);
        // console.log(projectedVelocity);

        // We need to make this.bounds updated, since this.bounds.calcCollision is the collision algo.
        renderElement(this.element, this.position);
        this.bounds.set(Polygon.fromBoundingRect(this.element.getBoundingClientRect()));

        const finalCollision = this.mtmCollision(projectedVelocity);

        // console.log(finalCollision);

        this.position.set(finalCollision === null ? this.position.plus(projectedVelocity) : finalCollision.gappedPosition);
    }

    relativeCenter() {
        const bounds = this.element.getBoundingClientRect();
        return relativeCenterOf(bounds);
    }

    calcVelocity() {
        const playerCenter = Vector2.fromBoundingRect(this.element.getBoundingClientRect())
            .plus(this.relativeCenter());

        return mousePosition.minus(playerCenter);
    }

    calcMoundCollision(render, cursorVelocity = this.calcVelocity()) {
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
        const floatingDisplacement = this.bounds.calcFloatingDisplacement(collision);
        toIntersection = toIntersection.plus(floatingDisplacement);
        const gappedPosition = collision.invertedRaycast 
            ? this.position.minus(toIntersection)
            : this.position.plus(toIntersection);
        collision["gappedPosition"] = gappedPosition;

        return collision;
    }

    update() {
        if (passedThru) {
            return;
        }
        if (PlayerInputsControllerKeyDown.DebugPhysics) {
            debugPhysics = !debugPhysics;
        }
        if (debugPhysics) {
            console.log("vel: " + this.velocity);
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

            // this.position.add(this.velocity);

            if (PlayerInputsControllerKeyDown.ResetVelocity) {
                this.velocity.set(new Vector2(0, 0));
            }
        } else {
            // Since this is teleporting, this overrides this.position.
            if (PlayerInputsControllerKeyDown.MoveToMouse) {
                this.moveToMouse();
            }
        }

        if (this.onGround) {
            // console.log("onGround.");
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
            return;
        }

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

    calcMaxY() {
        const ground = getElement("ground");
        const groundLevel = ground.getBoundingClientRect().top;
        const playerHeight = this.element.getBoundingClientRect().height;
        const maxY = groundLevel - playerHeight - 6;
        return maxY;
    }

    setGhost() {
        // If debug collision was just pressed!
        if (PlayerInputsControllerKeyDown.DebugCollision) {
            const ghostStyle = this.ghost.element.style;
            ghostStyle.display = ghostStyle.display === "none" ? "block" : "none";
            const collidedStyle = this.collidedGhost.element.style;
            collidedStyle.display = ghostStyle.display;
            const initialCollisionStyle = this.initialCollisionGhost.element.style;
            initialCollisionStyle.display = "none";
        }

        const bounds = this.element.getBoundingClientRect();
        const playerRelativeCenter = relativeCenterOf(bounds);
        this.ghost.position = mousePosition.minus(playerRelativeCenter);
    }

    renderBounds() {
        renderElementBounds(this.bounds);
        renderElementBounds(this.ghost.bounds);
        renderElementBounds(this.collidedGhost.bounds);
        renderElementBounds(this.initialCollisionGhost.bounds);
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

        renderElement(this.initialCollisionGhost.element, this.initialCollisionGhost.position);
        this.initialCollisionGhost.bounds.set(Polygon.fromBoundingRect(this.initialCollisionGhost.element.getBoundingClientRect()));
    }
}