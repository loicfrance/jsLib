

const resolveSym = Symbol("resolve read");
const rejectSym = Symbol("reject read")
const pendingValues = Symbol("pending values");

class AsyncQueue {

    /** @type {function} */
    [resolveSym] = undefined;

    /** @type {function} */
    [rejectSym] = undefined;

    /** @type {*[]} */
    [pendingValues] = [];

    constructor() { }

    /**
     * @return {number} number of unread values in the queue
     */
    get pendingValues() {
        return this[pendingValues].length;
    }

    /**
     * @return {boolean} true if the reader is waiting for a new value (the queue is empty)
     */
    get waiting() {
        return this[resolveSym] !== undefined;
    }

    /**
     * @return {boolean} true if there is no pending value
     */
    get empty() {
        return this.pendingValues === 0;
    }

    /**
     * If the queue reader is waiting for a value, the parameter si directly sent to it.
     * Otherwise, it is appended at the end of the pending values buffer
     * @param {*} value
     */
    write(value) {
        if(this.waiting) {
            const resolve = this[resolveSym];
            this[resolveSym] = undefined;
            resolve(value);
        } else {
            this[pendingValues].push(value);
        }
    }

    /**
     * If the pending values buffer is not empty, the buffer head is extracted and returned.
     * Otherwise, a promise is returned, resolved when a new value is sent to to queue.
     * If the previous read has not been finished, it is canceled first (promise rejected).
     * @return {Promise<unknown>}
     */
    async read() {
        if(!this.empty)
            return this[pendingValues].shift();
        else {
            this.cancelRead();
            return new Promise((resolve, reject) => {
                this[resolveSym] = resolve;
                this[rejectSym] = reject
            });
        }
    }

    /**
     * if the previous read operation has not been resolved, this function rejects it
     */
    cancelRead() {
        if(this.waiting)
            this[rejectSym]()
    }

    /**
     * removes all pending (unread) value from the queue.
     */
    clear() {
        if(!this.empty)
            this[pendingValues].splice(0);
    }
};

export default AsyncQueue;