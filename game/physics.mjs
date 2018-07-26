/**
 * Created by Loic France on 10/01/2018
 */

import {Vec2, Rect, Circle} from "../geometry2d/geometry2d.mjs";

import {Object2dCollider, AABBObject2dCollider, ShapedObject2dCollider} from "./renderer_collider.mjs";

/**
 * @module game/physics
 */

function AABBvsAABB(aabb1, aabb2, rSpd) {
	const rct1 = aabb1.rect.clone(), rct2 = aabb2.rect;
	const norm = Vec2.zero;

	const r = Rect.getIntersection([rct1, rct2]);

	if(r.xMin === rct1.xMin) norm.x = - r.width;
	else if(r.xMax === rct1.xMax) norm.x = r.width;
	if(r.yMin === rct1.yMin) norm.y = - r.height;
	else if(r.yMax === rct1.yMax) norm.y = r.height;
	if(norm.x && norm.y) {
		if(r.ratio > rSpd.x/rSpd.y) norm.x = 0;
		else norm.y = 0;
	}
	return norm;
}
function AABBvsCircle(collider1, collider2, rSpd) {
	const r1 = collider1.rect, c2 = collider2.shape;
	const closest = r1.closestPointTo(c2.center);
	const norm = Vec2.translation(closest, c2.center);
	if(r1.contains(c2.center)) {
		return norm.setMagnitude(-norm.magnitude-c2.radius);
	}
	else return norm.setMagnitude(c2.radius-norm.magnitude);

}
function CirclevsCircle(collider1, collider2, rSpd) {
	const c1 = collider1.shape, c2 = collider2.shape;
	const norm = Vec2.translation(c1.center, c2.center),
		R = c1.radius + c2.radius, d = norm.magnitude;

	if(d === 0) return norm.setXY(R,0);
	else return norm.setMagnitude(R-d);

}

const Materials = {
	Rock       :{ density : 0.6,  restitution : 0.10, staticSquareFriction : 1, dynamicSquareFriction : 1},
	Wood       :{ density : 0.3,  restitution : 0.20, staticSquareFriction : 1, dynamicSquareFriction : 1},
	Metal      :{ density : 1.2,  restitution : 0.05, staticSquareFriction : 1, dynamicSquareFriction : 1},
	BouncyBall :{ density : 0.3,  restitution : 0.80, staticSquareFriction : 1, dynamicSquareFriction : 1},
	SuperBall  :{ density : 0.3,  restitution : 0.95, staticSquareFriction : 0, dynamicSquareFriction : 0},
	Pillow     :{ density : 0.1,  restitution : 0.20, staticSquareFriction : 1, dynamicSquareFriction : 1},
	Static     :{ density : 0.0,  restitution : 0.00, staticSquareFriction : 0, dynamicSquareFriction : 0},
	Liquid	   :{ density : 0.5,  restiturion : 0.01, staticSquareFriction : 0, dynamicSquareFriction : 0}
};
const G = 6.67408e-11;
class Force {
		constructor(vector) {
			this.vector = vector;
		}
		getDeltaSpeed(object, invMass, dT) {
			return this.vector.clone().mul(invMass * dT);
		}
}
class Impulse extends Force {
	constructor(vector) {super(vector);}
	getDeltaSpeed(object, invMass, dT) { return this.vector.clone().mul(invMass); }
}
class SpaceGravity extends Force {
	constructor(position, mass) {
		super(Vec2.ZERO)
		this.position = position;
		this.factor = G*mass;
	}
	getDeltaSpeed(object, invMass, dT) {
		if(invMass == 0) return Vec2.ZERO;
		let vector = Vec2.translation(object.getPosition(), this.position);
		return vector.setMagnitude(this.factor*dT/vector.squareMagnitude);
	}
}
class World {
	constructor() {
		this.forces = [];
	}
}
	/**
	 * @memberOf physics
	 * @class
	 */
class RigidBody {
	constructor(material = Materials.Rock) {
		this.material = material;
		/**
		 * @type {Array<physics.Force>}
		 */
		this.frameForces = [];
		/**
		 * @type {Array<Vec2>}
		 */
		this.positionCorrections = [];

		this.rotationSpeed = 0;
	}

