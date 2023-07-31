import HistoriqueLigneInterface from "~/interfaces/historiqueInterfaces/HistoriqueLigneInterface";

interface HistoriqueInterface {
    page: number,
    nombre: number,
    count: number,
    histo: Array<HistoriqueLigneInterface>,
}

export default HistoriqueInterface