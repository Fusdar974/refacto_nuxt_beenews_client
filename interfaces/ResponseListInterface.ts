interface ResponseListInterface<T> {
    documents: Array<T>
    nombre: number
    page: number
    total: number
}

export default ResponseListInterface