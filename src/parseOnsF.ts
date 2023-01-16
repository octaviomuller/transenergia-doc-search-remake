interface OnsF {
    companies: string[]
    codes: string[]
    companiesToCode: {[key: string]: string}
    codesToCompanies: {[key: string]: string}
}

export default {
    companies: [
        "MGE TRANSMISSAO SA",
        "TRANSENERGIA SÃO PAULO S.A.",
        "GOIAS TRANSMISSAO SA",
        "TRANSENERGIA RENOVÁVEL S.A.",
    ],
    codes: [
        "1145",
        "1104",
        "1130",
        "1085"
    ],
    codesToCompanies: {
        "1145": "MGE TRANSMISSAO SA",
        "1104": "TRANSENERGIA SÃO PAULO S.A.",
        "1130": "GOIAS TRANSMISSAO SA",
        "1085": "TRANSENERGIA RENOVÁVEL S.A."
    },
    companiesToCode: {
        "MGE TRANSMISSAO SA": "1145",
        "TRANSENERGIA SÃO PAULO S.A.": "1104",
        "GOIAS TRANSMISSAO SA": "1130",
        "TRANSENERGIA RENOVÁVEL S.A.": "1085"
    }
} as OnsF