import TypeProduitInterface from "~/interfaces/TypeProduitInterface";

interface ProduitInterface{
    _id?: string
    nom: string
    image: string
    imageBnr?: string | ArrayBuffer
    type: TypeProduitInterface|string
    prix: number
    prixEuros: number
    nombre: number
    credit: number
    effacable: boolean
    archive: boolean
}
export default  ProduitInterface