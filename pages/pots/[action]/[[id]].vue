<template>
    <v-container>
        <v-row class="mb-16">
            <v-col cols="12" :lg="pot?.articles?.length > 0 ? 9 : 12">
                <v-container>
                    <v-row>
                        <v-col cols="12" md="8">
                            <v-text-field label="Titre"
                                          name="titre"
                                          :error-messages="v$.titre.$errors.map(e => e.$message) as Array<string>"
                                          :disabled="action === SHOW"
                                          v-model="pot.titre"
                                          @blur="v$.titre.$touch"
                                          type="text"/>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="Jour événement"
                                          name="date"
                                          :disabled="action === SHOW"
                                          v-model="formatedDateComputed"
                                          type="date"/>
                        </v-col>
                    </v-row>
                    <v-row v-if="!paiementEnCoursComputed">
                        <v-select v-model="pot.participants"
                                  :items="users as UserInterface[]"
                                  :error-messages="v$.participants.$errors.map(e => e.$message) as Array<string>"
                                  :item-title="(user) => `${user.nom}  ${user.prenom}`"
                                  :disabled="action === SHOW"
                                  return-object
                                  multiple
                                  chips
                                  @blur="v$.participants.$touch"
                                  label="Clients"/>
                    </v-row>
                    <v-row v-if="action !== SHOW && pot.etat === 'Créé'">
                        <v-col>
                            <v-tabs v-model="filtre"
                                    center-active
                                    color="primary"
                                    slider-color="secondary"
                                    align-tabs="center">
                                <v-tab v-for="(typeproduit, index) in typeproduits as Array<TypeProduitInterface>"
                                       :key="index"
                                       :value="typeproduit._id">{{ typeproduit.nom }}</v-tab>
                            </v-tabs>
                            <v-alert v-if="v$Encaisser.articles.$errors.length !==0"
                                     type="error"
                                     density="compact">
                                Pas d'articles sélectionnés.
                            </v-alert>
                        </v-col>
                    </v-row>
                    <v-row v-if="action !== SHOW && pot.etat === 'Créé'">
                        <v-col>
                            <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
                            <div v-else>
                                <produits-list :key="pot"
                                               v-model="pot.articles"
                                               :filters="[
                                                   {by:'type._id', value:filtre as string},
                                                   ] as Array<ProduitsListFilterInterface>"
                                               :produits-dispo-list="produitToScreen as ProduitInterface[]"/>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
            <v-col v-if="pot.articles?.length > 0" sm="12" lg="3">
                <pot-recap-tab :pot="pot as PotInterface"
                               :valeur-point="valeurPoint as number"
                               :total-par-participant="totalParParticipantComputed"
                               :total="total"/>
            </v-col>
            <pot-paiement-tab v-if="paiementEnCoursComputed"
                              :init-panel="pot.participants.map((potPart, indexParticipant) => indexParticipant)">
                <pot-paiement-table-row v-for="(participant, index) in pot.participants"
                                        :participant="participant"
                                        :color-alert="colorAlertPaiement[index]"
                                        :key="index">
                    <pot-paiement-table-row-content :payer="payer"
                                                    :is-disable="action === SHOW"
                                                    :total-par-participant="totalParParticipantComputed"
                                                    :participant="participant"
                                                    @update:color="(newColor) => colorAlertPaiement[index]= newColor"
                                                    @update:participant="(newValue: ParticipantPotInterface) =>
                                                    pot.participants[index] = newValue"
                                                    :key="index"/>
                </pot-paiement-table-row>
            </pot-paiement-tab>
        </v-row>
        <v-btn-group class="btn-group">
            <v-btn v-if="action === EDIT"
                   color="primary"
                   key="edit"
                   @click="handleCreateUpdatePot"
                   class="ma-2">Modifier
            </v-btn>
            <v-btn v-else-if="action === CREATE"
                   color="primary"
                   key="create"
                   @click="handleCreateUpdatePot"
                   class="ma-2">Créer
            </v-btn>
            <v-btn color="primary"
                   key="close"
                   @click="navigateTo(`/pots`)"
                   class="ma-2">Fermer
            </v-btn>
            <v-btn v-if="pot.etat === 'Créé' && action !== CREATE && action !== SHOW"
                   color="primary"
                   key="clotureSaisie"
                   @click="demanderEncaisser"
                   class="ma-2">Encaisser
            </v-btn>
        </v-btn-group>
    </v-container>
    <ModalConfirmation v-model="openDialogValidation"
                       @confirmer="confirmerEncaisser"
                       titre="Encaisser le pôt"
                       question="Cette action est irreversible, souhaitez-vous encaisser le pôt ?"/>
