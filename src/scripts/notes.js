import { constants } from './constants'

const notesController = {
    getNotes: () => {
        let storedNotes = localStorage.getItem(constants.LOCAL_STORAGE_KEY)
        if (storedNotes) {
            return storedNotes
        }

        return []
    },

    onClickAddNote: () => {
        let myModal = new bootstrap.Modal(document.getElementById('myModal'))
        myModal.show()
    }
}

export { notesController }