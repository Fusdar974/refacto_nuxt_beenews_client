import UserInterface from "~/interfaces/UserInterface";

interface  UsersResponseInterface{
    documents:Array<UserInterface>
    nombre: number
    page: number
    total: number
}
export default UsersResponseInterface