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
            <v-list v-else>
                <v-list-item>
                    <v-select v-model="utilisateur"
                              :items="utilisateurs"
                              :item-title="(user) => `${user.nom}  ${user.prenom}`"
                              return-object
                              label="Client"/>
                </v-list-item>
                <v-list-item>
                    <v-text-field v-if="utilisateur && utilisateur.compte > 0"
                                  v-model.number="paiementCompte"
                                  label="Compte"
                                  class="mt-2"
                                  suffix="BN"
                                  density="compact"
                                  variant="outlined"
                                  min="0"
                                  @input="handleVerifierSolde"
                                  type="number"/>
                    <v-text-field label="Espèce"
                                  v-model.number="paiementEspece"
                                  :class="utilisateur && utilisateur.compte > 0?'':'mt-2'"
                                  suffix="€"
                                  density="compact"
                                  variant="outlined"
                                  type="number"
                                  @input="()=>paiementEspece=Math.max(formatToNumber(paiementEspece),0)"/>

                    <v-text-field label="Virement"
                                  v-model.number="paiementVirement"
                                  suffix="€"
                                  min="0"
                                  density="compact"
                                  variant="outlined"
                                  type="number"
                                  @input="()=>paiementVirement=Math.max(formatToNumber(paiementVirement),0)"/>

                    <v-text-field label="Chèque"
                                  v-model.number="paiementCheque"
                                  suffix="€"
                                  density="compact"
                                  variant="outlined"
                                  @input="()=>paiementCheque=Math.max(formatToNumber(paiementCheque),0)"
                                  type="number"/>
                </v-list-item>
                <v-list-item v-if="manqueEuro>0">
                    <v-alert color="warning">Manque euros : {{ manqueEuro }}</v-alert>
                </v-list-item>
                <v-list-item v-if="manqueBeeNews>0">
                    <v-alert color="warning">Manque bee news : {{ manqueBeeNews }}</v-alert>
                </v-list-item>
                <v-list-item v-if="rendreMonnaieComputed>0">
                    <v-alert color="error">Rendre monnaie : {{ rendreMonnaieComputed }} €</v-alert>
                </v-list-item>
            </v-list>
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
                    :disabled="!panierPayable"
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
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";
import Fetch from "~/services/FetchService";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import UserInterface from "~/interfaces/UserInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import {useSnackbarStore} from "~/stores/snackbarStore";

const menu = ref<boolean>(false)
const stepPaiement = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const openConfirmationPaiement = ref<boolean>(false)
const utilisateurs = ref<Array<UserInterface>>()
const valeurPoint = ref<number>()

const {
    articles,
    utilisateur,
    paiementCompte,
    paiementCheque,
    paiementEspece,
    paiementVirement,
    rendreMonnaie,
    nombreTotalArticles,
} = storeToRefs(usePanierStore())

const {formatToNumber, $reset} = usePanierStore()

const {putSnackBarMessage} = useSnackbarStore()

const handleVerifierSolde = () => {
    console.log('yoho')
    paiementCompte.value = Number(formatToNumber(paiementCompte.value).toFixed(0))
    if (utilisateur.value &&
        paiementCompte.value) {
        paiementCompte.value = Math.min(paiementCompte.value, clientBNComputed.value ?? 0, totalPanierBeeNews.value)
    }
}

const validationPaiementPanier = () => {
    if (panierPayable.value) {
        openConfirmationPaiement.value = true
    }
}

const payerPanier = () => {
    if (articles.value.length > 0 && utilisateur.value && rendreMonnaie.value >= 0) {
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

const panierPayable = computed(() => (!(stepPaiement.value && (manqueEuro.value > 0 || manqueBeeNews.value > 0))))

const totalPanierBeeNews = computed(() => articles.value
    .map(article => article.prix * article.quantite)
    .reduce((a, b) => a + b, 0))

const totalPanierEuros = computed(() => articles.value
    .map(article => article.prixEuros * article.quantite)
    .reduce((a, b) => a + b, 0))

const totalPaiementEuro = computed(() =>
    formatToNumber(paiementCheque.value) + formatToNumber(paiementEspece.value) + formatToNumber(paiementVirement.value))

const totalPaiementEuroWithBN = computed(() =>
    totalPaiementEuro.value + formatToNumber(paiementCompte.value) * (valeurPoint.value ?? 0.5))

const manqueEuro = computed(() => totalPanierEuros.value - totalPaiementEuro.value)

const totalEuroComputed = computed(() =>
    formatToNumber(totalPanierBeeNews.value) * (valeurPoint.value ?? 0.5) + totalPanierEuros.value)

const clientBNComputed = computed(() => {
    const clientBN = (utilisateur.value?.compte ?? 0) + (totalPanierEuros.value / (valeurPoint.value ?? 0.5))
    if (clientBN < formatToNumber(paiementCompte.value)) {
        paiementCompte.value = clientBN
    }
    return clientBN
})

const manqueBeeNews = computed(() =>
    Number(rendreMonnaieComputed.value) < 0 ? totalPanierBeeNews.value - formatToNumber(paiementCompte.value) : 0)

const rendreMonnaieComputed = computed(() => {
    rendreMonnaie.value = (totalPaiementEuroWithBN.value - totalEuroComputed.value).toFixed(2)
    return rendreMonnaie.value
})

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

</script>

<style scoped>
</style>