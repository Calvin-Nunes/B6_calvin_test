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
        createNoteTicket(note, mainContainer)
    }
}

function createNoteTicket(note, parentElem) {
    const elemId = `note-${note.id}`

    const columnElem = createElem('div', 'col-12 col-md-4 col-lg-3', parentElem)

    const noteCard = createElem('div', 'note-card card', columnElem)
    noteCard.id = elemId
    noteCard.onclick = onClickNote.bind(this, note)

    createElem('h3', 'note-title', noteCard, note.title)
    createElem('h6', 'note-subtitle', noteCard, note.subtitle)

    const cardBottom = createElem('div', 'note-footer', noteCard)

    createElem('span', 'note-date', cardBottom, dateToDisplay(note.date))

    //note options button
    let dropdownBox = createElem('div', 'dropdown', cardBottom)

    let optionsButton = createElem('button', 'btn dropdown-toggle', dropdownBox)
    optionsButton.setAttribute('data-bs-toggle', 'dropdown')
    optionsButton.onclick = openNoteOptions.bind(this, note)
    createElem('i', 'bi-three-dots', optionsButton)

    let optionsMenu = createElem('ul', 'dropdown-menu', dropdownBox)
    optionsMenu.id = `options-${elemId}`

    let editOption = createElem('li', 'note-option', optionsMenu, 'Edit')
    editOption.onclick = onClickEditNote.bind(this, note.id)

    let deleteOption = createElem('li', 'note-option', optionsMenu, 'Delete')
    deleteOption.onclick = onClickDeleteNote.bind(this, note.id)
}

export function renderAddNoteButtonCard() {
    let mainContainer = document.querySelector('#content')

    let columnElem = createElem('div', `${storedNotes.length === 0 ?
        'no-notes-card' :
        'col-12 col-md-4 col-lg-3'
        }`
    )

    let containerAddNoteCard = createElem('div', 'card note-card', columnElem)
    containerAddNoteCard.onclick = onClickAddNote

    let cardInnerElement = createElem('div', 'block-add-note', containerAddNoteCard)

    createElem('i', 'bi-plus-circle', cardInnerElement)
    let addNoteTitle = createElem('span', 'add-note-title', cardInnerElement)
    addNoteTitle.innerText = 'Add new note'

    mainContainer.prepend(columnElem)
}

function openNoteOptions(note, ev) {
    ev.stopPropagation()
    selectedNote = note
}

function onClickAddNote() {
    selectedNote = null
    openAddNodeModal()
}

function onClickEditNote(noteId, ev) {
    ev.stopPropagation()
    selectedNote = storedNotes.find((n) => n.id === noteId)

    if (selectedNote) {
        openAddNodeModal()
    }
}

function onClickDeleteNote(noteId, ev) {
    ev.stopPropagation()
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

    let dialogTitle = createElem('h2', '', dialogBox)
    dialogTitle.innerText = "Add/Edit Note"

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
    confirmButton.innerHTML += 'Confirm'

    //add listener to footer buttons
    cancelButton.onclick = () => noteModal.close()

    confirmButton.onclick = processNoteData.bind(this, {
        title: titleInput.input,
        subtitle: subtitleInput.input
    })

    //generate the modal
    noteModal = new tingle.modal({
        footer: false,
        closeMethods: ['overlay', 'escape'],
    })

    noteModal.setContent(dialogBox)
    noteModal.open()

    //create markdown editor after dialog is on DOM
    tinymce.init({
        selector: '.note-form-editor',
        menubar: false,
        setup: function (editor) {
            editor.on('init', (e) => {
                editor.setContent(selectedNote.content);
            });
        },
        toolbar: 'undo redo | bold italic | foreColor backColor | alignleft aligncenter alignright alignjustify | outdent indent'
    });
}

function processNoteData(controls) {
    if (noteModal) {
        noteModal.close()
    }

    selectedNote.title = controls.title.value || ''
    selectedNote.subtitle = controls.subtitle.value || ''
    selectedNote.content = tinymce.activeEditor.getContent()
    selectedNote.date = new Date()

    if (validateData(selectedNote)) {

        if (selectedNote.id) {
            confirmNoteEdit()
        } else {
            addNewNote()
        }

        selectedNote = null
    }
}

function validateData(noteData) {
    //TODO - validate if fields (title and content are filled)
    return true
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

function onClickNote(note, ev) {
    ev.stopPropagation()
    selectedNote = note
    showNoteDialog()
}

function showNoteDialog() {
    if (selectedNote) {
        noteModal = new tingle.modal({
            footer: false,
            onClose: () => noteModal = null
        })

        let noteDisplayer = createElem('div', 'note-displayer')

        createElem('h1', 'note-title', noteDisplayer, selectedNote.title)
        createElem('h3', 'note-subtitle', noteDisplayer, selectedNote.subtitle)
        createElem('div', 'note-content', noteDisplayer, selectedNote.content)
        createElem('div', 'note-date', noteDisplayer, dateToDisplay(selectedNote.date, true))

        noteModal.setContent(noteDisplayer)
        noteModal.open()
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

function dateToDisplay(date, showHours) {
    if (!(date instanceof Date)) {
        date = new Date(date)
    }

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    if (day < 10) {
        day = '0' + day
    }

    if (month < 10) {
        month = '0' + month
    }

    let display = `${day} ${month} ${year}`

    if (showHours) {
        display += ' ' + date.toLocaleTimeString()
    }

    return display
}