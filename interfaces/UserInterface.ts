import GenericInterface from "./GenericInterface";

interface UserInterface extends GenericInterface {
    wallet: number
    isArchived: boolean
    email: string
    name: string
    password: string
    role?: string
    firstname: string
}

export default UserInterface