import GenericInterface from "~/interfaces/GenericInterface";
import TypeProduitInterface from "~/interfaces/produitInterfaces/TypeProduitInterface";

interface ProduitInterface extends GenericInterface {
    nom: string
    image: string
    imageBnr?: string | ArrayBuffer
    type: TypeProduitInterface | string
    prix: number
    prixEuros: number
    nombre: number
    credit: number
    effacable: boolean
    archive: boolean
}
export default  ProduitInterface