interface ParticipantPotInterface{
    _id: string
    nom: string
    prenom: string
    paiementVirement: number
    paiementCheque: number
    paiementEspece: number
    renduMonnaie: number
    peutEtrePaye?:boolean
    paye: boolean
}
export default ParticipantPotInterface