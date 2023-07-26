import {JwtPayload} from "jwt-decode";

interface JwtPayloadInterface extends JwtPayload {
    wallet: number,
    name: string,
    firstname: string,
    userId:string,
}

export default JwtPayloadInterface