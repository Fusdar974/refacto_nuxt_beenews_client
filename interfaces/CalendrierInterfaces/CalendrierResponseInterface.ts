import CalendrierJourInterface from "@/interfaces/CalendrierInterfaces/CalendrierJourInterface";

interface CalendrierResponseInterface{
    calendrier: Array<CalendrierJourInterface>
    libelleMois: string
}
export default CalendrierResponseInterface