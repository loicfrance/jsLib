/**
 * Created by Loic France on 12/20/2016.
 */
"use strict";

/**
 * @module game/object_mixins
 * contains mixins to create objects with useful properties such as {@link objectProperties.health|health}<!--
 * -->, {@link objectProperties.energy|energy}, {@link objectProperties.tag|tag}, ...
 */
//######################################################################################################################
//#                                                       health                                                       #
//######################################################################################################################
	/**
	 * provides health methods and properties to create objects such as enemies, players, <!--
	 * -->destructible objects, ...
	 * adds the <code>health</code> attribute to the object, with a default value of 0 added <!--
	 * -->as a prototype property, and a <code>maxHealth</code> optional attribute <!--
	 * -->(not created by default, but used in method if it exists).
	 * also adds getters and setters for those two attributes, and two other methods : <!--
	 * --><code>{@link objectProperties.health.heal|heal}</code> and <!--
	 * --><code>{@link objectProperties.health.receiveDamage|receiveDamage}</code>
	 * @memberOf objectProperties
	 * @mixin objectProperties.health
	 */
const health = {
		health: 0,
		/**
		 * sets the value of the <code>health</code> attribute of the object to the specified value, <!--
		 * -->without checking it
		 * @param {number} value
		 */
		setHealth : function( value ) {
			this.health = value;
		},
		/**
		 * sets the value of the <code>maxHealth</code> attribute, <!--
		 * -->the maximum health this object can have.
		 * @param {number} value
		 */
		setMaxHealth : function( value ) {
			this.maxHealth = value;
		},
		/**
		 * adds the parameter value to the <code>health</code> and makes sure the <code>maxHealth</code> <!--
		 * -->value is not exceeded.
		 * @param {number} value
		 */
		heal : function( value ) {
			if(this.maxHealth !== undefined && this.health+value > this.maxHealth) {
				value = this.maxHealth;
			}
			else value += this.health;
			this.setHealth(value);
		},
		/**
		 * removes the specified <code>damages</code> from the <code>health</code>, <!--
		 * -->and if the value goes below 0,sets it to 0 and kills the object.
		 * @param {GameManager} gameManager
		 * @param {number} damages
		 */
		receiveDamage : function(gameManager, damages ) {
			if(damages >= this.health) {
				this.setHealth(0);
				this.kill(gameManager);
			}
			else this.setHealth(this.health-damages);
		},
		/**
		 * returns the value of the <code>health</code> attribute. default is 0.
		 * @returns {number}
		 */
		getHealth : function() {
			return this.health;
		},
		/**
		 * returns the value of the <code>maxHealth</code> attribute, or undefined if not set.
		 * @returns {number}
		 */
		getMaxHealth : function() {
			return this.maxHealth;
		}
	},
//######################################################################################################################
//#                                                       energy                                                       #
//######################################################################################################################
	/**
	 * provides energy methods and properties.
	 * adds the <code>energy</code> attribute to the object, with a default value of 0 added <!--
	 * -->as a prototype property, and a <code>maxEnergy</code> optional attribute <!--
	 * -->(not created by default, but used in method if it exists).
	 * also adds getters and setters for those two attributes, and two other methods : <!--
	 * --><code>{@link objectProperties.energy.recoverEnergy|recoverEnergy}</code> and <!--
	 * --><code>{@link objectProperties.energy.useEnergy|useEnergy}</code>
	 * @memberOf objectProperties
	 * @mixin objectProperties.energy
	 */
	energy = {
		energy : 0,
		/**
		 * sets the value of the <code>energy</code> attribute to the specified value.
		 * @param {number} value
		 */
		setEnergy : function( value ) {
			this.energy = value;
		},
		/**
		 * sets the value of the <code>maxEnergy</code> attribute to the specified value.
		 * @param {number} value
		 */
		setMaxEnergy : function( value ) {
			this.maxEnergy = value;
		},
		/**
		 * adds the specified amount of energy to the player, and make sure the total amount <!--
		 * -->does not exceed the maximum allowed
		 * @param {number} value
		 */
		recoverEnergy : function( value ) {
			const max = this.getMaxEnergy(), e = this.getEnergy();
			if(e < max)
				this.setEnergy( (e + value < max) ? e + value : max);
		},
		/**
		 * removes the specified value from the player's <code>energy</code> attribute if it has enough <!--
		 * -->and returns true if the amount has been taken from the object's <code>energy</code>
		 * @param {number} value
		 * @returns {boolean}
		 */
		useEnergy : function( value ) {
			const e = this.getEnergy();
			if(value > e) return false;
			else {
				this.setEnergy(e - value);
				return true;
			}
		},
		/**
		 * returns the value of the <code>energy</code> attribute. default is 0.
		 * @returns {number}
		 */
		getEnergy : function() {
			return this.energy || 0;
		},
		/**
		 * returns the value of the <code>maxEnergy</code> attribute, or undefined if not set.
		 * @returns {number}
		 */
		getMaxEnergy : function() {
			return this.maxEnergy || 0;
		}
	},
