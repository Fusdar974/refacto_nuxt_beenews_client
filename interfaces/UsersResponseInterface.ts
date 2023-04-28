import UserInterface from "~/interfaces/UserInterface";

interface  UsersResponseInterface{
    documents:Array<UserInterface>
    nombre: Number
    page: Number
    total: Number
}
export default UsersResponseInterface