	processForces(world, object, dT) {
		const sum = Vec2.zero;
		let i = this.frameForces.length;
		if(i) {
			while(i--) {
				sum.add(this.frameForces[i].getDeltaSpeed(object, this.invMass, dT));
			}
			this.frameForces = [];
		}
		i = world.forces.length;
		while(i--) {
			sum.add(world.forces[i].getDeltaSpeed(object, this.invMass, dT));
		}
		if(!sum.isZero()) object.speed.add(sum);
		const len = this.positionCorrections.length;
		if(len) {
			sum.set(this.positionCorrections[0]);
			i = len;
			while(--i) sum.add(this.positionCorrections[i]);
			sum.mul(1/len);
			object.move(sum);
			this.positionCorrections = [];
		}
	}

	static resolveCollision(obj1, collider1, obj2, collider2) {
		if(!collider1 instanceof Object2dCollider || !collider2 instanceof Object2dCollider)
			return; //only process 2d colliders

		const im1 = obj1.rigidBody.invMass, im2 = obj2.rigidBody.invMass;
		const mass_sum = (im1 ? 1/im1 : 0) + (im2 ? 1/im2 : 0);
		//console.log({im1, im2, mass_sum});
		if(mass_sum === 0)
			return; //objects have no mass. don't touch them.

		let norm, rSpd;
		if(collider1 instanceof AABBObject2dCollider) {
			if(collider2 instanceof AABBObject2dCollider) {
				rSpd = obj2.speed.clone().remove(obj1.speed);
				norm = AABBvsAABB(collider1, collider2, rSpd);
			} else if(collider2 instanceof ShapedObject2dCollider && collider2.shape instanceof Circle) {
				rSpd = obj2.speed.clone().remove(obj1.speed);
				norm = AABBvsCircle(collider1, collider2, rSpd);
			}
		} else if(collider1 instanceof ShapedObject2dCollider && collider1.shape instanceof Circle) {
			if(collider2 instanceof AABBObject2dCollider) {
				rSpd = obj1.speed.clone().remove(obj2.speed);
				norm = AABBvsCircle(collider2, collider1, rSpd).negate();
				rSpd.negate();
			}
			else if(collider2 instanceof ShapedObject2dCollider && collider2.shape instanceof Circle) {
				rSpd = obj2.speed.clone().remove(obj1.speed);
				norm = CirclevsCircle(collider1, collider2, rSpd);
			}
		}
		const nSpd = norm.clone().normalize();
		const spdAlongNorm = Vec2.dotProd(rSpd, nSpd);

		if(spdAlongNorm > 0) return; //the two objects are already separating each others




		//positional correction :
		const pos_corr = norm.clone().mul(1/mass_sum);
		norm.set(nSpd);
		//restitution impulse
		const rest = Math.min(
			obj1.rigidBody.material.restitution,
			obj2.rigidBody.material.restitution);
		norm.mul(-(1 + rest) * spdAlongNorm / (mass_sum));

		nSpd.mul(spdAlongNorm);
		rSpd.remove(nSpd); // WARNING : rSpd is now relative tangent speed

		//Friction calculation
		let mu = Math.sqrt(	obj1.rigidBody.material.staticSquareFriction +
							obj2.rigidBody.material.staticSquareFriction);
		const invMass_invSum = - obj1.rigidBody.invMass - obj2.rigidBody.invMass;

		if(rSpd.magnitude / invMass_invSum > spdAlongNorm * mu) { // <=> rSpd.magnitude/sum(invMass) < mu * normSpd
			rSpd.mul(-1/(obj1.rigidBody.invMass + obj2.rigidBody.invMass));
		} else {
			mu = Math.sqrt(	obj1.rigidBody.material.dynamicSquareFriction +
							obj2.rigidBody.material.dynamicSquareFriction);
			rSpd.setMagnitude(spdAlongNorm * mu);
		}

		if(im1) {
			obj1.rigidBody.positionCorrections.push(pos_corr.clone().mul(-im1));
			obj1.rigidBody.frameForces.push(
				new Impulse(norm.clone().negate()),
				new Impulse(rSpd.clone().negate()));
		}
		if(im2) {
			obj2.rigidBody.positionCorrections.push(pos_corr.mul(im2));
			obj2.rigidBody.frameForces.push(
					new Impulse(norm),
					new Impulse(rSpd));
		}
	}
};
RigidBody.prototype.invMass = 1; // 1/mass

export {
	Materials, G,
	Force, Impulse, SpaceGravity,
	World,
	RigidBody
}