<template>
    <v-menu v-model="menu"
            :close-on-content-click="false"
            location="end">
        <template v-slot:activator="{ props }">
            <v-btn class="text-none"
                   :disabled="isLoading"
                   stacked
                   v-bind="props">
                <v-badge color="secondary"
                         inline
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
                        <template v-slot:append>
                            <v-btn-group density="compact">
                                <v-btn v-if="utilisateur" class="font-weight-bold"
                                       prepend-icon="mdi:mdi-cash-multiple">
                                    {{ clientBNComputed }} BN
                                </v-btn>
                            </v-btn-group>
                        </template>
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
                <v-select v-model="utilisateur"
                          :items="utilisateurs"
                          :item-title="(user) => `${user.nom}  ${user.prenom}`"
                          return-object
                          label="Client"/>
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
                    :disabled="!panierPayable&&stepPaiement"
                    @click="()=> stepPaiement?validationPaiementPanier():stepPaiement=true">
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
import UsersResponseInterface from "~/interfaces/userInterfaces/UsersResponseInterface";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import PanierSoumPaimentStep from "~/components/panierSoum/PanierSoumPaimentStep.vue";

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

const {formatToNumber, $reset} = usePanierStore()

const {putSnackBarMessage} = useSnackbarStore()

/** COMPUTED */
const clientBNComputed = computed(() => {
    const clientBN = (utilisateur.value?.compte ?? 0) + (totalPanierEuros.value / valeurPoint.value)
    if (clientBN < formatToNumber(paiementCompte.value)) {
        paiementCompte.value = clientBN
    }
    return clientBN
})

/** LIFECYCLE */
onBeforeMount(() => {
    isLoading.value = true
    Fetch.requete({url: '/parametre/valeurBN', method: 'GET'}, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = Number(resultBN.valeur)
        Fetch.requete({
            url: '/users',
            data: {page: 1, nombre: 1000, isDesactive: false}
        }, (resultUtil: UsersResponseInterface) => {
            utilisateurs.value = resultUtil.documents
            isLoading.value = false
        }, () => isLoading.value = false)
    }, () => isLoading.value = false)
})

/** METHODS */

/**
 * Ouvre la modale de validation si le panier est payable
 */
const validationPaiementPanier = () => openConfirmationPaiement.value = panierPayable.value

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
            $reset()
            openConfirmationPaiement.value = false
            putSnackBarMessage('Paiement effectué.')
        }, () => {
            putSnackBarMessage('Erreur dans le paiement.', 'error')
        });
    }
}



</script>

<style scoped>
</style>