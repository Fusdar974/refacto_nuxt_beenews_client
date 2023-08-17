import GenericInterface from "~/interfaces/GenericInterface";

interface ItemTypeInterface extends GenericInterface {
    name: string
    isSuggestableSoum: boolean
    isSuggestablePot: boolean
}
export default ItemTypeInterface
