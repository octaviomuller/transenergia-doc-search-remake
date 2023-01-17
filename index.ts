import downloadFiles from "./src/downloadFiles"
import handleFiles from "./src/handleFile"

async function searchDocs(onsC: string, onsF: string[], dueDate: string, id: string) {
    try {
        const downloads = await downloadFiles(onsC, onsF, dueDate, id)
        await handleFiles(downloads, onsC, dueDate)
    } catch (error) {
        console.log(`Error ao realizar download => onsC:${onsC} onsFs: ${onsF} \n ${error}`)
        return
    }
}

function main() {
    (async () => {
        await searchDocs('3033', ['1145', '1104', '1130', '1085'], '25/01/2023', '1284908')
        await searchDocs('3001', ['1145', '1104', '1130', '1085'], '25/01/2023', '1259974')
    })()
}

main()