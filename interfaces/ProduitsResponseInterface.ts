import ProduitInterface from "~/interfaces/ProduitInterface";

interface ProduitsResponseInterface {
    documents: ProduitInterface[],
    nombre: number,
    page: number,
    total: number,
}

export default ProduitsResponseInterface