//######################################################################################################################
//#                                                         tag                                                        #
//######################################################################################################################
	tiledMap = {
		tilesOccupation: [[1]],
		setTile(tiledMap,x,y) {
			this.position.set(tiledMap.getTileCenter(x,y));
		},
		getTile(tiledMap) {
			return tiledMap.getTileIndices(this.position);
		}
	},
//######################################################################################################################
//#                                                         tag                                                        #
//######################################################################################################################
	/**
	 * provides tag methods and property.
	 * when needed, adds a <code>tags</code> attribute that will contain all future tags associated with the object.
	 * adds the following methods :
	 * - <code>{@link objectProperties.tag.addTag|addTag}</code> that adds the specified tag to the <!--
	 * -->current ones. creates the <code>tags</code> attribute if needed,
	 * - <code>{@link objectProperties.tag.hasTag|hasTag}</code> that checks if the object has <!--
	 * -->the specified tag,
	 * - <code>{@link objectProperties.tag#getTags|getTags}</code> that returns the <code>tags</code> <!--
	 * -->attribute,
	 * - <code>{@link objectProperties.tag#isTagged|isTagged}</code> that returns true if the object <!--
	 * -->has at least one tag,
	 * - <code>{@link objectProperties.tag#clearTags|clearTags}</code> that clears all tags of the object <!--
	 * -->by re-creating the <code>tags</code> attribute.
	 *
	 * You can also use some function such as <code>{@link objectProperties.tag_canHaveTag}</code> and <!--
	 * --><code>{@link objectProperties.tag_hasTag}</code>, that you can use as a filter for objects,  and <!--
	 * --><code>{@link objectProperties.tag_getAllObjectsWithTag}</code>.
	 * @memberOf objectProperties
	 * @property {Array|undefined} tags
	 * @mixin objectProperties.tag
	 */
	tag = {
		/**
		 * adds the specified tag to the object. If the object had no tag, the attribute <code>tags</code> <!--
		 * -->is created.
		 * @param {*} tag
		 */
		addTag: function( tag ) {
			if(!this.tags) this.tags = [tag];
			else this.tags.push(tag);
		},
		/**
		 * returns true if the object has the specified tag.
		 * @param {*} tag
		 * @returns {boolean}
		 */
		hasTag: function( tag ) {
			return this.tags !== undefined && this.tags.indexOf(tag) !== -1;
		},
		/**
		 * returns the <code>tags</code> attribute, containing all tags added to the objects
		 * @returns {Array<*>}
		 */
		getTags: function() {
			return this.tags;
		},
		/**
		 * returns true if the object has at least one tag.
		 * @returns {boolean}
		 */
		isTagged: function() {
			return this.tags !== undefined && this.tags.length > 0;
		},
		/**
		 * removes all tags of from the object by setting the <code>tags</code> attribute to an empty array
		 */
		clearTags: function() {
			this.tags = [];
		}
	},
	/**
	 * returns true if the object implements the {@link objectProperties.tag|tag} mixin.
	 * Can be used as a filter.
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	tag_canHaveTag = obj=>obj.hasTag !== undefined,
	/**
	 * returns true if the object implements the {@link objectProperties.tag|tag} mixin, <!--
	 * -->and has the specified tag. can be used as a filter to get all objects with a tag by binding the <!--
	 * -->first argument to the filtered tag
	 * @param {*} tag
	 * @param {GameObject} obj
	 * @returns {boolean}
	 */
	tag_hasTag = (tag, obj)=> obj.hasTag && obj.hasTag(tag),
	/**
	 * returns all objects in the game with the specified tag
	 * @param {GameManager} gameManager
	 * @param {*} tag
	 * @returns {GameObject[]}
	 */
	tag_getAllObjectsWithTag = (gameManager, tag=null)=> {
		if(tag) return gameManager.getObjects(tag_hasTag.bind(undefined, tag));
		else return gameManager.getObjects(tag_canHaveTag);
	};

export {health, energy, tiledMap, tag, tag_canHaveTag, tag_hasTag, tag_getAllObjectsWithTag};