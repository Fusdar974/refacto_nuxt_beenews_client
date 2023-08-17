import GenericInterface from "~/interfaces/GenericInterface";
import ItemTypeInterface from "~/interfaces/produitInterfaces/ItemTypeInterface";

interface ItemInterface extends GenericInterface {
    name: string
    price: number
    stock: number
    dispo: number
    image: string
    imageBnr?: string | ArrayBuffer
    isArchived: boolean
    type: ItemTypeInterface | string
}
export default  ItemInterface