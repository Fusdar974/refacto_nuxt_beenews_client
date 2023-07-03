import ProfilInterface from "@/interfaces/ProfilInterface";
import GenericInterface from "./GenericInterface";

interface UserInterface extends GenericInterface {
    compte?: number
    isDesactive: boolean
    mail: string
    nom: string
    password: string
    prenom: string
    profils?: Array<ProfilInterface>
    supprimable: boolean
    surnom?: string
}

export default UserInterface