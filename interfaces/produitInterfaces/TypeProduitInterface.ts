import ProduitInterface from "~/interfaces/produitInterfaces/ProduitInterface";

interface TypeProduitInterface{
    _id?: string
    name: string
    isSuggestablePot: boolean
    isSuggestableSoum: boolean
    items: ProduitInterface
}
export default TypeProduitInterface
