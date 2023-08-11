interface MenuInterface {
    _id?: number,
    name: string,
    libelle: string,
    icone?: string,
    to: string,
    auth: boolean,
    roles: Array<string>
}
export default MenuInterface

