import GenericInterface from "~/interfaces/GenericInterface";

interface ProduitInterface extends GenericInterface {
    name: string
    image: string
    price: number
    stock: number
    dispo: number
    isArchived: boolean
}
export default  ProduitInterface