
const mapSym = Symbol("Settings map");
const listenersSym = Symbol("Settings listeners");
const settingsSetSym = Symbol("Settings set");

class Settings {
    [mapSym] = new Map();
    [listenersSym] = new Map();
    [settingsSetSym] = new Map();

    constructor() { }

    setDefaultValue(key, value) {
        this[settingsSetSym].set(key, value);
    }
    getDefaultValue(key) {
        return this[settingsSetSym].get(key);
    }
    /**
     * @param {Map|[[any,any]]|Object} settingsSet
     */
    setDefaultValues(settingsSet) {
        ((settingsSet instanceof Map || settingsSet instanceof Array)
            ? settingsSet
            : Object.entries(settingsSet)
        ).forEach(([key, value])=> this.setDefaultValue(key, value));
    }

    getSetting(key, defaultValue = this.getDefaultValue(key)) {
        if (this[mapSym].has(key))
            return this[mapSym].get(key);
        else return defaultValue;
    }
    setSetting(key, value) {
        this[mapSym].set(key, value);
        //TODO call listeners
        this[listenersSym].forEach(([callback, keys])=> {
            if(keys.includes(key))
                callback(key, value);
        });
    }
    resetSettings() {
        this[mapSym].clear();
    }

    addListener(callback, ...keys) {
        this[listenersSym].set(callback, keys);
    }
    removeListener(callback) {
        this[listenersSym].delete(callback);
    }
}

export default Settings;
export {
    Settings
}