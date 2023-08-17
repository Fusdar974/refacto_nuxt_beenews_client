interface PaginateResultInterface<T> {
    data: Array<T>
    links: {
        current: string
        last: string
        next: string
    }
    meta: {
        itemsPerPage: number
        totalItems: number
        currentPage: number
        totalPages: number
        sortBy: Array<[string, 'ASC' | 'DESC']>
    }
}