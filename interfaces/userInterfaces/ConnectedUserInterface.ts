import GenericInterface from "../GenericInterface";

interface ConnectedUserInterface extends GenericInterface {
    name: string
    firstname: string
    initials: string
}

export default ConnectedUserInterface