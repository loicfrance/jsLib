import {createElement, createStyleSheet, htmlToElements} from "../utils/createHtml.mod.js";
import {dragListener as dragListenerTemplate} from "../utils/tools.mod.js";

const scriptPath = import.meta.url;
const stylesheetPath = scriptPath.substring(0, scriptPath.lastIndexOf('/')+1) + "stretch-panel.css";

const dragListener = Symbol("drag listener");
const updateVisiblePanel = Symbol("update panel 'no-content' attribute");

const wrapperSym = Symbol("html wrapper");
const tabsSlotSym = Symbol("tabs html slot");
const panelSlotSym = Symbol("panel html slot");
const resizerSym = Symbol("resizer html span");

const disableClickSym = Symbol("disable click at the end of mouse event");
const initialDeltaSym = Symbol("initial delta when moving resizer");

const [template] = htmlToElements(`
<div class="stretch-panel" no-content>
    <ul class="tabs"><slot name="tabs"/></ul>
    <slot class="panel" name="panel"></slot>
    <span class="resizer"></span>
</div>
`);

class StretchPanel extends HTMLElement {

    static get observedAttributes() {
        return ['tabs-pos', 'open', 'current-tab', 'transparent-resizer'];
    }

    [wrapperSym] = template.cloneNode(true);
    [tabsSlotSym] = this[wrapperSym].querySelector('slot[name=tabs]');
    [panelSlotSym] = this[wrapperSym].querySelector('.panel');
    [resizerSym] = this[wrapperSym].querySelector('.resizer');

    [disableClickSym] = false;
    [initialDeltaSym] = 0;

    constructor() {
        super();
        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        let tabsPos = this.getAttribute("tabs-pos")?.toLowerCase();
        if (!(['left', 'right', 'top', 'bottom'].includes(tabsPos)))
            throw Error("'tabs-pos' attribute must be defined and equal to 'left', 'right', 'top' or 'bottom'");

        this[wrapperSym].setAttribute("tabs-pos", tabsPos);

        shadow.appendChild(createStyleSheet(stylesheetPath));
        shadow.appendChild(this[wrapperSym]);
        this.panel.addEventListener('slotchange', this[updateVisiblePanel]);
        this.tabs.addEventListener('slotchange', this[updateVisiblePanel]);

        this.resizer.addEventListener('mousedown', this[dragListener]);
        this.resizer.addEventListener('click', ()=> {
            if(this[disableClickSym]) {
                this[disableClickSym] = false;
            } else {
                this.open = !this.open;
            }
        });
    }

    get resizer() { return this[resizerSym]; }
    get panel() { return this[panelSlotSym]; }
    get tabs() { return this[tabsSlotSym]; }

    get open() {
        return this.hasAttribute('open');
    }
    set open(value) {
        if(this.open === !value) {
            this.toggleAttribute('open');
        }
    }
    get tabsPosition() {
        return this.getAttribute('tabs-pos');
    }
    set tabsPosition(value) {
        if(!(['left', 'right', 'top', 'bottom'].contains(value)))
            throw Error(`cannot put tabs on '${value}'. Possible values are 'left', 'right', 'top' and 'bottom'.`);
        this.setAttribute('stretch-to', value);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'open' :
                this[wrapperSym].toggleAttribute('open', this.open);
                break;
            case 'tabs-pos' :
                this[wrapperSym].setAttribute('tabs-pos', newValue);
                break;
            case 'current-tab':
                this[updateVisiblePanel]();
                break;
            case 'transparent-resizer':
                const transparent = this.hasAttribute("transparent-resizer");
                this.resizer.toggleAttribute('transparent', transparent);
                break;
        }
    }
    [updateVisiblePanel] = ()=> {
        const panels = this.panel.assignedNodes();
        const tabs = this.tabs.assignedNodes();
        const currentId = this.getAttribute('current-tab');
        let hasContent = false
        for (const panel of panels) {
            const current = currentId && (panel.getAttribute('tab-id') === currentId);
            if (current && !hasContent)
                hasContent = true,
            panel.toggleAttribute('current-tab', current);
        }
        for (const tab of tabs) {
            const current = currentId && (tab.getAttribute('tab-id') === currentId);
            tab.toggleAttribute('current-tab', current);
        }
        if(!hasContent !== this[wrapperSym].hasAttribute('no-content'))
            this[wrapperSym].toggleAttribute('no-content', !hasContent);
    }

    [dragListener] = dragListenerTemplate.bind(this, {
        onStart: (evt, pos)=> {
            const resizerRect = this.resizer.getBoundingClientRect();
            switch(this.tabsPosition) {
                case 'left' : this[initialDeltaSym] = pos.x - resizerRect.right; break;
                case 'right' : this[initialDeltaSym] = pos.x - resizerRect.left; break;
                case 'top' : this[initialDeltaSym] = pos.y - resizerRect.bottom; break;
                case 'bottom' : this[initialDeltaSym] = pos.y - resizerRect.top; break;
            }
            this[disableClickSym] = false;
        },
        onMove: (evt, pos)=> {
            const resizerRect = this.resizer.getBoundingClientRect();
            let delta;
            switch(this.tabsPosition) {
                case 'left' : delta = pos.x - resizerRect.right - this[initialDeltaSym]; break;
                case 'right' : delta = resizerRect.left - pos.x + this[initialDeltaSym]; break;
                case 'top' : delta = pos.y - resizerRect.bottom - this[initialDeltaSym]; break;
                case 'bottom' : delta = resizerRect.top - pos.y + this[initialDeltaSym]; break;
            }
            if (delta !== 0)
                this[disableClickSym] = true;
            if (['left', 'right'].includes(this.tabsPosition)) {
                const w = Math.max(0, this.panel.offsetWidth + delta);
                if (w >= 10)
                    this.panel.style.width = w + 'px';
                this.open = w >= 10;
            } else {
                const h = Math.max(0, this.panel.offsetHeight + delta);
                if (h >= 10)
                    this.panel.style.height = h + 'px';
                this.open = h >= 10;
            }
        }
    });
}
customElements.define('stretch-panel', StretchPanel);

export default StretchPanel;