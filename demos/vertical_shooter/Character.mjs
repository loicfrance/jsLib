/**
 * @module Character
 */
import {GameObject} from "../../game/object.mjs";
import {merge, mix} from "../../utils/tools.mjs";
import {energy, health, tag} from "../../game/object_mixins.mjs";
import {Vec2} from "../../geometry2d/geometry2d.mjs"

class Character extends mix(GameObject, tag, health, energy) {
    constructor(position) {
        super(position, Vec2.ZERO);
        this.setHealth(this.maxHealth);
        this.setEnergy(0);
        this.addTag("character");
    }
    shoot(gameManager, bullet, energy) {
        if (this.useEnergy(energy)) {
            gameManager.addObject(bullet);
            return true;
        }
        else return false;
    }
    onDeath(gameManager) {
        super.onDeath(gameManager);
        gameManager.fireObjectDestroyedEvent(this);
    }
}
merge(Character.prototype,{
    maxHealth: 100,
    maxEnergy: 100,
}, true);
export {Character};