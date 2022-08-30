

function createElem(elemType, classes, parent, htmlContent) {
    let el
    if (elemType) {
        el = document.createElement(elemType)
        el.className = classes

        if (parent && parent instanceof HTMLElement) {
            parent.appendChild(el)
        }

        if (htmlContent) {
            el.innerHTML = htmlContent
        }
    }

    return el
}

function createInput(label, id, value) {
    let holder = createElem('div', 'form-input-holder mb-12')

    let labelElem = createElem('label', 'form-label', holder)
    labelElem.innerHTML = label || ""

    let inputElem = createElem('input', 'form-control', holder)

    if (id && id.length > 0) {
        inputElem.id = id
        labelElem.for = id
    }

    if (value && value.length > 0) {
        inputElem.value = value
    }

    return {
        holder: holder,
        label: labelElem,
        input: inputElem
    }
}


export { createElem, createInput }