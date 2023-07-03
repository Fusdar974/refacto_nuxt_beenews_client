interface ProduitsListFilterInterface {
    by: string
    value: string | number | boolean
    type?: 'isEqual' | 'isGreater' | 'isLower' | 'contain'
}

export default ProduitsListFilterInterface