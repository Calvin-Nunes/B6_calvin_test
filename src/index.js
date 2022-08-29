import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css'

import { notesController } from './scripts/notes'
import { createElem } from './scripts/uiUtils'

let storedNotes = null

function firstRender() {
    storedNotes = notesController.getNotes()

    if (storedNotes && storedNotes.length > 0) {
        buildNotesList()
    }

    renderSingleAddNote()
}

function buildNotesList() { }

function renderSingleAddNote() {
    let mainContainer = document.querySelector('#content')

    let containerAddNoteCard = createElem('div', 'card no-notes-card')
    containerAddNoteCard.addEventListener('click', notesController.onClickAddNote)

    let cardInnerElement = createElem('div', 'block-add-note')

    let addNoteIcon = createElem('i', 'plus-circle', cardInnerElement)
    let addNoteTitle = createElem('span', 'add-note-title', cardInnerElement)

    containerAddNoteCard.appendChild(cardInnerElement)
    mainContainer.prepend(containerAddNoteCard)
}



firstRender()