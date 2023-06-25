import GenericInterface from "./GenericInterface";

interface ConnectedUserInterface extends GenericInterface {
    nom: string
    prenom: string
    initiales: string
}

export default ConnectedUserInterface