</template>

<script setup lang="ts">
import ParticipantPotInterface from "~/interfaces/potsInterfaces/ParticipantPotInterface";
import PotInterface from "~/interfaces/potsInterfaces/PotInterface";
import ProduitInterface from "~/interfaces/produitInterfaces/ProduitInterface";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import UsersResponseInterface from "~/interfaces/userInterfaces/UsersResponseInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";

import Fetch from "~/services/FetchService";
import {ComputedRef} from "vue";
import PotPaiementTab from "~/components/potComponents/PotPaiementTab.vue";
import PotRecapTab from "~/components/potComponents/PotRecapTab.vue";
import PotPaiementTableRow from "~/components/potComponents/PotPaiementTableRow.vue";
import PotPaiementTableRowContent from "~/components/potComponents/PotPaiementTableRowContent.vue";
import {required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {useMenuStore} from "~/stores/menuStore";
import TypeProduitInterface from "~/interfaces/produitInterfaces/TypeProduitInterface";
import ProduitsListFilterInterface from "~/interfaces/produitInterfaces/ProduitsListFilterInterface";

definePageMeta({
    /** teste la route avant la céation de la page */
    validate: async (route) => {
        // Check if the id is made up of digits
        return ['show', 'edit'].includes(route.params.action as string)
            && /[0-9a-zA-Z]{16}/.test(route.params.id as string)
            || route.params.action === 'add' && route.params.id === ''
    }
})

const {action, id} = useRoute().params

const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'add'

/** Teste le format de l'_id dans la route */
const isIdValid = ['show', 'edit'].includes(action as string)
    && /[0-9a-zA-Z]{16}/.test(id as string)

/** REFS */
const pot: Ref<PotInterface> = ref({
    titre: '',
    participants: [],
    date: (new Date).toISOString(),
    articles: [],
    etat: 'Créé'
} as PotInterface)
const users: Ref<Array<ParticipantPotInterface>> = ref([] as Array<ParticipantPotInterface>)
const typeproduits: Ref<Array<TypeProduitInterface>> = ref([] as Array<TypeProduitInterface>)
const produitToScreen: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)
const filtre: Ref<string> = ref('')
const colorAlertPaiement: Ref<Array<string>> = ref([])
const valeurPoint: Ref<number> = ref(0)
const show: Ref<boolean> = ref(false)
const openDialogValidation: Ref<boolean> = ref(false)

/** STORES */

/** Gestion du Titre dans l'APPBAR*/
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = action === 'edit' && "Modification du pot"
    || action === 'add' && "Ajout d'un pot"
    || "Informations du pot"

/** Gestion du message success or error de App.vue */
const {
    putSnackBarMessage
} = useSnackbarStore()

/** VUELIDATE */

/** Règles vuelidate utilisées pour la création et la modification */
const rules = {
    titre: {required},
    participants: {required},
}

/** Règles vuelidate utilisées pour l'encaissement */
const rulesEncaisser = {
    ...rules,
    articles: {required}
}

const v$ = useVuelidate(rules, pot)
const v$Encaisser = useVuelidate(rulesEncaisser, pot)

/** COMPUTED */

/** Calcul du total en euro */
const total = computed(() => {
    let result = 0
    pot.value?.articles
        .map(article => article.prixEuros * article.quantite + article.prix * article.quantite * valeurPoint.value)
        .forEach(valeurEuros => result += valeurEuros)
    return Number(result)
})

/** Calcul du total en euro par participant */
const totalParParticipantComputed: ComputedRef<string> = computed(()=>{
    if(pot.value.participants && pot.value.participants.length!==0) {
        return (total.value / pot.value.participants.length).toFixed(2)
    }else return ''
})

