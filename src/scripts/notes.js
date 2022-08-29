import tingle from 'tingle.js'
import tinymce from '/src/plugins/tinymce/tinymce.min.js'

import { createElem, createInput, createMarkdownEditor } from './uiUtils'
import { constants } from './constants'
import * as dataManager from './dataManager'
import * as appShell from './shell'

let storedNotes = []
let noteModal = null
let selectedNote = null

export function getNotes() {
    storedNotes = dataManager.loadData(constants.LOCAL_STORAGE_KEY) || []
    return storedNotes
}

export function getNote(id) {
    let storedNotes = loadNotes()
    if (storedNotes && storedNotes.length > 0) {
        return storedNotes.find((n) => n.id === id)
    }
    return null
}

export function buildNotesList() {
    getNotes()

    let mainContainer = document.querySelector('#content')

    for (let note of storedNotes) {
        note.date = new Date(note.date)
        createNoteTicket(note, mainContainer)
    }
}

function createNoteTicket(note, parentElem) {
    const elemId = `note-${note.id}`

    const noteCard = createElem('div', 'note-card card col-3 col-md-4 col-sm-12 ', parentElem)
    noteCard.id = elemId

    let noteTitle = createElem('h3', 'note-title', noteCard)
    noteTitle.innerText = note.title

    let noteSubtitle = createElem('h6', 'note-subtitle', noteCard)
    noteSubtitle.innerText = note.subtitle

    const cardBottom = createElem('div', 'note-footer', noteCard)

    let noteDate = createElem('span', 'note-date', cardBottom)
    noteDate.innerText = `${note.date.getDate()} ${note.date.getMonth() + 1} ${note.date.getFullYear()}`

    //note options button
    let dropdownBox = createElem('div', 'dropdown', cardBottom)

    let optionsButton = createElem('button', 'btn dropdown-toggle', dropdownBox)
    optionsButton.setAttribute('data-bs-toggle', 'dropdown')
    optionsButton.onclick = openNoteOptions.bind(this, note)
    createElem('i', 'bi-three-dots', optionsButton)

    let optionsMenu = createElem('ul', 'dropdown-menu', dropdownBox)
    optionsMenu.id = `options-${elemId}`

    let editOption = createElem('li', 'note-option', optionsMenu)
    editOption.innerText = 'Edit'
    editOption.onclick = onClickEditNote.bind(this, note.id)

    let deleteOption = createElem('li', 'note-option', optionsMenu)
    deleteOption.innerText = 'Delete'
    editOption.onclick = onClickDeleteNote.bind(this, note.id)
}

export function renderSingleAddNote() {
    let mainContainer = document.querySelector('#content')

    let containerAddNoteCard = createElem('div', `card ${storedNotes.length === 0 ?
        'no-notes-card' :
        'col-3 col-md-4 col-sm-12'
        }`)
    containerAddNoteCard.onclick = onClickAddNote

    let cardInnerElement = createElem('div', 'block-add-note', containerAddNoteCard)

    createElem('i', 'bi-plus-circle', cardInnerElement)
    let addNoteTitle = createElem('span', 'add-note-title', cardInnerElement)
    addNoteTitle.innerText = 'Add new note'

    mainContainer.prepend(containerAddNoteCard)
}

function openNoteOptions(note) {
    selectedNote = note
}

function onClickAddNote() {
    selectedNote = null
    openAddNodeModal()
}

function onClickEditNote(noteId) {
    selectedNote = storedNotes.find((n) => n.id === noteId)

    if (selectedNote) {
        openAddNodeModal()
    }
}

function onClickDeleteNote(noteId) {
    if (storedNotes) {
        const deletionIndex = storedNotes.findIndex((n) => n.id === noteId)

        if (deletionIndex > -1) {
            storedNotes.splice(deletionIndex, 1)
            saveNotes()
        }
    }
}

function openAddNodeModal() {
    if (selectedNote == null) {
        selectedNote = {
            id: null,
            title: '',
            subtitle: '',
            content: ''
        }
    }

    const dialogBox = createElem('div', 'dialog-content-box')

    //create the form
    const noteForm = createElem('form', 'note-form', dialogBox)

    const titleInput = createInput('Note Title', 'note-form-title', selectedNote.title)
    noteForm.appendChild(titleInput.holder)

    const subtitleInput = createInput('Subtitle', 'note-form-subtitle', selectedNote.subtitle)
    noteForm.appendChild(subtitleInput.holder)

    createElem('textarea', 'note-form-editor', noteForm)

    //create the dialog footer
    const dialogFooter = createElem('div', 'modal-footer', dialogBox)

    let cancelButton = createElem('button', 'btn btn-light', dialogFooter)
    cancelButton.innerText = 'Cancel'

    let confirmButton = createElem('button', 'btn btn-danger', dialogFooter)
    createElem('i', 'bi-plus-circle', confirmButton)
    confirmButton.innerHTML += 'Add task'

    //generate the modal
    noteModal = new tingle.modal({
        title: 'Add/Edit Note',
        footer: false,
        closeMethods: ['overlay', 'escape'],
    })

    noteModal.setContent(dialogBox)

    //create markdown editor
    const markdownEditor = tinymce.init({
        selector: '.note-form-editor',
        menubar: false,
        toolbar: 'undo redo | bold italic | foreColor backColor | alignleft aligncenter alignright alignjustify | outdent indent'
    });


    noteModal.open()

    //add listener to footer buttons
    cancelButton.onclick = () => noteModal.close()

    confirmButton.onclick = processNoteData.bind(this, {
        title: titleInput.input,
        subtitle: subtitleInput.input
    })
}

function processNoteData(controls) {
    if (noteModal) {
        noteModal.close()
    }

    selectedNote.title = controls.title.value || ''
    selectedNote.subtitle = controls.subtitle.value || ''
    selectedNote.content = tinymce.activeEditor.getContent()
    selectedNote.date = new Date()

    if (selectedNote.id) {
        confirmNoteEdit()
    } else {
        addNewNote()
    }

    selectedNote = null
}

function addNewNote() {
    selectedNote.id = getNewId()

    storedNotes.push(selectedNote)

    saveNotes()
}

function confirmNoteEdit() {
    let updateNoteIndex = storedNotes.findIndex((n) => n.id === selectedNote.id)

    if (updateNoteIndex > -1) {
        storedNotes[updateNoteIndex] = selectedNote
        saveNotes()
    }
    else {
        addNewNote()
    }
}

function saveNotes() {
    storedNotes.sort((a, b) => Number(a.id) - Number(b.id))

    dataManager.saveData(constants.LOCAL_STORAGE_KEY, storedNotes)
    appShell.refresh()
}

function getNewId() {
    if (storedNotes && storedNotes.length > 0) {
        const lastNote = storedNotes[storedNotes.length - 1]
        if (lastNote) {
            return Number(lastNote.id) + 1
        }
        return storedNotes.length + 1
    }

    return 1
}