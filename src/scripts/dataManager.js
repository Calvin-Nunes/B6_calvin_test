export function loadData(key) {
    let jsonData = localStorage.getItem(key)

    let data = jsonData ? JSON.parse(jsonData) : null

    return data
}

export function saveData(key, data) {
    let jsonData = ''
    if (data) {
        jsonData = JSON.stringify(data)
    }

    localStorage.setItem(key, jsonData)
}