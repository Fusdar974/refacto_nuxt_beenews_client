import UserInterface from "@/interfaces/UserInterface";

interface CalendrierJourInterface{
    annee:string
    auj:boolean
    barman?:UserInterface
    barmanRecompense?:UserInterface
    jour:string
    libelleJour:string
    mois:string
    moisEnCours:boolean
    weekEnd:boolean
}
export default CalendrierJourInterface