import ArticlePotInterface from "@/interfaces/potsInterfaces/ArticlePotInterface";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";

interface PanierSoumInterface {
    articles: Array<ArticlePotInterface>
    utilisateur?: UserInterface
    paiementCompte: number
    paiementCheque: number
    paiementEspece: number
    paiementVirement: number
    rendreMonnaie: number
}

export default PanierSoumInterface