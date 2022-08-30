import { buildNotesList, renderAddNoteButtonCard, getNotes } from './notes'

export function firstRender() {
    refresh()
}

export function refresh() {
    document.querySelector('#content').innerHTML = ''

    if (getNotes().length > 0) {
        buildNotesList()
    }

    renderAddNoteButtonCard()
}