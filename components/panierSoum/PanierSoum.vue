<template>
    <v-menu v-model="menu"
            :close-on-content-click="false"
            location="end">
        <template v-slot:activator="{ props }">
            <v-btn class="text-none"
                   :disabled="isLoading"
                   :stacked="true"
                   v-bind="props">
                <v-badge color="secondary"
                         :inline="true"
                         :model-value="!!nombreTotalArticles"
                         max="99"
                         :content="nombreTotalArticles">
                    <v-icon icon="mdi:mdi-cart"/>
                </v-badge>
            </v-btn>
        </template>
        <v-card min-width="400">
            <v-card-title>
                <v-list>
                    <v-list-item
                        prepend-avatar="/192.png"
                        :title="stepPaiement?'Paiement panier':'Détail panier'"
                        subtitle="Soum">
                    </v-list-item>
                </v-list>
            </v-card-title>
            <v-divider></v-divider>
            <v-list v-if="articles.length === 0">
                <v-list-item>Pas d'article dans le panier.</v-list-item>
            </v-list>
            <v-list v-else-if="!stepPaiement">
                <v-list-item v-for="(article, index) in <Array<ArticlePotInterface>>articles"
                             :key="index">
                    <panier-soum-article-row :article="article"
                                             @emptied="articles.splice(articles.indexOf(article), 1)"/>
                </v-list-item>
            </v-list>
            <panier-soum-paiment-step v-else
                                      :valeur-point="valeurPoint"
                                      :client-bn="clientBNComputed"
                                      @valide="(payable) => panierPayable = payable">
                <div v-if="isAdminComputed || isOpenSoumComputed">
                    <v-select v-model="utilisateur"
                              variant="outlined"
                              :items="utilisateurs"
                              :item-title="(user) => `${capitalize(user.nom)}  ${capitalize(user.prenom)}`"
                              :suffix="`${clientBNComputed} BN`"
                              class="mt-2"
                              return-object
                              label="Client"/>
                </div>
            </panier-soum-paiment-step>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
                <v-btn-group class="align-center">
                    <p style="font-size:0.95rem">Total Commande :</p>
                    <v-btn v-if="totalPanierBeeNews>0" class="pa-0 font-weight-bold">
                        {{ totalPanierBeeNews }} BN
                    </v-btn>
                    <v-btn v-if="totalPanierEuros>0" class="pa-0 ml-0 font-weight-bold">
                        {{ totalPanierEuros }} €
                    </v-btn>
                </v-btn-group>
                <v-spacer></v-spacer>

                <v-btn variant="text"
                       @click="stepPaiement?stepPaiement=false:menu = false"
                >
                    {{ stepPaiement ? 'Retour' : 'Annuler' }}
                </v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="(!panierPayable && (stepPaiement ||  !(isAdminComputed || isOpenSoumComputed)))"
                    @click="()=>
                    (stepPaiement || !(isOpenSoumComputed || isAdminComputed)) ? validationPaiementPanier() : stepPaiement = true">
                    {{ stepPaiement ? 'Valider' : 'Payer' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
    <modal-confirmation v-model="openConfirmationPaiement"
                        titre="Confirmation du paiement"
                        class-card="centerCard"
                        :question="rendreMonnaie>0?`Avez-vous rendu ${rendreMonnaie} € ?`:'Voulez-vous payer le panier ?'"
                        @confirmer="payerPanier"/>
</template>

<script setup lang="ts">
import {usePanierStore} from "~/stores/panierStore";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";
import Fetch from "~/services/FetchService";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import PanierSoumPaimentStep from "~/components/panierSoum/PanierSoumPaimentStep.vue";
import capitalize from "~/functions/capitalize";
import {useAuthenticateStore} from "~/stores/authenticateStore";
import ResponseListInterface from "~/interfaces/ResponseListInterface";

/** DATAS */
const menu = ref<boolean>(false)
const stepPaiement = ref<boolean>(false)
const panierPayable = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const openConfirmationPaiement = ref<boolean>(false)
const utilisateurs = ref<Array<UserInterface>>()
const valeurPoint = ref<number>(0.5)

/** STORES */

const {
    articles,
    utilisateur,
    paiementCompte,
    paiementCheque,
    paiementEspece,
    paiementVirement,
    rendreMonnaie,
    nombreTotalArticles,
    totalPanierEuros,
    totalPanierBeeNews
} = storeToRefs(usePanierStore())

const {
    userComputed,
    isOpenSoumComputed,
    isAdminComputed,
    userBn,
} = storeToRefs(useAuthenticateStore())

const {calculateUserBn} = useAuthenticateStore()

const {formatToNumber, $reset} = usePanierStore()

const {putSnackBarMessage} = useSnackbarStore()

/** COMPUTED */
const clientBNComputed = computed(() => {
    const clientBN = (utilisateur.value?.wallet ?? 0) + (totalPanierEuros.value / valeurPoint.value)
    if (clientBN < formatToNumber(paiementCompte.value)) {
        paiementCompte.value = clientBN
    }
    return clientBN
})

/** WATCHES */

/**
 * Modifie le step en cas de modification du panier
 * Modifie la valeur du champ compte en cas de modification du panier ou du client
 * Calcul panier payable si CLient connecté
 */
watch([utilisateur, totalPanierBeeNews, userBn], (newValue, oldValue) => {
    if (newValue[0] === oldValue[0]) {
        stepPaiement.value = false
    }
    paiementCompte.value = totalPanierBeeNews.value

    if (!stepPaiement.value && !(isAdminComputed.value || isOpenSoumComputed.value)) {
        panierPayable.value = (userBn.value ?? 0) >= newValue[1]
    }
})

/** LIFECYCLE */
onBeforeMount(() => {
    isLoading.value = true
    Fetch.requete({url: '/parametre/valeurBN', method: 'GET'}, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = Number(resultBN.valeur)
        Fetch.requete({
            url: '/users',
            data: {page: 1, limit: 1000, isArchived: false}, method: 'GET'
        }, (resultUtil: ResponseListInterface<UserInterface>) => {
            utilisateurs.value = resultUtil.documents
            if (!isOpenSoumComputed.value) {
                utilisateur.value = utilisateurs.value?.find(u =>
                    u._id === userComputed.value._id ?? false)
            }
            isLoading.value = false
        }, () => isLoading.value = false)
    }, () => isLoading.value = false)
    paiementCompte.value = totalPanierBeeNews.value
})

/** METHODS */

/**
 * Ouvre la modale de validation si le panier est payable
 */
const validationPaiementPanier = () => {
    if (!isOpenSoumComputed.value && (utilisateur.value?._id === userComputed.value._id)) {
        calculateUserBn()
    }
    openConfirmationPaiement.value = panierPayable.value
}

/**
 * Transmet le paiement au Back
 */
const payerPanier = () => {
    if (articles.value.length > 0 && panierPayable.value && (rendreMonnaie.value ?? 0) >= 0) {
        const panier = {
            articles: articles.value,
            utilisateur: utilisateur.value,
            paiementCompte: formatToNumber(paiementCompte.value),
            paiementCheque: formatToNumber(paiementCheque.value),
            paiementEspece: formatToNumber(paiementEspece.value),
            paiementVirement: formatToNumber(paiementVirement.value),
            rendreMonnaie: rendreMonnaie.value,
        }

        Fetch.requete({url: '/soum/panier', data: {panier}}, () => {
            putSnackBarMessage('Paiement effectué.')
            if (!isOpenSoumComputed.value && (utilisateur.value?._id === userComputed.value._id)) {
                calculateUserBn()
            }
            $reset()
            openConfirmationPaiement.value = false
        }, () => {
            putSnackBarMessage('Erreur dans le paiement.', 'error')
        });
    } else {
        putSnackBarMessage('Vous n\'avez plus assez de BN.', 'error')
    }
}



</script>

<style scoped>
</style>