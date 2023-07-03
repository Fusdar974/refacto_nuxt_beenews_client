import {JwtPayload} from "jwt-decode";
import MenuInterface from "~/interfaces/MenuInterface";

interface JwtPayloadInterface extends JwtPayload {
    compte: number,
    droits: Array<MenuInterface>,
    nom: string,
    prenom: string,
    userId:string,
}

export default JwtPayloadInterface