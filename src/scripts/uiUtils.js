function createElem(elemType, classes, parent) {
    let el
    if (elemType) {
        el = document.createElement(elemType)
        el.className = classes

        if (parent && parent instanceof HTMLElement) {
            parent.appendChild(el)
        }
    }

    return el
}

export { createElem }