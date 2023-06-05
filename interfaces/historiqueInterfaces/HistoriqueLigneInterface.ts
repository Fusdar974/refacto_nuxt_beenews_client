import HistoriqueDetailInterface from "~/interfaces/historiqueInterfaces/HistoriqueDetailInterface";

interface HistoriqueLigneInterface{
    ancienSolde: number,
    barman: {
        userId: string,
        nom: string,
        prenom: string,
    },
    nom: string,
    prenom: string,
    userId: string,
    client: string,
    date: string,
    nouveauCredit: number,
    nouveauSolde: number,
    paiementCheque: number,
    paiementCompte: number,
    paiementEspece: number,
    paiementVirement: number,
    rendreMonnaie: string,
    type: string,
    historique?: Array<HistoriqueDetailInterface>,
    commentaires?: string,
    _id: string,
}

export default HistoriqueLigneInterface