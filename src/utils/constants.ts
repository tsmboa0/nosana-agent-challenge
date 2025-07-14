



export const getCAfromTicker = (ticker: string) => {
    const CA : Record<string, string> = {
        "TSLAX": "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
        "NFLX": "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL",
        "PLTRX":"XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4",
        "ORCLX":"XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL",
        "IBMX": "XspwhyYPdWVM8XBHZnpS9hgyag9MKjLRyE3tVfmCbSr",
        "AAPLX":"XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
        "MSFTX":"XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
        "NVDAX":"Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
        "AMZNX":"Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
        "GOOGLX":"XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
        "METAX":"Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
        "QQQX":"Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
        "SPYX":"XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
        "JPMX":"XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C",
        "VX":"XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p"
    }
    return CA[ticker] || undefined;
}