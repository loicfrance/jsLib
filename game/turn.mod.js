/**
 * @module game/TurnManager
 */
class TurnManager {
	constructor(array, sortFunction = null) {
		this.objects = array || [];
		this.cursor = this.objects.length > 0 ? 0 : -1;
		this.sortFunction = sortFunction;
	}
	add(obj) {
		this.objects.push(obj);
	}
	remove(obj) {
		const i = this.objects.indexOf(obj);
		if(i >=0 ) {
			this.objects.slice(i, i+1);
			return true;
		} else {
			return false;
		}
	}
	goToNext() {
		if(this.objects.length > 0) {
			if(this.cursor === -1 || this.cursor >= this.objects.length-1)
				this.cursor = 0;
			else this.cursor++;
			return this.objects[this.cursor];
		} else return null;
	}
	getCurrent() {
		if(this.cursor >= 0 && this.cursor < this.objects.length) return this.objects[this.cursor];
		else return null;
	}
	getPrevious() {
		if(this.cursor >= 0 && this.cursor < this.objects.length) return this.objects[(this.cursor-1) % this.objects.length];
		return null;
	}
	getNext() {
		if(this.objects.length > 0) {
			if(this.cursor === -1 || this.cursor >= this.objects.length-1)
				return this.objects[0];
			else return this.objects[this.cursor+1];
		} else return null;
	}
	getFirst() {
		if(this.objects.length > 0) return this.objects[0];
		else return null;
	}
	getLast() {
		if(this.objects.length > 0) return this.objects[this.objects.length-1];
	}
	goTo(obj) {
		const i = this.objects.indexOf(obj);
		if(i >= 0 ) {
			this.cursor = i;
			return true;
		} else return false;
	}
	goToFirst() {
		if(this.objects.length > 0)
			this.cursor = 0;
		else this.cursor = -1;

	}
	goToLast() {
		this.cursor = this.objects.length-1;
	}
	sort() {
		if(this.sortFunction) this.objects.sort(this.sortFunction);
	}
}
export default TurnManager;