/** Computed faisant le lien entre le composant date en YYYY-mm-dd et la date souhaitée en ISO */
const formatedDateComputed = computed({
    get: () => {
        const dateToFormat = new Date(pot.value.date)
        const day = dateToFormat.getDate()
        const month = dateToFormat.getMonth() + 1
        const year = dateToFormat.getFullYear()

        return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`
    },
    set: newDateFromTextField => {
        pot.value.date = new Date(newDateFromTextField).toISOString()
    }
})

/** Computed boolean permettant l'affichage du tableau de paiement */
const paiementEnCoursComputed = computed(() =>
    pot.value.etat === 'Paiement' || pot.value.etat === 'Payé')

/** LIFECYCLE */

/** Chargement des données après le montage du composant dans le dom */
onMounted(() => {
    Fetch.requete({url: '/parametre/valeurBN', method: 'GET'}, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = Number(resultBN.valeur)
    })

    Fetch.requete({
        url: '/typeproduits',
        method: 'POST',
        data: {"proposablePot": true}
    }, (resultTypeproduits: Array<TypeProduitInterface>) => {
        Fetch.requete({url: '/pots/produits', method: 'POST'}, (resultProduits: {
            produits: Array<ProduitInterface>
        }) => {
            typeproduits.value = resultTypeproduits
            filtre.value = resultTypeproduits[0]._id || ''
            produitToScreen.value = resultProduits.produits
        })
    })
    if (isIdValid) {
        Fetch.requete({url: `/pots/${id}`, method: 'GET'}, (resultPot: { pot: PotInterface }) => {
            if (resultPot.pot !== null) {
                pot.value = resultPot.pot
            } else console.error('pas de pot correspondant à : ' + id)
        })
    }
    Fetch.requete({
        url: '/users',
        data: {page: 1, nombre: 1000, isDesactive: false}
    }, (resultUtil: UsersResponseInterface) => {
        users.value = resultUtil.documents.map(user =>
            pot.value.participants.find(participant => participant._id === user._id)
            ?? {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                paiementVirement: 0,
                paiementCheque: 0,
                paiementEspece: 0,
                renduMonnaie: 0,
                paye: false,
            } as ParticipantPotInterface)
    })
})

/** METHODS */

/**
 * Permet la création ou la modification si ID
 */
const handleCreateUpdatePot = () => {

    v$.value.$validate()
        .then(isValid => {
            if (isValid) {
                const data = pot.value._id ?
                    {url: `/pots/${pot.value._id}`, data: {pot: pot.value}, method: 'PUT'}
                    :
                    {url: '/pots/create', data: {pot: pot.value}, method: 'POST'}
                const message = pot.value._id ? 'Modification OK' : 'Création OK'
                Fetch.requete(
                    data,
                    () => fermer(message),
                    () => erreur(isValid?'Modification':'Création')
                )
            }
        }
    )
}

/**
 * Teste la validité du pot avant encaissement puis ouvre la fenêtre de confirmation
 */
const demanderEncaisser = () => {
    v$Encaisser.value.$validate()
        .then(isValid => {
            if(isValid){
                openDialogValidation.value = true
            }
        })
}

/**
 * permet l'affichage de la snackbar de app.vue au retour sur /pots
 * @param messageAfficher
 */
const fermer = (messageAfficher: string) => {
    if (messageAfficher) {
        putSnackBarMessage(messageAfficher)
    }
    navigateTo(`/pots`)
}

/**
 * En cas d'erreur dans la requête HTTP
 * @param type
 */
const erreur = (type: string) => putSnackBarMessage(
    `Une erreur a eu lieu dans la ${type}`,
    'error'
)


/**
 * A la validation de l'encaissement, transmet le nouvel état sur le serveur
 */
const confirmerEncaisser = () => {
    const potTemp = {...pot.value, etat: 'Paiement', dateEncaissement: new Date()}

    Fetch.requete({
        url: `/pots/${pot.value._id}`,
        data: {pot: potTemp},
        method: 'PUT'
    }, () => {
        pot.value = potTemp
        openDialogValidation.value = false
    });
}

/**
 * Valide le paiement de l'utilisateur sélectionné
 * @param identifiant
 */
const payer = (identifiant: string) => {
    const participant = pot.value.participants.find(item => item._id === identifiant)
    if (participant) {
        participant.paye = true
        participant.datePaiement = new Date()
        const paye = pot.value.participants.map(item => item.paye).reduce((a, b) => a && b);

        if (paye) {
            pot.value.etat = "Payé"
        }
        Fetch.requete({
                url: `/pots/${pot.value._id}`,
                data: {pot: pot.value},
                method: 'PUT'
            }, () => putSnackBarMessage(`Le pot a été payé par ${participant.nom}`),
            () => putSnackBarMessage(
                `Il y a eu un problème dans le paiement de ${participant.nom}`,
                'error')
        )
    }
}

</script>
<style scoped>
.btn-group {
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 2;
    background-color: white;
    box-shadow: 0 1px 2px grey;
}
</style>