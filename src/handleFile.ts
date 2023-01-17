import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export default async function handleFiles(files: Map<string, string>, onsC: string, dueDate: string) {
    const basePath = path.resolve(`./assets/${onsC}`)
    const downloadPath = path.resolve(`./assets/${onsC}/files`)

    for (let fileMap of files.entries()) {
        const fileOnsF = fileMap[1].split('_')[1]

        if (!fs.existsSync(`${downloadPath}/${fileOnsF}`)) fs.mkdirSync(`${downloadPath}/${fileOnsF}`)

        const rename = `${downloadPath}/${fileOnsF}/${fileMap[1]}`

        fs.rename(`${downloadPath}/${fileMap[0]}`, rename, err => { 
            if (err) throw err 
        })
    }

    const [day, month, year] = dueDate.split("/")

    const directories = fs.readdirSync(downloadPath).filter(file => {
        if (fs.existsSync(`${downloadPath}/${file}`)) 
            return fs.statSync(`${downloadPath}/${file}`).isDirectory();
    })

    await Promise.all(
        directories.map(dir => {
            return new Promise<void>((resolve, reject) => {
                const output = fs.createWriteStream(`${basePath}/${onsC}_${dir}_${year + month + day}.zip`)
                const archive = archiver('zip')

                output.on('close', () => { resolve() })

                archive.on('error', (err: any) => { throw err })
                archive.pipe(output)
                archive.directory(`${downloadPath}/${dir}`, false)

                archive.finalize()
            })
        })
    )

    return
}