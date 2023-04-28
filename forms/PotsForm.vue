<template>
    <h2>{{ pot.title }}</h2>
    <v-container>
        <v-row>
            <v-col sm="12" :lg="pot?.articles?.length > 0?9:12">
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
                                          v-model="pot.date"
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
                    <v-row v-if="mode !== SHOW && pot.etat === 'Créé'">
                        <v-col>
                            <v-tabs
                                    center-active
                                    color="primary"
                                    slider-color="secondary"
                                    align-tabs="center"
                                    v-model="filtre"
                            >
                                <v-tab value="Bières">
                                    Bières
                                </v-tab>
                                <v-tab value="Boissons">
                                    Boissons
                                </v-tab>
                            </v-tabs>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
                            <div v-else>
                                <produits-list v-model="pot.articles"
                                               filter-by="type.nom"
                                               :filter-value="filtre"
                                               :produits-dispo-list="produitToScreen"/>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
            <v-col v-if="pot.articles?.length > 0" sm="12" lg="3">
                <pot-recap-tab :pot="pot"/>
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
                    <tr v-for="(participant, index) in pot.participants"
                        :key="'paiement' + index">
                        <td class="pa-0">
                            {{ participant.nom }} {{ participant.prenom }}
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementEspece"
                                          :disabled="participant.paye || mode === SHOW"
                                          type="number"
                                          step="0.25"
                                          :id="'paiementEspece_' + participant._id"/>
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementCheque"
                                          :disabled="participant.paye || mode === SHOW"
                                          type="number"
                                          step="0.25"
                                          :id="'paiementCheque_' + participant._id"/>
                        </td>
                        <td class="pa-0">
                            <v-text-field v-model="participant.paiementVirement"
                                          :disabled="participant.paye || mode === SHOW"
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
        <v-btn-group>
            <v-btn v-if="mode === EDIT"
                   color="primary"
                   key="edit"
                   @click="modifier"
                   class="ma-2">Modifier
            </v-btn>
            <v-btn v-else-if="mode === CREATE"
                   color="primary"
                   key="create"
                   @click="creer"
                   class="ma-2">Créer
            </v-btn>
            <v-btn color="primary"
                   key="close"
                   @click="fermer"
                   class="ma-2">Fermer
            </v-btn>
            <v-btn v-if="pot.etat === 'Créé' && mode !== CREATE && mode !== SHOW"
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
import TypeProduitInterface from "~/interfaces/TypeProduitInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import ArticlePotInterface from "~/interfaces/ArticlePotInterface";
import VueDatePicker from '@vuepic/vue-datepicker';
import PotInterface from "~/interfaces/PotInterface";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import {ComputedRef} from "vue";
import potInterface from "~/interfaces/PotInterface";

const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'create'

const pot: Ref<PotInterface> = ref({} as PotInterface)
const users: Ref<Array<UserInterface>> = ref([] as Array<UserInterface>)
const articlesPots: Ref<Array<ArticlePotInterface> | []> = ref([])
const produitToScreen: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)
const filtre: Ref<string> = ref('Bières')
const valeurPoint: Ref<number> = ref(0)
const show: Ref<boolean> = ref(false)
const openDialogValidation: Ref<boolean> = ref(false)
const mode: Ref<string> = ref('')


const creer = () => {
    if (pot.value.participants.length > 0) {
        Fetch.requete({url: '/pots/create', method: 'POST', data: {pot: pot.value}}, () => {
            fermer('Création OK');
        });
    } else {
        alert("Il n'y a pas de participant")
    }
}

const modifier = () => {
    Fetch.requete({url: `/pots/${pot.value._id}`, data: {pot: pot.value}, method: 'PUT'}, () => {
        fermer('Modification OK');
    });
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

    const retour = calcul();
    calculPaimentPot(retour.totalParParticipant);

    Fetch.requete({url: `/pots/${pot.value._id}`, data: {pot: pot.value}, method: 'PUT'}, () => {
        pot.value.etat = "Paiement";
        retour.pot = {...pot.value}
        retour.openDialog = false;
        return retour;
    });
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
})
</script>

<style scoped>

</style>