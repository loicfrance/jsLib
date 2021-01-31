const countSym = Symbol("count");
const waitingListSym = Symbol("waiting list");
const tokensSym = Symbol("token");
const timeout = Symbol("timeout");
const timeoutSetSym = Symbol("timeout is set");
const onReachZero = Symbol("on counter reach zero");

class BusyCount {

    [countSym] = 0;
    [waitingListSym] = [];

    constructor() { }

    get count() {
        return this[countSym];
    }
    get waitingCount() {
        return this[waitingListSym].length;
    }
    increment() {
        this[countSym]++;
    }
    decrement() {
        this[countSym]--;
        if(this.count === 0 && this.waitingCount > 0)
            this[onReachZero]();
    }
    async wait() {
        if (this.count === 0)
            return;
        else {
            await new Promise((resolve) => {
                this[waitingListSym].push(resolve);
            });
        }
    }

    [onReachZero]() {
        setTimeout(this[timeout]);
        this[timeoutSetSym] = true;
    }

    [timeout] = ()=> {
        this[timeoutSetSym] = false;
        if (this.count === 0 && this.waitingCount > 0) {
            const resolve = this[waitingListSym].shift();
            resolve();
            setTimeout(this[timeout]);
        }
    }
}
/*
class Semaphore {
    [tokensSym] = 0;
    [waitingListSym] = [];

    constructor() { }

    get tokens() {
        return this[tokensSym];
    }

    give() {
        this[tokensSym]++;
        if(this.tokens === 1) {
            while(this.tokens > 0 && this.waitingCount > 0) {
                const resolve = this[waitingListSym].shift();
                resolve();
            }
        }
    }
    async take() {
        if(this[tokensSym]===0) {
            await new Promise((resolve) => {
                this[waitingListSym].push(resolve);
            });
        }
        this[tokensSym]--;
    }
}
*/
export default BusyCount;
export {BusyCount};