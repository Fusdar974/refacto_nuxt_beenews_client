import ParticipantPotInterface from "@/interfaces/potsInterfaces/ParticipantPotInterface";
import ArticlePotInterface from "@/interfaces/potsInterfaces/ArticlePotInterface";
interface PotInterface {
    titre: string
    participants: Array<ParticipantPotInterface>
    date: string
    dateEncaissement?:Date
    articles: Array<ArticlePotInterface>
    etat:string
    _id?: string
}
export default PotInterface