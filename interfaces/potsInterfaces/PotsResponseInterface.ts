import PotInterface from "~/interfaces/potsInterfaces/PotInterface";

interface PotsResponseInterface{
    documents: Array<PotInterface>
    nombre: number
    page: number
    total: number
}
export default PotsResponseInterface