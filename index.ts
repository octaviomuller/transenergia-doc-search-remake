import downloadFiles from "./src/downloadFiles"
import handleFiles from "./src/handleFile"

async function searchDocs(onsC: string, onsF: string[], dueDate: string, id: string) {
    try {
        const downloads = await downloadFiles(onsC, onsF, dueDate, id)
        handleFiles(downloads, onsC, dueDate)
    } catch (error) {
        console.log(`Erro ao fazer download => onsC: ${onsC}, onsF: ${onsF} \n ${error}`)
        return
    }
}

function main() {
    (async () => {
        await searchDocs('3001', ['1145', '1104', '1130', '1085'], '25/01/2023', '1259974')
    })()
}

main()