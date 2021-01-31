import {createElement, createStyleSheet, htmlToElements} from "../utils/createHtml.mod.js";

const scriptPath = import.meta.url;
const stylesheetPath = scriptPath.substring(0, scriptPath.lastIndexOf('/')+1) + "web-env.css";

const onTabClick = Symbol("on tab click");


const [template] = htmlToElements(`
<div class="web-env">
    <slot name="theme"></slot>
    <slot name="top"></slot>
    <slot name="left"></slot>
    <slot name="right"></slot>
    <slot name="bottom"></slot>
    <slot name="footer"></slot>
    <slot name="main"></slot>
</div>
`);

class WebEnvironment extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const wrapper = template.cloneNode(true);
        shadow.append(
            createStyleSheet(stylesheetPath),
            wrapper
        );
    }
}
customElements.define('web-env', WebEnvironment);

export default WebEnvironment;