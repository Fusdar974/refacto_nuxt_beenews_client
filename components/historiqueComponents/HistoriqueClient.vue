<template>
    <v-container class="ma-1">
        <v-row>
            <v-col v-if="historique && historique.length > 0" sm="12">
                <h3>Historique {{ type }}</h3>
                <generic-table v-if="type === 'SOUM'"
                               :objects="historique"
                               :attributes="attributesSoum"
                               :actions-td="true"
                               :dialog="true"
                               v-model:pagination-size="paginationSize"
                               v-model:page="page"
                               v-model:nb-par-page="nombreParPage"
                               @consulter="afficherDetail">
                    <template v-slot:default="slotProps">
                        <td>
                            <v-btn-group variant="tonal">
                                <v-btn icon="mdi:mdi-eye" variant="text"/>
                            </v-btn-group>
                        </td>
                    </template>
                </generic-table>
                <generic-table v-if="type === 'POT'"
                               :objects="historique"
                               :attributes="attributesPot"
                               :actions-td="true"
                               :dialog="true"
                               v-model:pagination-size="paginationSize"
                               v-model:page="page"
                               v-model:nb-par-page="nombreParPage"
                               @consulter="afficherDetail">
                    <template v-slot:default="slotProps">
                        <td>
                            <v-btn-group variant="tonal">
                                <v-btn icon="mdi:mdi-eye" variant="text"/>
                            </v-btn-group>
                        </td>
                    </template>
                </generic-table>
            </v-col>
        </v-row>
    </v-container>

    <historique-soum-dialog v-model:open-dialog="openDialog" v-if="type === 'SOUM'"
                            :commande="commande"></historique-soum-dialog>
    <historique-pot-dialog v-model:open-dialog="openDialog" v-if="type === 'POT'"
                           :commande="commande"></historique-pot-dialog>

</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService";
import {onMounted, watch} from "#imports";
import HistoriqueInterface from "~/interfaces/historiqueInterfaces/HistoriqueInterface";
import HistoriqueLigneInterface from "~/interfaces/historiqueInterfaces/HistoriqueLigneInterface";
import HistoriqueLigneResponseInterface from "~/interfaces/historiqueInterfaces/HistoriqueLigneResponseInterface";
import HistoriquePotDialog from "~/components/historiqueComponents/HistoriquePotDialog.vue";
import {Ref} from "vue";
import AttributeInterface from "~/interfaces/AttributeInterface";

/**REFS*/

const loading: Ref<boolean> = ref(true)
const openDialog: Ref<boolean> = ref(false)
const nombreParPage: Ref<string> = ref('10')
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)
const historique: Ref<Array<HistoriqueLigneInterface>> = ref([])
const commande: Ref<HistoriqueLigneInterface> = ref({} as HistoriqueLigneInterface)
//atributs à afficher sur un écran de grande taille
const attributesSoum: Ref<Array<AttributeInterface>> = ref([
    {header: 'Date', attr: 'date', isDate: true},
    {header: 'Ancien solde', attr: 'ancienSolde'},
    {header: 'BN crédité(s)', attr: 'nouveauCredit'},
    {header: 'BN débité(s)', attr: 'paiementCompte'},
    {header: 'Nouveau solde', attr: 'nouveauSolde'},
    {header: 'Espèce', attr: 'paiementEspece'},
    {header: 'Chèque', attr: 'paiementCheque'},
    {header: 'Virement', attr: 'paiementVirement'},
    {header: 'Monnaie rendue', attr: 'rendreMonnaie'}] as Array<AttributeInterface>)
//atributs à afficher sur un écran de petite taille
const attributesPot: Ref<Array<AttributeInterface>> = ref([
    {header: 'Date', attr: 'date', isDate: true},
    {header: 'Nom', attr: 'nom'},
    {header: 'Vous devez', attr: 'rendreMonnaie'}] as Array<AttributeInterface>)

const props = defineProps({
    userId: {type: String, required: true},
    type: {type: String, required: true},
})

/** WATCHES */

watch(page, () => majUser())
watch(nombreParPage, () => majUser())

/** LYFECYCLE */

onMounted(() => {
    majUser()
})

/** METHODS */

/**
 * Met à jour l'historique et la pagination
 * @param histo l'historique de l'utilisateur
 */
const setHistorique = (histo: HistoriqueInterface) => {
    total.value = histo.count
    historique.value = histo.histo
    paginationSize.value = Math.ceil(histo.count / histo.nombre)
}

/**
 * Envoie une requète qui demande l'historique de l'utilisateur et actualise l'historique affiché
 */
const majUser = () => {
    Fetch.requete(
        {
            url: `/users/historique/${props.type}/${props.userId}`,
            data: {page: page.value, nombre: nombreParPage.value},
            method: 'POST',
        },
        setHistorique)
}

/**
 * Envoie une requète qui demande le détail d'un élément de l'historique de l'utilisateur
 * et ouvre le dialog correspondant
 * @param identifiantHistorique l'identifiant de l'élément à afficher
 */
const afficherDetail = (identifiantHistorique: string) => {
    Fetch.requete({
        url: `/historique/${identifiantHistorique}`,
        method: 'GET'
    }, (resultat: HistoriqueLigneResponseInterface) => {
        commande.value = resultat.doc
        openDialog.value = true
    })
}

</script>

<style scoped>

@media (max-width: 500px) {
    .disparaitre {
        display: none !important;
    }
}

th {
    font-weight: bold !important;
}

</style>