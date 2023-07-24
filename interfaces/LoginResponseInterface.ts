import menuInterface from "~/interfaces/MenuInterface";

interface LoginResponseInterface {
    bearer:string,
    rights: Array<menuInterface>
}

export default LoginResponseInterface
