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
                                          v-model="pot.titre"
                                          type="text"/>
                        </v-col>
                        <v-col sm="12" md="4">
                            <v-text-field label="Jour événement"
                                          name="date"
                                          v-model="formatedDate"
                                          type="date"/>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-select v-model="pot.participants"
                                  :items="users as UserInterface[]"
                                  :item-title="(user) => `${user.nom}  ${user.prenom}`"
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
                    <v-row>
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
                <pot-recap-tab :pot="pot as PotInterface"/>
            </v-col>
            <v-col v-if="pot.etat === 'Paiement' || pot.etat === 'Payé'">
                <v-table density="compact">
                    <thead>
                    <tr>
                        <th class="pa-0">Nom</th>
                        <th class="pa-0">Espèce</th>
                        <th class="pa-0">Chèque</th>
                        <th class="pa-0">Virement</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(participant, index) in pot.participants as ParticipantPotInterface[]"
                        :key="'paiement' + index">
                        <td class="pa-0">
                            {{ participant.nom }} {{ participant.prenom }}
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementEspece"
                                          :disabled="participant.paye || action === SHOW"
                                          type="number"
                                          step="0.25"
                                          :id="'paiementEspece_' + participant._id"/>
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementCheque"
                                          :disabled="participant.paye || action === SHOW"
                                          type="number"
                                          step="0.25"
                                          :id="'paiementCheque_' + participant._id"/>
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementVirement"
                                          :disabled="participant.paye || action === SHOW"
                                          type="number"
                                          step="0.25"
                                          :id="'paiementVirement_' + participant._id"/>
                        </td>
                        <td class="pa-0">
                            <v-alert v-if="!participant.peutEtrePaye"
                                     icon="false"
                                     type="warning">Manque {{ (participant.renduMonnaie * -1).toFixed(2) }} €
                            </v-alert>
                            <v-alert v-if="participant.peutEtrePaye && !participant.paye"
                                     icon="false"
                                     type="error">Rendre {{ participant.renduMonnaie.toFixed(2) }} €
                                <v-btn color="primary"
                                       @click="() => payer(participant._id)"> Payer
                                </v-btn>
                            </v-alert>
                            <v-alert v-if="participant.paye"
                                     type="success">Payé - Rendue {{ participant.renduMonnaie.toFixed(2) }} €
                            </v-alert>
                        </td>
                    </tr>
                    </tbody>
                </v-table>
            </v-col>
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
    date: '',
    articles: [],
    etat: ''
} as PotInterface)
const users: Ref<Array<UserInterface>> = ref([] as Array<UserInterface>)
const produitToScreen: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)
const filtre: Ref<string> = ref('Bières')
const valeurPoint: Ref<number> = ref(0)
const show: Ref<boolean> = ref(false)
const openDialogValidation: Ref<boolean> = ref(false)
const total: Ref<number> = ref(0)
const totalParParticipant: Ref<number> = ref(0)

watch(()=>pot.value.date, nv => console.log(nv))

const formatedDate = computed({
    get: () => {
        const dateToFormat = new Date(pot.value.date)
        const day = dateToFormat.getDate()
        const month = dateToFormat.getMonth() + 1
        const year = dateToFormat.getFullYear()

        return `${year}-${month<10?'0':''}${month}-${day<10?'0':''}${day}`
    },
    set: newDateFromTextField => {
        pot.value.date = new Date(newDateFromTextField).toISOString()
    }
})
const handleClickPot = () => {
    if (pot.value.participants && pot.value.participants.length > 0) {
        const data = pot.value._id ?
            { url: `/pots/${pot.value._id}`, data: { pot: pot.value }, method: 'PUT' }
             :
            { url: '/pots/create', data: { pot: pot.value }, method: 'POST' }
        const message = pot.value._id ?'Modification OK':'Création OK'
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

const confirmerEncaisser = () => {
    const potTemp = {...pot.value, etat: 'Paiement', dateEncaissement: new Date()}
    calcul();
    calculPaimentPot(totalParParticipant.value);

    Fetch.requete({
        url: `/pots/${pot.value._id}`,
        data: {pot: pot.value},
        method: 'PUT'
    }, () => {
        pot.value = potTemp
        openDialogValidation.value = false
    });
}

const calcul = () => {
    let totalTemp = 0
    pot.value.articles.forEach(element =>
        totalTemp += element.prixEuros * element.quantite + element.prix * element.quantite * valeurPoint.value)
    if (pot.value.participants.length > 0) {
        totalParParticipant.value = parseFloat((totalTemp / pot.value.participants.length)
            .toFixed(2))
    }
    total.value = parseFloat(totalTemp.toFixed(2))
}

const payer = (identifiant: string) => {
    const potTemp = {...pot.value}
    const participant = potTemp.participants.find(item => item._id === identifiant)
    if (participant) {
        participant.paye = true
        participant.datePaiement = new Date()
    }
    const paye = pot.value.participants.map(item => item.paye).reduce((a, b) => a && b);

    if (paye) {
        potTemp.etat = "Payé"
    }

    Fetch.requete({
        url: `/pots/${pot.value._id}`,
        data: {pot: potTemp},
        method: 'PUT'
    }, () => {
        pot.value = potTemp
    })
}

const calculPaimentPot = (totalParParticipant: number) => {
    pot.value.participants.forEach(participant => {
        let pc = participant.paiementCheque
        let pe = participant.paiementEspece
        let pv = participant.paiementVirement
        participant.renduMonnaie = (pc + pe + pv) - totalParParticipant;
        participant.peutEtrePaye = (pc >= 0 && pe >= 0 && pv >= 0) && participant.renduMonnaie >= 0
    })
}

onMounted(() => {
    Fetch.requete({url: '/pots/produits', method: 'POST'}, (resultProduits: { produits: Array<ProduitInterface> }) => {
        produitToScreen.value = resultProduits.produits
    })
    Fetch.requete({
        url: '/users',
        data: {page: 1, nombre: 1000, isDesactive: false}
    }, (resultUtil: UsersResponseInterface) => {
        users.value = resultUtil.documents
    })
    if (isIdValid) {
        Fetch.requete({url: `/pots/${id}`, method: 'GET'}, (resultPot: { pot: PotInterface }) => {
            if (resultPot.pot !== null) {
                pot.value = resultPot.pot
            } else console.error('pas de pot correspondant à : ' + id)
            // this.setPot(resultPot, produits, clients, title, mode, resultBN.valeur);
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