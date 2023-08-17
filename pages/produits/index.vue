<template>
  <div class="ma-3">
    <v-container class="hidden-sm-and-down">
      <v-row class="justify-space-between ">
        <v-col cols="5">
          <v-text-field
              name="champderecherche"
              density="compact"
              variant="outlined"
              v-model="champRecherche"
              append-inner-icon="mdi:mdi-magnify"/>
        </v-col>
        <v-col cols="3" class="text-end">
          <v-btn variant="flat"
                 color="secondary"
                 prepend-icon="mdi:mdi-plus"
                 @click="navigateTo('/items/add')">Créer
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-container sm class="hidden-md-and-up">
      <v-row class="justify-space-between">
        <v-text-field
            name="champderecherche"
            density="compact"
            variant="outlined"
            v-model="champRecherche"
            append-inner-icon="mdi:mdi-magnify"/>
      </v-row>
      <v-row class="text-end">
        <v-btn variant="flat"
               class="w-100"
               color="secondary"
               prepend-icon="mdi:mdi-plus"
               @click="navigateTo('/items/add')">Créer
        </v-btn>
      </v-row>
    </v-container>
    <generic-table :objects="items as ItemInterface[]"
                   :attributes="attributesComputed"
                   :actions-td="true"
                   v-model:pagination-size="paginationSize"
                   v-model:page="page"
                   v-model:nb-par-page="nombreParPage"
                   :max-height-img="100"
                   :max-width-img="200"
                   @consulter="(_id) => navigateTo(`items/show/${_id}`)">
      <template v-slot:default="slotProps">
        <td>
          <v-btn-group variant="tonal">
            <v-btn @click="handleModifier($event,slotProps.obj._id)" class="ma-1">
              <v-icon icon="mdi mdi_small mdi-pencil"></v-icon>
            </v-btn>
            <v-btn v-if="slotProps.obj.effacable" @click="handleSupprimer($event, slotProps.obj._id)"
                   class="ma-1">
              <v-icon icon="mdi mdi_small mdi-delete"></v-icon>
            </v-btn>
          </v-btn-group>
        </td>
      </template>
    </generic-table>
    <v-container class="align-center">
      <v-btn @click="openInventairePartiel = !openInventairePartiel" variant="tonal" color="primary" class="ma-1">
        Inventaire partiel
      </v-btn>
      <v-btn @click="afficherPDF" variant="tonal" color="primary" class="ma-1">
        Inventaire complet
      </v-btn>
    </v-container>
    <v-container v-if="loading" class="align-center">
      <v-row>
        <v-col>
          <v-progress-circular model-value="20"></v-progress-circular>
        </v-col>
      </v-row>
      <v-col>Chargement...</v-col>
    </v-container>
    <modal-confirmation v-model="openDialog"
                        :titre="'Confirmation de suppression'"
                        :question="'Voulez vous supprimer ce produit ?'"
                        @confirmer="handleConfirmerSuppression">
    </modal-confirmation>
    <modal-confirmation v-model="openInventairePartiel"
                        :titre="'Catégories à imprimer'"
                        :question="'Quelles sont les catégories à imprimer?'"
                        @confirmer="confirmerInventairePartiel">
      <v-card-actions>
        <v-checkbox v-for="(type,index) in types"
                    :key="index"
                    v-model="type._id"
                    :label="type.name"
                    :value="type"
                    color="indigo"></v-checkbox>
      </v-card-actions>
    </modal-confirmation>
  </div>
  <v-snackbar v-model="open" timeout="1000">
    <v-alert type="success">{{ message }}</v-alert>
  </v-snackbar>
</template>

<script setup lang="ts">
import {watch} from "#imports";
import Fetch from "~/services/FetchService";
import ItemInterface from "~/interfaces/produitInterfaces/ItemInterface";
import ItemTypeInterface from "~/interfaces/produitInterfaces/ItemTypeInterface";
import AttributeInterface from "~/interfaces/AttributeInterface";
import serverconfig from "~/serverconfig";
import {useDisplay} from "vuetify";
import {Ref} from "vue";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {storeToRefs} from "pinia";
import {useMenuStore} from "~/stores/menuStore";


const loading: Ref<boolean> = ref(false)
const items: Ref<Array<ItemInterface>> = ref([])
const nombreParPage: Ref<string> = ref('10')
const types: Ref<Array<ItemTypeInterface>> = ref([{}] as ItemTypeInterface[])

