<template>
    <div>
        <v-container>
            <v-row>
                <v-col class="text-end">
                    <v-btn variant="flat"
                           color="secondary"
                           prepend-icon="mdi:mdi-plus"
                           @click="navigateTo('/pots/add')">Créer
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
        <div v-if="!loading" class="maxW800">
            <v-table density="comfortable" hover>
                <thead>
                <tr>
                    <th class="align-center">Date</th>
                    <th class="align-center">Titre</th>
                    <th class="align-center">Etat</th>
                    <th class="align-center">Actions</th>
                </tr>
                </thead>
                <tbody v-if="pots !== null">
                <tr v-for="(pot, index) in pots as Array<PotInterface>"
                    :key="index"
                    :style="`background-color: ${pot.etat === 'Payé' ? 'rgb(237, 247, 237)' : 'rgb(255, 244, 229)'}`"
                    @click="navigateTo(`/pots/show/${pot._id}`)">
                    <td class="align-center">{{ new Date(pot.date).toLocaleString('fr-FR', {dateStyle: 'full'}) }}</td>
                    <td class="align-center">{{ pot.titre }}</td>
                    <td class="align-center">{{ pot.etat }}</td>
                    <td class="align-center">
                        <v-btn @click="handleClickModifierPot($event, pot._id as string)">
                            <v-icon icon="mdi mdi_small mdi-pencil"></v-icon>
                        </v-btn>
                        <v-btn v-if="pot.etat === 'Créé'" @click="handleClickSupprimerPot($event, pot._id as string)">
                            <v-icon icon="mdi mdi_small mdi-delete"></v-icon>
                        </v-btn>
                    </td>
                </tr>
                </tbody>
            </v-table>
            <v-pagination v-if="nombreParPage !== 'all'"
                          v-model="page"
                          :length="paginationSize as Number"
                          prev-icon="mdi:mdi-arrow-left"
                          next-icon="mdi:mdi-arrow-right"/>
            <v-select v-model="nombreParPage"
                      :items="[
                          {value:'10', title: '10'},
                          {value:'20', title: '20'},
                          {value:'30', title: '30'},
                          {value:'all', title: 'Tous'},
                          ]"
                      item-title="title"
                      item-value="value"/>
        </div>
    </div>
    <ModalConfirmation v-model="openDialogSuppression"
                       @confirmer="handleConfirmerSuppression"
                       titre="Supprimer le pôt"
                       question="Cette action est irreversible, souhaitez-vous supprimer le pôt ?"/>
</template>

<script setup lang="ts">
import Fetch from "~/services/FetchService";
import PotsResponseInterface from "~/interfaces/potsInterfaces/PotsResponseInterface";
import PotInterface from "~/interfaces/potsInterfaces/PotInterface";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {useMenuStore} from "~/stores/menuStore";

const loading: Ref<boolean> = ref(false)
const pots: Ref<Array<PotInterface>> = ref([] as Array<PotInterface>)
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)

const identifiantASupp: Ref<string> = ref('')
const openDialogSuppression: Ref<boolean> = ref(false)

const {
    open: snackbarStoreOpen,
    message: snackbarStoreMessage,
    couleur: snackbarStoreCouleur
} = storeToRefs(useSnackbarStore())

const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = 'Pots'

watch(page, () => rechargerPotsList())
watch(nombreParPage, () => rechargerPotsList())
onMounted(() => rechargerPotsList())

/**
 * Méthode permettant de récupérer la liste des pots
 */
const rechargerPotsList = () => {
    loading.value = true
    Fetch.requete({
        url: '/pots',
        data: {page: page.value, nombre: nombreParPage.value}
    }, (reponse: PotsResponseInterface) => {
        paginationSize.value = Math.ceil(reponse.total / nombreParPage.value)
        pots.value = reponse.documents
        total.value = reponse.total
        page.value = reponse.page
        loading.value = false
    });
}

/**
 * Méthode déclenchée au click du bouton modifier
 * @param event
 * @param id
 */
const handleClickModifierPot = (event: Event, id: string) => {
    event.stopPropagation()
    //message.value = "modification OK"
    if (id)
        navigateTo(`/pots/edit/${id}`)
}

/**
 * Méthode déclenchée au click du bouton supprimer
 * @param event
 * @param id
 */
const handleClickSupprimerPot = (event: Event, id: string) => {
    event.stopPropagation()
    openDialogSuppression.value = true
    identifiantASupp.value = id
}

/**
 * Méthode déclenchée lors de la validation
 * de la suppression du pot
 */
const handleConfirmerSuppression = () => {
    Fetch.requete({url: `/pots/${identifiantASupp.value}`, method: 'DELETE'}, () => {
        snackbarStoreMessage.value = 'Suppression ok'
        snackbarStoreCouleur.value = 'success'
        snackbarStoreOpen.value = true
        openDialogSuppression.value = false
        rechargerPotsList()
    })
}

</script>

<style scoped>


</style>