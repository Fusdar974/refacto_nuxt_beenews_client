import CalendrierJourInterface from "~/interfaces/calendrierInterfaces/CalendrierJourInterface";

interface CalendrierResponseInterface{
    calendrier: Array<CalendrierJourInterface>
    libelleMois: string
}
export default CalendrierResponseInterface