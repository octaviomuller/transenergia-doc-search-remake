import path from 'path'
import fs from 'fs'
import puppeteer from 'puppeteer-extra'
import { Browser, Page } from 'puppeteer'
import { executablePath } from 'puppeteer'
import parseOnsF from './parseOnsF'
import clearAssetsFolder from './clearAssetsFolder'

const userPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences')

interface Row {
    content: { [key: string]: string }
    buttons: (string | null)[]
}

type Table = Row[]

let browser: Browser
let page: Page
let downloadPath: string

export default async function downloadFiles(onsC: string, onsF: string[], dueDate: string, id: string) {
    setupFolder(onsC)
    await setupBrowser()
    await onsCSelection(onsC)

    const table = await getTable()
    const downloads = await downloadTableContent(table, onsC, onsF, dueDate, id)

    browser.close()

    return downloads
}

function setupFolder(onsC: string) {
    downloadPath = path.resolve(`./assets/${onsC}/files`)

    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true })
    }
}

async function setupBrowser() {
    puppeteer.use(
        userPreferencesPlugin({
            userPrefs: {
                download: {
                    prompt_for_download: false,
                    open_pdf_in_system_reader: false,
                    default_directory: downloadPath,
                },
                profile: {
                    default_content_setting_values: {
                        automatic_downloads: 1,
                    },
                },
            },
        })
    )

    browser = await puppeteer.launch({
        headless: false,
        executablePath: executablePath(),
    })
    page = await browser.newPage()

    page.setDefaultNavigationTimeout(50000)
    await page.setViewport({ width: 1400, height: 750 })
    await page.goto('https://ssl5501.websiteseguro.com/transenergia/fatura/', { waitUntil: "domcontentloaded" })
}

async function onsCSelection(onsC: string) {
    await page.waitForSelector('#codigoONS')
    await page.type("#codigoONS", onsC)
    await page.click("#btnAcessar")

    await page.waitForNavigation()
}

async function getTable(): Promise<Table> {
    const tableHeads = await page.$$eval('thead th', elements => elements.map(el => el.innerText).filter(el => el.trim().length))
    const tableRows = await page.$$eval('tbody tr', elements => {
        return elements.map(row => {
            const content = Array.from(row.querySelectorAll('td')).map(column => {
                return column.innerText
            })

            const buttons = Array.from(row.querySelectorAll('td a')).map(anchor => anchor.getAttribute('href'))

            return {
                content,
                buttons
            }
        })
    })

    const tableMap = tableRows.reduce<object[]>((tableRowsPrevious, tableRowsCurrent) => {
        const contentResult = tableHeads.reduce((tableHeadsPrevious, tableHeadsCurrent, tableHeadsIndex) => {
            return {
                ...tableHeadsPrevious,
                [tableHeadsCurrent]: tableRowsCurrent.content[tableHeadsIndex]
            }
        }, {})

        return [...tableRowsPrevious, { content: contentResult, buttons: tableRowsCurrent.buttons }]
    }, []) as Table

    return tableMap
}

function getFileTypeAndExtension(href: string) {
    if (href.includes('xml')) return ['XML', 'xml']
    else if (href.includes('danfe')) return ['DAN', 'pdf']
    else return ['BOL', 'pdf']
}

function getFilesOnDir() {
    const dirents = fs.readdirSync(downloadPath, { withFileTypes: true })
    const files = dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name)

    return files
}

function setFileName(onsC: string, billOnsF: string, dueDate: string, billCode: string, id: string, href: string) {
    const uniqueOnsF: string = parseOnsF.companiesToCode[billOnsF]
    const [day, month, year] = dueDate.split("/")
    const [fileType, fileExtension] = getFileTypeAndExtension(href)

    return `${onsC}_${uniqueOnsF}_${year + month + day}_${fileType}_${id}_${billCode}.${fileExtension}`
}

async function downloadTableContent(table: Table, onsC: string, onsF: string[], dueDate: string, id: string) {
    const downloads: Map<string, string> = new Map()

    let found = false

    for (let row of table) {
        if (onsF.includes(parseOnsF.companiesToCode[row.content['Estabelecimento']]) && row.content['Vencimento'] === dueDate) {
            if (!found) {
                clearAssetsFolder(onsC)

                found = true
            }

            for (let button of row.buttons) {
                await page.click(`[href="${button}"]`)

                let file

                do {
                    file = getFilesOnDir().find(file => {
                        const [fileType, _] = getFileTypeAndExtension(button!)

                        return file.includes(row.content['Nº da Nota']) && file.includes(fileType)
                    })

                    await new Promise(resolve => setTimeout(resolve, 500))
                } while (!file)

                const newFileName = setFileName(onsC, row.content['Estabelecimento'], dueDate, row.content['Nº da Nota'], id, button!)

                downloads.set(file, newFileName)
                console.log(`download: ${file} -> ${newFileName}`)
            }
        }
    }

    return downloads
}