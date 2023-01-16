import fs from 'fs'
import path from 'path'

export default function clearAssetsFolder(onsC: string) {
    const assetsPath = path.resolve(`./assets/${onsC}/files`)

    if (fs.existsSync(assetsPath)) {
        fs.readdirSync(assetsPath).forEach(file => {
            fs.rmSync(`${assetsPath}/${file}`, { recursive: true, force: true });
        });
    }
}