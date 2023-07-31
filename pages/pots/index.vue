<template>
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
    <generic-table v-if="!loading"
                   :objects="pots"
                   :attributes="attributesPot"
                   :actions-td="true"
                   :row-colors="backgroundColorsComputed"
                   v-model:pagination-size="paginationSize"
                   v-model:page="page"
                   v-model:nb-par-page="nombreParPage"
                   @consulter="(_id) => navigateTo(`pots/show/${_id}`)">
        <template v-slot:default="slotProps">
            <td>
                <v-btn-group variant="tonal">
                    <v-btn @click="handleClickModifierPot($event, slotProps.obj._id as string)">
                        <v-icon icon="mdi mdi_small mdi-pencil"></v-icon>
                    </v-btn>
                    <v-btn v-if="slotProps.obj.etat === 'Créé'"
                           @click="handleClickSupprimerPot($event, slotProps.obj._id as string)">
                        <v-icon icon="mdi mdi_small mdi-delete"></v-icon>
                    </v-btn>
                </v-btn-group>
            </td>
        </template>
    </generic-table>
    <ModalConfirmation v-model="openDialogSuppression"
                       @confirmer="handleConfirmerSuppression"
                       titre="Supprimer le pôt"
                       question="Cette action est irreversible, souhaitez-vous supprimer le pôt ?"/>
</template>

<script setup lang="ts">
import Fetch from "~/services/FetchService";
import PotInterface from "~/interfaces/potsInterfaces/PotInterface";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {useMenuStore} from "~/stores/menuStore";
import {Ref} from "vue/dist/vue";
import AttributeInterface from "~/interfaces/AttributeInterface";
import ResponseListInterface from "~/interfaces/ResponseListInterface";

/** REFS */
const loading: Ref<boolean> = ref(false)
const pots: Ref<Array<PotInterface>> = ref([] as Array<PotInterface>)
const nombreParPage: Ref<string> = ref('10')
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)

const attributesPot: Ref<Array<AttributeInterface>> = ref([
    {header: 'Date', attr: 'date', isDate: true},
    {header: 'Titre', attr: 'titre',},
    {header: 'Etat', attr: 'etat',},])

const identifiantASupp: Ref<string> = ref('')
const openDialogSuppression: Ref<boolean> = ref(false)

/** STORES */
const {putSnackBarMessage} = useSnackbarStore()

const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = 'Pots'

const backgroundColorsComputed = computed(() =>
    pots.value.map(pot => pot.etat === 'Payé' ? 'rgb(237, 247, 237)' : 'rgb(255, 244, 229)'))

/** WATCHES */

/** Gestion des données du tableau Pots */
watch(page, () => rechargerPotsList())
watch(nombreParPage, () => rechargerPotsList())

/** LYFECYCLE */

onMounted(() => rechargerPotsList())

/** METHODS */

/**
 * Méthode permettant de récupérer la liste des pots
 */
const rechargerPotsList = () => {
    loading.value = true
    Fetch.requete({
        url: '/pots',
        data: {page: page.value, nombre: nombreParPage.value}
    }, (reponse: ResponseListInterface<PotInterface>) => {
        paginationSize.value = nombreParPage.value !== 'all' ?
            Math.ceil(reponse.total / parseInt(nombreParPage.value)) : 1
        pots.value = reponse.documents
        total.value = reponse.total
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
        putSnackBarMessage('Suppression ok')
        openDialogSuppression.value = false
        rechargerPotsList()
    })
}

</script>

<style scoped>
</style>