const attributes: Ref<Array<AttributeInterface>> = ref([
  {header: 'Nom', attr: 'name'},
  {header: 'Stock', attr: 'stock'}] as Array<AttributeInterface>)
const attributesMdandUp: Ref<Array<AttributeInterface>> = ref([
  {header: 'Nom', attr: 'name'},
  {header: 'Image', attr: 'image', isImage: true},
  {header: 'Stock', attr: 'stock'},
  {header: 'Type', attr: 'itemType.name'}] as Array<AttributeInterface>)

const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)
const open: Ref<boolean> = ref(false)
const openDialog: Ref<boolean> = ref(false)
const openInventairePartiel: Ref<boolean> = ref(false)
const identifiant: Ref<string> = ref("")
const identifiantASupp: Ref<string> = ref("")
const champRecherche: Ref<string> = ref("")
const message: Ref<string> = ref("")
const props = defineProps({
  authenticate: Boolean,
})

const {mdAndUp} = useDisplay()
const {putSnackBarMessage} = useSnackbarStore()
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = "Stocks"

watch(page, () => recharger())
watch(nombreParPage, () => recharger())
watch(champRecherche, () => recharger())

/**
 * Liste d'attributs à afficher en fonction de la taille de l'écran
 */
const attributesComputed = computed(() => mdAndUp.value ? attributesMdandUp.value : attributes.value)

/**
 * recharge la liste des items lorsque la page est créée
 */
onMounted(() => {
  recharger();
})

/**
 * Recharge la page en envoyant une requète vers le back, si celle-ci réussie,
 * la liste des items est mises à jour ainsi que la pagination
 */
const recharger = () => {
  loading.value = true
  Fetch.requete(
      {
        url: '/items',
        method: 'GET',
        data: {
          page: page.value,
          limit: nombreParPage.value,
          search: champRecherche.value
        }
      },
      (result: PaginateResultInterface<ItemInterface>) => {
        items.value = result.data
        page.value = result.meta.currentPage
        paginationSize.value = result.meta.totalPages
        loading.value = false
      },
      () => {
        loading.value = false
      });
}

/**
 * envoie sur le composant de modification du l'item
 * @param event ici le click sur le bouton
 * @param id l'identifiant de l'item sélectionné
 */
const handleModifier = (event: Event, id: string) => {
  event.stopPropagation()
  identifiant.value = id
  navigateTo(`/items/edit/${identifiant.value}`)
}

/**
 * Active le dialog de confirmation de suppression de l'item
 * @param event ici le click sur le bouton
 * @param id l'identifiant de l'item sélectionné
 */
const handleSupprimer = (event: Event, id: string) => {
  event.stopPropagation()
  openDialog.value = true
  identifiantASupp.value = id
}

/**
 * Affiche un message dans un snackbar lors de la fermeture d'un dialog
 * @param messageAfficher message à afficher
 */
const closeAction = (messageAfficher: string) => {
  if (messageAfficher) {
    open.value = true
    message.value = messageAfficher
  }
  recharger();
}

/**
 * Supprime l'item, affiche un message de confirmation dans une snackbar et ferme le dialog
 */
const handleConfirmerSuppression = () => {
  Fetch.requete({url: `/items/${identifiantASupp.value}`, method: 'DELETE'}, () => {
    closeAction('SUPPRESSION ok');
    openDialog.value = false
  });
}

/**
 * Envoie une requete au back pour obtenir une liste des items en stock ne contenant que ceux du/des type(s) demandé(s),
 * télécharge cette liste sous forme d'un tableau en PDF
 * et ferme le dialog de sélection des types à filtrer
 *
 * TODO: GÉRER LA CRÉATION DE PDF DANS LE BACK
 */
// const confirmerInventairePartiel = () => {
//   Fetch.requete({url: '/items/pdf', method: 'POST', data: {types: types.value.filter(item => item._id).map(item => item._id)}}, (result: {
//     ticket: any;
//   }) => {
//     window.open(`${serverconfig}v1/pdf/pdf?token=${result.ticket}`, '_blanck');
//   });
//   openInventairePartiel.value = !openInventairePartiel.value
// }

/**
 * Envoie une requete au back pour obtenir une liste des items en stock et
 * télécharge cette liste sous forme d'un tableau en PDF
 */
const afficherPDF = () => {
  Fetch.requete({url: '/items/pdf', method: 'POST'}, (result: {
    ticket: any;
  }) => {
    window.open(`${serverconfig}v1/pdf/pdf?token=${result.ticket}`, '_blanck');
  });
}

</script>

<style scoped>

</style>