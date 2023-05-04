<template>
    <h2>{{ TITLE }}</h2>
    <v-container>
        <v-row class="mb-4">
            <v-col sm="12" :lg="pot?.articles?.length > 0 ? 9 : 12">
                <v-container>
                    <v-row>
                        <v-col sm="12" md="8">
                            <v-text-field label="Titre"
                                          name="titre"
                                          :disabled="action === SHOW"
                                          v-model="pot.titre"
                                          type="text"/>
                        </v-col>
                        <v-col sm="12" md="4">
                            <v-text-field label="Jour événement"
                                          name="date"
                                          :disabled="action === SHOW"
                                          v-model="formatedDate"
                                          type="date"/>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-select v-model="pot.participants"
                                  :items="users as UserInterface[]"
                                  :item-title="(user) => `${user.nom}  ${user.prenom}`"
                                  :disabled="action === SHOW"
                                  return-object
                                  multiple
                                  chips
                                  label="Clients"/>
                    </v-row>
                    <v-row v-if="action !== SHOW && pot.etat === 'Créé'">
                        <v-col>
                            <v-tabs v-model="filtre"
                                    center-active
                                    color="primary"
                                    slider-color="secondary"
                                    align-tabs="center"
                            >
                                <v-tab value="Bières">Bières</v-tab>
                                <v-tab value="Boissons">Boissons</v-tab>
                            </v-tabs>
                        </v-col>
                    </v-row>
                    <v-row v-if="action !== SHOW && pot.etat === 'Créé'">
                        <v-col>
                            <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
                            <div v-else>
                                <produits-list v-model="pot.articles"
                                               filter-by="type.nom"
                                               :filter-value="filtre as string"
                                               :produits-dispo-list="produitToScreen as ProduitInterface[]"/>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
            <v-col v-if="pot.articles?.length > 0" sm="12" lg="3">
                <pot-recap-tab :pot="pot as PotInterface"
                               :valeur-point="valeurPoint as number"
                               :total-par-participant="totalParParticipant"
                               :total="total"/>
            </v-col>
            <pot-paiement-tab v-if="pot.etat === 'Paiement' || pot.etat === 'Payé'"
                              :participants="pot.participants"
                              :is-disable="action === SHOW"
                              :total-par-participant="totalParParticipant"
                              :payer="payer"/>
        </v-row>
        <v-btn-group class="btn-group">
            <v-btn v-if="action === EDIT"
                   color="primary"
                   key="edit"
                   @click="handleClickPot"
                   class="ma-2">Modifier
            </v-btn>
            <v-btn v-else-if="action === CREATE"
                   color="primary"
                   key="create"
                   @click="handleClickPot"
                   class="ma-2">Créer
            </v-btn>
            <v-btn color="primary"
                   key="close"
                   @click="fermer"
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
</template>

<script setup lang="ts">
import UserInterface from "~/interfaces/UserInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import PotInterface from "~/interfaces/PotInterface";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import ParticipantPotInterface from "~/interfaces/ParticipantPotInterface";
import {ComputedRef} from "vue";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import PotPaiementTab from "~/components/PotPaiementTab.vue";

definePageMeta({
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

const TITLE = action === 'show' && "Informations pot"
    || action === 'edit' && "Modifier pot"
    || action === 'add' && "Ajouter pot"
    || "Informations pot"

const isIdValid = ['show', 'edit'].includes(action as string)
    && /[0-9a-zA-Z]{16}/.test(id as string)

const pot: Ref<PotInterface> = ref({
    titre: '',
    participants: [],
    date: (new Date).toDateString(),
    articles: [],
    etat: 'Créé'
} as PotInterface)
const users: Ref<Array<ParticipantPotInterface>> = ref([] as Array<ParticipantPotInterface>)
const produitToScreen: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)
const filtre: Ref<string> = ref('Bières')
const valeurPoint: Ref<number> = ref(0)
const show: Ref<boolean> = ref(false)
const openDialogValidation: Ref<boolean> = ref(false)


const total = computed(()=>{
    let result = 0
    pot.value?.articles
        .map(article => article.prixEuros * article.quantite + article.prix * article.quantite * valeurPoint.value)
        .forEach(valeurEuros => result+=valeurEuros)
    return Number(result)
})

const totalParParticipant: ComputedRef<string> = computed(()=>{
    if(pot.value.participants && pot.value.participants.length!==0) {
        return (total.value / pot.value.participants.length).toFixed(2)
    }else return ''
})

const formatedDate = computed({
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

const handleClickPot = () => {
    if (pot.value.participants && pot.value.participants.length > 0) {
        const data = pot.value._id ?
            {url: `/pots/${pot.value._id}`, data: {pot: pot.value}, method: 'PUT'}
            :
            {url: '/pots/create', data: {pot: pot.value}, method: 'POST'}
        const message = pot.value._id ? 'Modification OK' : 'Création OK'
        Fetch.requete(data, () => fermer(message))
    } else {
        alert("Il n'y a pas de participant")
    }
}

const demanderEncaisser = () => {
    openDialogValidation.value = true
    let message = ''
    if (pot.value.articles.length === 0) {
        openDialogValidation.value = false;
        message = `${message} Vous n'avez pas de produits selectionnés.`;
    }

    if (pot.value.participants.length === 0) {
        openDialogValidation.value = false;
        message = `${message} Vous n'avez pas de clients selectionnés.`;
    }

    if (!openDialogValidation.value) {
        alert(message);
    }
}

const fermer = (t: string) => {
}
watch(()=>pot, nV => console.log(nV))
const confirmerEncaisser = () => {
    const potTemp = {...pot.value, etat: 'Paiement', dateEncaissement: new Date()}

    Fetch.requete({
        url: `/pots/${pot.value._id}`,
        data: {pot: pot.value},
        method: 'PUT'
    }, () => {
        pot.value = potTemp
        openDialogValidation.value = false
    });
}

const payer = (identifiant: string) => {
    const participant = pot.value.participants.find(item => item._id === identifiant)
    if (participant) {
        participant.paye = true
        participant.datePaiement = new Date()
    }
    const paye = pot.value.participants.map(item => item.paye).reduce((a, b) => a && b);

    if (paye) {
        pot.value.etat = "Payé"
    }

    Fetch.requete({
        url: `/pots/${pot.value._id}`,
        data: {pot: pot.value},
        method: 'PUT'
    }, () => {
        console.log('reussite')
    })
}

onMounted(() => {
    Fetch.requete({ url: '/parametre/valeurBN', method: 'GET' }, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = resultBN.valeur
    })
    Fetch.requete({url: '/pots/produits', method: 'POST'}, (resultProduits: { produits: Array<ProduitInterface> }) => {
        produitToScreen.value = resultProduits.produits
    })
    if (isIdValid) {
        Fetch.requete({url: `/pots/${id}`, method: 'GET'}, (resultPot: { pot: PotInterface }) => {
            if (resultPot.pot !== null) {
                pot.value = resultPot.pot
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
            } else console.error('pas de pot correspondant à : ' + id)
        })
    }
})
</script>

<style scoped>
.btn-group {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background-color: white;
    box-shadow: 0 1px 2px grey;
}
</style>