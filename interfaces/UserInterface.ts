import ProfilInterface from "~/interfaces/ProfilInterface";
import exp from "constants";

interface UserInterface {
    compte: number
    isDesactive: boolean
    mail: string
    nom: string
    password: string
    prenom: string
    profils: Array<ProfilInterface>
    supprimable: boolean
    surnom: string
    _id: string
}

export default UserInterface