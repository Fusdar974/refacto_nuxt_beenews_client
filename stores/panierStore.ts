import {defineStore} from 'pinia'
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";
import UserInterface from "~/interfaces/UserInterface";

export const usePanierStore = defineStore('panier', () => {

    const articles = ref<Array<ArticlePotInterface>>([])
    const utilisateur = ref<UserInterface>()
    const utilisateurs = ref<Array<UserInterface>>()
    const paiementCompte = ref<number | '' | undefined>()
    const paiementCheque = ref<number | '' | undefined>()
    const paiementEspece = ref<number | '' | undefined>()
    const paiementVirement = ref<number | '' | undefined>()
    const rendreMonnaie = ref<string>()

    const panierVide = computed(() => articles.value.length === 0)

    const nombreTotalArticles = computed(() => {
        if (!panierVide.value) {
            let total = 0
            articles.value.forEach(article => total += article.quantite)
            return total
        } else return 0
    })

    const formatToNumber = (value: number | '' | undefined) =>
        Number((value !== '' && value) ?? 0)

    const panier = computed(() => {
        return {
            articles: articles.value,
            utilisateur: utilisateur.value,
            paiementCompte: formatToNumber(paiementCompte.value),
            paiementCheque: formatToNumber(paiementCheque.value),
            paiementEspece: formatToNumber(paiementEspece.value),
            paiementVirement: formatToNumber(paiementVirement.value),
            rendreMonnaie: rendreMonnaie.value,
        }
    })

    return {
        utilisateur,
        utilisateurs,
        panier,
        articles,
        panierVide,
        nombreTotalArticles,
        paiementCompte,
        paiementCheque,
        paiementEspece,
        paiementVirement,
        rendreMonnaie,
        formatToNumber,
    }
})