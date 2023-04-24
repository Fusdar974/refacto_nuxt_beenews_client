import ParticipantPotInterface from "~/interfaces/ParticipantPotInterface";
import ArticlePotInterface from "~/interfaces/ArticlePotInterface";
interface PotInterface{
    titre: string,
    participants: Array<ParticipantPotInterface>,
    date: string,
    articles: Array<ArticlePotInterface>,
    etat:string,
    _id: string,
}
export default PotInterface