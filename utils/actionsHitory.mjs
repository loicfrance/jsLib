
class HistoryPile {
    constructor(maxActions, undoCallback, redoCallback) {
        this.pastActions = [];
        this.futureActions = [];
        this.undoCallback = undoCallback;
        this.redoCallback = redoCallback;
        this.maxActions = maxActions
    }
    push(action) {
        this.pastActions.push(action);
        if (this.pastActions.length > this.maxActions) {
            this.pastActions.splice(0, this.pastActions.length - this.maxActions);
        }
        if (this.futureActions.length > 0)
            this.futureActions.splice(0, this.futureActions.length);
    }
    undo() {
        const action = this.pastActions.pop();
        if(action !== undefined) {
            this.futureActions.push(action);
            this.undoCallback(action);
        }
    };
    redo() {
        const action = this.futureActions.pop();
        if(action !== undefined) {
            this.pastActions.push(action);
            this.redoCallback(action);
        }
    };
}
export default HistoryPile;
