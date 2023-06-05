import ProduitInterface from "~/interfaces/produitInterfaces/ProduitInterface";

interface ProduitsResponseInterface {
    documents: ProduitInterface[],
    nombre: number,
    page: number,
    total: number,
}

export default ProduitsResponseInterface