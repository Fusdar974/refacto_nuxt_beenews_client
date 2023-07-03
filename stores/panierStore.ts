import {defineStore} from 'pinia'
import ArticlePotInterface from "@/interfaces/potsInterfaces/ArticlePotInterface";
import UserInterface from "@/interfaces/UserInterface";

export const usePanierStore = defineStore('panier', () => {

    /** DATAS */
    const articles = ref<Array<ArticlePotInterface>>([])
    const utilisateur = ref<UserInterface>()
    const paiementCompte = ref<number | '' | undefined>()
    const paiementCheque = ref<number | '' | undefined>()
    const paiementEspece = ref<number | '' | undefined>()
    const paiementVirement = ref<number | '' | undefined>()
    const rendreMonnaie = ref<string>()

    /** COMPUTED */

    /**
     * Vérifie si le panier est vide
     */
    const panierVide = computed(() =>
        articles.value.length === 0)

    /**
     * Retourne le nombre d'articles dans le panier
     */
    const nombreTotalArticles = computed(() => {
        if (!panierVide.value) {
            let total = 0
            articles.value.forEach(article => total += article.quantite)
            return total
        } else return 0
    })

    /**
     * Calcule le total de BN dus
     */
    const totalPanierBeeNews = computed(() => articles.value
        .map(article => article.prix * article.quantite)
        .reduce((a, b) => a + b, 0))

    /**
     * Calcule le total dus en euros
     */
    const totalPanierEuros = computed(() => articles.value
        .map(article => article.prixEuros * article.quantite)
        .reduce((a, b) => a + b, 0))

    /** METHODS */

    /**
     * Formate un type <number | '' | undefined> en number
     * @param value
     */
    const formatToNumber = (value: number | '' | undefined) =>
        Number((value !== '' && value) ?? 0)

    /**
     * Reset les datas du store
     */
    const $reset = () => {
        articles.value = []
        utilisateur.value = undefined
        paiementCompte.value = undefined
        paiementCheque.value = undefined
        paiementEspece.value = undefined
        paiementVirement.value = undefined
        rendreMonnaie.value = undefined
    }

    return {
        utilisateur,
        articles,
        nombreTotalArticles,
        paiementCompte,
        paiementCheque,
        paiementEspece,
        paiementVirement,
        rendreMonnaie,
        panierVide,
        totalPanierBeeNews,
        totalPanierEuros,
        $reset,
        formatToNumber,
    }
})