
function createElement(tag, attrs, ...childNodes) {
    const elmt = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if(value !== undefined)
            elmt.setAttribute(key, value);
        else
            elmt.toggleAttribute(key, true);
    }
    for(const childNode of childNodes) {
        if (childNode.substr) {
            elmt.innerText += childNode;
        }
        else if (childNode instanceof HTMLElement) {
            elmt.appendChild(childNode);
        }
    }
    return elmt;
}
function createStyleSheet(href) {
    return createElement("link", {rel: "stylesheet", href: href});
}

/**
 * create HTML elment nodes from strings
 * @param {String} htmlStringNodes
 * @return {NodeListOf<ChildNode>}
 */
const htmlToElements = function(...htmlStringNodes) {
    var template = document.createElement('template');
    template.innerHTML = htmlStringNodes
        .map(txt=>txt.trim())
        .join("");
    return template.content.childNodes;
}

export {
    createElement,
    createStyleSheet,
    htmlToElements
};