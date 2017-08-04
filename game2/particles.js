/**
 * Created by rfrance on 12/20/2016.
 */
/**
 * @callback game.particleGenerator
 * @param {number} lifeTime
 * @param {utils.geometry2d.Vec2} initialPosition
 * @param {number} angle
 * @param {number} speed
 * @returns {game.Particle}
 */
//######################################################################################################################
//#                                                      Particle                                                      #
//######################################################################################################################
window.game.Particle = (function(){
	"use strict";
	const Rect = utils.geometry2d.Rect;
	/**
	 * @class game.Particle
	 * @memberOf game
	 * @augments game.Object
	 * A type of object used to show visual effects
	 */
	class Particle extends game.Object {
		/**
		 * @constructor
		 * @param {?utils.geometry2d.Vec2} position
		 * @param {?game.ObjectRenderer} renderer
		 * @param {number} [lifeTime=2.0]
		 */
		constructor(position, renderer, lifeTime = 2.0) {
			super(position);
			if(renderer) this.renderer = renderer;
			this.lifeTime = lifeTime;
		}

		/**
		 * @returns {utils.geometry2d.Rect}
		 */
		getRect() {
			return this.getRenderRect();
		}

		/**
		 * @param gameManager
		 * @param dT
		 */
		onFrame( gameManager, dT ) {
			super.onFrame(gameManager, dT);
			if (!(gameManager.viewer.visibleRect.overlap(this.getRenderRect().addMargin(10))) || this.lifeTime <= 0) {
				this.lifeTime = 0; this.kill(gameManager);
			}
			else this.lifeTime -= dT;
		}
	}
	Particle.prototype.bodyLayer = -1;
	Particle.prototype.renderLayer = game.RenderLayer.PARTICLES;
	return Particle;
})();
window.game.ShapedParticle = (function() {
	/**
	 * @class game.ShapedParticle
	 * @memberOf game
	 * @augments game.Object
	 * A type of particle that uses a shape and a color but no renderer for faster rendering
	 */
	class ShapedParticle extends game.Particle{
		/**
		 * @constructor
		 * @param {number} lifeTime
		 * @param {typeof utils.geometry2d.Shape} shape
		 * @param {string|number} color
		 */
		constructor(lifeTime, shape, color) {
			if(!shape) {
				console.log(shape);
			}
			super();
			this.shape = shape;
			this.color = color;
			this.lifeTime = lifeTime;
		}
		/**
		 * @name game.ShapedParticle#position
		 * @type {utils.geometry2d.Vec2}
		 */
		get position() { return this.shape.center; }
		/**
		 *
		 * @param {utils.geometry2d.Vec2} p
		 */
		set position( p ) { this.shape.center.set(p); }
		rotate( radians ) { this.shape.rotate(radians); }
		scale( factor ) { this.shape.scale(factor); }
		getPosition() { return this.shape.center; }
		moveXY(x, y) { this.shape.moveXY(x, y); return this; }

		getRect() { return this.shape.getRect(); }
		getRenderRect() { return this.shape.getRect(); }
		render(ctx) {
			if(this.fill) {
				(ctx.fillStyle !== this.color) && (ctx.fillStyle = this.color);
				this.shape.draw(ctx, true, false);
			} else {
				(ctx.strokeStyle !== this.color) && (ctx.strokeStyle = this.color);
				this.shape.draw(ctx, false, true);
			}
		}
		/**
		 * draws the particle on the canvas with the specified color.
		 * @param {webgl.GlHandler} handler
		 * @param {WebGLRenderingContext} handler.gl - webgl context
		 * @param {Float32Array} handler.vertices - a large-enough array to use (avoids creating arrays every time) <!--
		 * -->to store vertices
		 * @param {Uint32Array} handler.colors - a large-enough array to use to store colors
		 * @param {WebGLBuffer} handler.glBuffer - the buffer created with <code>gl.createBuffer()</code>
		 * @param {string} handler.positionAttrib - the location of the <code>vec2</code> attribute used for <!--
		 * -->the position of the vertex in the vertex shader
		 * @param {string} handler.colorUniform - the location of the <code>int</code> uniform used for <!--
		 * -->the color in the vertex shader
		 */
		renderGL(handler) {
			handler.gl.uniform1i(handler.colorUniform, this.color);
			this.shape.glDraw(handler.gl, handler.vertices, handler.glBuffer, handler.positionAttrib, this.stroke);
		}
	}
	ShapedParticle.prototype.fill = true;
	return ShapedParticle;
})();
window.game.ImageParticle = (function(){
	let w, h;
	/**
	 * @class game.ImageParticle
	 * @memberOf game
	 * @augments game.Particle
	 * A type of particle that uses an image and some transform informations for drawing, without a renderer attribute
	 */
    class ImageParticle extends game.Particle {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} position
		 * @param {Image} renderer
		 * @param {number} [lifeTime=2.0]
		 */
    	constructor(position, image, lifeTime = 2.0) {
    		super(position, null, lifeTime);
    		this.image = image;
    		this.imgW = this.image.width;
    		this.imgH = this.image.height;
	    }
	    render( ctx ) {
    		w = this.imgW*this.scaleX; h = this.imgH*this.scaleY;
		    if(this.angle) {
			    ctx.translate(this.position.x, this.position.y);
			    ctx.rotate(this.angle);
			    ctx.drawImage(this.image, 0, 0, this.imgW, this.imgH, -w*0.5, -h*0.5, w, h);
			    ctx.rotate(-this.angle);
			    ctx.translate(-this.position.x, -this.position.y);
		    } else ctx.drawImage(this.image, 0, 0, this.imgW, this.imgH,
			    this.position.x - w*0.5, this.position.y - h*0.5, w, h);
	    }
    }
    utils.tools.merge(ImageParticle.prototype, {
    	scaleX: 1, scaleY: 1, angle: 0
    }, true);
    return ImageParticle;
})();
//######################################################################################################################
//#                                                   ParticleCreator                                                  #
//######################################################################################################################
window.game.ParticleCreator = (function() {
	const Vec2 = utils.geometry2d.Vec2;
	/**
	 * @class game.ParticleCreator
	 * @memberOf game
	 * @augments game.Object
	 * @classdesc a type of object used to continuously generate particles
	 */
    class ParticleCreator extends game.Object {
		/**
		 * @constructor
		 * @param {number} rate
		 * @param {number} [max=0]
		 */
		constructor(rate, max=0) {
    		super();
			/**
			 * number of particles created in one second.
			 * @name game.ParticleCreator#rate
			 * @type {number}
			 */
			this.rate = rate;
			/**
			 * number of particles created. equal to -1 if the creator is paused. if the <!--
			 * -->{@link game.ParticleCreator#max|max} attribute is equal to 0, this value is clamped between <!--
			 * -->0 and 1 to keep a high precision for creating particles continuously.
			 * When the creator is restarted, this value is set to 0.
			 * @name game.ParticleCreator#created
			 * @type {number}
			 */
			this.created = 0;
			/**
			 * maximum number of particles this creator can create in its lifetime. When this number is reached, <!--
			 * -->the creator stops creating particles and when no particles are living anymore, the creator <!--
			 * -->kills itself.
			 * If this value is equal to 0, the maximum is disabled : the creator will continuously create <!--
			 * -->particles until the game is over or the value changed.
			 * @name game.ParticleCreator#max
			 * @type {number}
			 */
			this.max = max;
			/**
			 * a list of all living particles in the game. Used to perform actions such as <!--
			 * -->speed damping or size damping.
			 * @name game.ParticleCreator#particles
			 * @type {game.Particle[]}
			 */
			this.particles = [];
	    }
	    /**
		 * sets the number of particles created per second
		 * @param {number} rate
		 */
		setRate( rate ) { this.rate = rate; }
		/**
		 * returns the number of particles created per second
		 * @returns {number}
		 */
		getRate() { return this.rate; }
		/**
		 * sets the minimum and maximum lifetime of the particles created. <!--
		 * -->The actual lifetime of the particles will be a random value between the maximum and the minimum.
		 * @param {number} min
		 * @param {number} [max=min] if max &lt; min, then max = min.
		 */
		setParticlesLifeTime( min, max=min ) {
			this.setMinLifeTime(min);
			this.setMaxLifeTime(max<min ? min : max);
		}
		/**
		 * sets the minimum lifetime of the particles created.
		 * @param {number} mlt
		 */
		setParticlesMinLifeTime( mlt ) { this.minLifeTime = mlt; }
		/**
		 * sets the maximum lifetime of the particles created.
		 * @param {number} mlt. no check is performed to make sure the maximum is above or equal to the maximum.
		 */
		setParticlesMaxLifeTime( mlt ) { this.maxLifeTime = mlt; }
		/**
		 * returns the minimum lifetime of the particles created.
		 * @returns {number}
		 */
		getParticlesMinLifeTime() { return this.minLifeTime; }
		/**
		 * returns the maximum lifetime of the particles created.
		 * @returns {number}
		 */
		getParticlesMaxLifeTime() { return this.maxLifeTime; }
		/**
		 * restarts the particle creation by setting the <code>{@link game.ParticleCreator#created|created}</code> attribute to 0.
		 */
	    restart() {
			this.created = 0;
	    }
		/**
		 * stops the particle creation by setting the <code>{@link game.ParticleCreator#created}</code> attribute to -1.
		 */
		stop() { this.created = -1; }
		/**
		 * returns true if the emitter is creating particles every frame (i.e if it hasn't been stopped <!--
		 * -->and if the maximum hasn't been reached).
		 * @returns {boolean}
		 */
		isRunning() { return this.emited >= 0 && (max ===0 || this.emited < max); }
		/**
		 * called every frame for each living particle
		 * @param {game.Particle] particle
		 * @param {number} dT
		 */
	    manageParticleOnFrame(particle, dT) {

	    }
	    /**
		 * create the specified number of particles using random values for lifeTime, position, angle and speed
		 * @param {game.GameManager} gameManager
		 * @param {number} number
		 * @returns {game.Particle[]}
		 */
	    createParticles(gameManager, number) {
    		let res = new Array(number);
		    while(number--) res[number] = this.createParticle( gameManager );
		    return res;
	    }
		/**
		 * create a particle using the particle generator.
		 * @param {game.GameManager} gameManager
		 * @returns {game.Particle}
		 */
	    createParticle(gameManager) {
    		let r = gameManager.viewer.visibleRect;
			return new game.ShapedParticle(
				Math.random()*(this.maxLifeTime - this.minLifeTime)+this.minLifeTime,
				new Point(new Vec2(r.left+ Math.random()*r.width, r.top + Math.random()*r.height)),
				utils.tools.randomColor(24));
	    }
	    /**
		 * called every frame by the game manager. creates the needed particles and add them to the game, <!--
		 * -->change their size and speed, ...
		 * @param {game.GameManager} gameManager
		 * @param {number} dT
		 */
	    onFrame( gameManager, dT ) {
    		super.onFrame(gameManager, dT);
    		let len = this.particles.length, i = len, p;
    		while(i--) {
    			if((p = this.particles[i]).lifeTime <= 0) {
    				this.particles.splice(i,1);
			    }
			    else this.manageParticleOnFrame(p, dT);
		    }
		    if(this.created >= 0) { // running
			    let next = this.created + dT * this.rate, n;
			    if (this.max) {
				    if (this.created >= this.max && len == 0)
					    this.kill(gameManager);
				    if (next > this.max) next = this.max;
				    n = Math.floor(next) - Math.floor(this.created);
			    }
			    else n = Math.floor(next);

			    if (n) {
				    let p = this.createParticles(gameManager, n);
				    if (p && p.length) {
					    Array.prototype.push.apply(this.particles, p);
					    gameManager.addObjects(p, false);
				    }
			    }
			    this.created = next;
			    if(!this.max) this.created %= 1;
		    }
	    }
		/**
		 * returns whether or not this objects can collide with other objects. Particles creators do not collide.
		 * @param {game.Object} object
		 * @returns {boolean} false
		 */
		canCollide( object ) { return false; }
    }
	/** @name game.ParticleCreator#minLifeTime
	 *  @type {number} */
	ParticleCreator.prototype.minLifeTime = 0.75;
	/** @name game.ParticleCreator#maxLifeTime
	 *  @type {number} */
	ParticleCreator.prototype.maxLifeTime = 1.2;
    return ParticleCreator;
})();
//######################################################################################################################
//#                                                   ParticleEmitter                                                  #
//######################################################################################################################
window.game.ParticleEmitter = (function() {
	const PI2 = utils.geometry2d.Circle.PI2,
		  Vec2 = utils.geometry2d.Vec2;
	/**
	 * @class game.ParticleEmitter
	 * @memberOf game
	 * @augments game.ParticleCreator
	 * @classdesc a type of particle creator that generates particles around its position
	 */
	class ParticleEmitter extends game.ParticleCreator {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} position
		 * @param {number} rate
		 * @param {number} max
		 */
		constructor( position, rate, max=0 ) {
			super(rate, max);
			this.setPosition(position);
		}
		/**
		 * sets the maximum and minimum emission angles to the specified values.
		 * @param {number} min
		 * @param {number} max
		 */
		setAngles( min, max=min ) {
			this.setMinAngle(min);
			this.setMaxAngle(max);
		}
		/**
		 * sets the minimum emission angle to the specified value.
		 * @param {number} min
		 */
		setMinAngle(min) { this.minAngle = min; }
		/**
		 * sets the maximum emission angle to the specified value.
		 * @param {number} max
		 */
		setMaxAngle(max) { this.maxAngle = max; }
		/**
		 * returns the minimum emission angle.
		 * @return {number}
		 */
		getMinAngle() { return this.minAngle; }
		/**
		 * returns the maximum emission angle.
		 * @return {number}
		 */
		getMaxAngle() { return this.maxAngle; }
		/**
		 * sets the distance from the emitter center the particles are created at.
		 * @param {number} emitDistance
		 */
		setEmitDistance( emitDistance ) { this.emitDistance = emitDistance; }
		/**
		 * returns the distance from the emitter center the particles are created at.
		 * @returns {number}
		 */
		getEmitDistance() { return this.emitDistance; }
		/**
		 * sets the speed damping factor.
		 * @param {number} factor
		 */
		setSpeedDampFactor( factor ) { this.speedDampFactor = factor; }
		/**
		 * returns the speed damping factor.
		 * @returns {number}
		 */
		getSpeedDampFactor() { return this.speedDampFactor; }
		/**
		 * sets the size reduce factor
		 * @param {number} factor
		 */
		setSizeReduceFactor( factor ) { this.reduceSizeFactor = factor; }
		/**
		 * returns the size reduce factor
		 * @returns {number}
		 */
		getSizeReduceFactor() { return this.reduceSizeFactor ; }
		/**
		 * rotates the emitter, changing the min and max angles
		 * @param {number} radians
		 */
		rotate( radians ) {
			super.rotate(radians);
			this.minAngle += radians;
			this.maxAngle += radians;
		}
		/**
		 * returns the particleGenerator that generates all particles
		 * @returns {game.particleGenerator}
		 */
		getParticleGenerator() { return this.particleGenerator; }
		/**
		 * sets the particle generator of the particle emitter.
		 * @param {game.particleGenerator} generator
		 */
		setParticleGenerator( generator ) { this.particleGenerator = generator; }
		/**
		 * creates a particle using the particle generator.
		 * @param {game.GameManager} gameManager
		 * @returns {game.Particle}
		 */
		createParticle( gameManager ) {
			let lifeTime  = this.maxLifeTime===this.minLifeTime ? this.minLifeTime :
					    Math.random()*(this.maxLifeTime-this.minLifeTime)+this.minLifeTime,
				spd = this.maxSpeed===this.minSpeed ?
						this.minSpeed :
						Math.random()*(this.maxSpeed-this.minSpeed)+this.minSpeed,
				pos = this.getPosition(),
				angle = this.minAngle===this.maxAngle ?
						this.minAngle :
						Math.random()*(this.minAngle-this.maxAngle)+this.minAngle,
				p = this.particleGenerator(lifeTime, pos, angle, spd);
			if(p) {
				if(spd) {
					let unit = Vec2.createFromAngle(angle);
					this.emitDistance && p.move(unit.clone().mul(this.emitDistance));
					p.speed = unit.mul(spd);
				} else if(this.emitDistance) {
					p.move(Vec2.createFromAngle(angle, this.emitDistance));
				}
			} return p;
		}
		manageParticleOnFrame( particle, dT ) {
			let speedFactor = Math.max(0, 1-this.speedDampFactor*dT),
				sizeFactor = Math.max(0, 1-this.reduceSizeFactor*dT);
			(speedFactor !== 1) && particle.speed && particle.speed.mul(speedFactor);
			(sizeFactor !== 1) && particle.scale(sizeFactor);
			if(this.particlePositionRelative) {
				let spd = this.getSpeed();
				if(!spd.isZero()) particle.move(spd.clone().mul(dT));
			}

		}
		static standardGenerator( lifeTime, initialPosition, angle, speed ){
			let sv = 0.5+(speed-this.minSpeed)/(2*(this.maxSpeed-this.minSpeed)),
				rgb = utils.tools.HSVtoRGB(angle/PI2, sv, sv),
				shape = new utils.geometry2d.Point(initialPosition);
			if(!shape){
				console.log("error : shape is null");
			} else return new game.ShapedParticle(lifeTime, shape,
				utils.tools.RGBToHex(rgb.r, rgb.g, rgb.b));
		}
	}
	//default attributes :
	utils.tools.merge(ParticleEmitter.prototype, {
		/** @name game.ParticleEmitter#minAngle
		 *  @type {number} */
		minAngle : 0,
		/** @name game.ParticleEmitter#maxAngle
		 *  @type {number} */
		maxAngle : 2*Math.PI,
		/** @name game.ParticleEmitter#minSpeed
		 *  @type {number} */
		minSpeed : 300,
		/** @name game.ParticleEmitter#maxSpeed
		 *  @type {number} */
		maxSpeed : 400,
		/** @name game.ParticleEmitter#speedDampFactor
		 *  @type {number} */
		speedDampFactor : 2.5,
		/** @name game.ParticleEmitter#reduceSizeFactor
		 *  @type {number} */
		reduceSizeFactor : 1.2,
		/** @name game.ParticleEmitter#emitDistance
		 *  @type {number} */
		emitDistance : 0,
		/** @name game.ParticleEmitter#particleGenerator
		 *  @type {game.particleGenerator} */
		particleGenerator : ParticleEmitter.standardGenerator
	}, true);
	return ParticleEmitter;
})();
//######################################################################################################################
//#                                                  ParticleExplosion                                                 #
//######################################################################################################################
window.game.ParticleExplosion = (function() {
	/**
	 * @class game.ParticleExplosion
	 * @augments game.ParticleEmitter
	 * @memberOf game
	 * @classdesc a type of particle emitter that generates all of its particles in one frame to simulate an explosion
	 */
    class ParticleExplosion extends game.ParticleEmitter {
		/**
		 * @constructor
		 * @param {utils.geometry2d.Vec2} position
		 * @param {number} number
		 */
		constructor( position, number ) {
		    super(position, number*1000, number);
	    }
    }
    utils.tools.merge(ParticleExplosion.prototype, {
	    minLifeTime : 0.1,
		maxLifeTime : 0.5,
		minSpeed : 500,
		maxSpeed : 1500,
		speedDampFactor : 2,
		reduceSizeFactor : 3
    }, true);
    return ParticleExplosion;
})();
//######################################################################################################################
//#                                                     TraceDrawer                                                    #
//######################################################################################################################
window.game.TraceDrawer = (function(){
	/**
	 * @class game.TraceDrawer
	 * @memberOf game
	 * @classdesc an object used to draw the trace of objects
	 */
    class TraceDrawer {
		/**
		 * @constructor
		 * @param {string} color - particle color
		 * @param {number} lifeTime - particle lifetime
		 */
		constructor(color, lifeTime) {
			if(color)
				/**
				 * @name game.TraceDrawer#color
				 * @type {string}
				 */
				this.color = color;
			if(lifeTime)
				/**
				 * @name game.TraceDrawer#particleLifeTime
				 * @type {number}
				 */
				this.particleLifeTime = lifeTime;
		}
		/**
		 * returns a particle array (or null) for the movement of the specified object
		 * @param {game.Object} obj
		 * @param [utils.geometry2d.Vec2} from
		 * @param [utils.geometry2d.Vec2} to
		 * @returns {?game.ShapedParticle[]}
		 */
	    createParticlesForMovement(obj, from, to) {
	    	let p = new game.ShapedParticle(this.particleLifeTime, new utils.geometry2d.Line(from, to), this.color||'#FFF');
	    	p.fill = false;
    		return [p];
	    }
		/**
		 * creates particles for the movements of the object
		 * @param {game.GameManager}
		 * @param {game.Object} obj
		 * @param {utils.geometry2d.Vec2} from
		 * @param {utils.geometry2d.Vec2} to
		 */
	    onMovement(gameManager, obj, from, to) {
    		let p = this.createParticlesForMovement(obj, from, to);
    		if(p && p.length) {
			    gameManager.addObjects(p, false);
		    }
	    }
    }
    return TraceDrawer;
})();