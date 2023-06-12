const capitalize = (wordToCapitalize: string) =>
    wordToCapitalize.slice(0, 1).toUpperCase().concat(wordToCapitalize.slice(1).toLowerCase())

export default capitalize