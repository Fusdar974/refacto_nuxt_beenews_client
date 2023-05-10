<template>
  <private-route>
    <div>
      <v-container class="maxW1000 align-center align-content-lg-space-between ma-3">
        <v-row>
          <v-col>
            <h3 class="d-lg-none">Stock </h3>
            <h1 class="d-none d-lg-block">Stock</h1>
          </v-col>
          <v-row>
            <v-col>
              <v-text-field
                  name="champderecherche"
                  v-model="champRecherche"
                  append-inner-icon="mdi:mdi-magnify"/>
              <v-btn variant="tonal"
                     color="primary"
                     @click="ajouter">Créer</v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-container>
      <generic-table :objects="produits" :attributes="attributes" :actions-td="true"
                     v-model:page-size="paginationSize" v-model:page="page" v-model:nb-par-page="nombreParPage">
        <template v-slot:default="slotProps">
          <td>
            <v-btn-group variant="tonal">
              <v-btn @click="handleModifier($event,slotProps.obj._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-pencil"></v-icon></v-btn>
              <v-btn v-if="slotProps.obj.effacable" @click="handleSupprimer($event, slotProps.obj._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-delete"></v-icon></v-btn>
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
                          :question="'Voulez vous supprimer cet utilisateur ?'"
                          @confirmer="handleConfirmerSuppression">
      </modal-confirmation>
      <modal-confirmation v-model="openInventairePartiel"
                          :titre="'Catégories à imprimer'"
                          :question="'Quelles sont les catégories à imprimer?'"
                          @confirmer="confirmerInventairePartiel">
        <v-card-actions>
          <v-checkbox v-for="(type,index) in types"
                      :key="index"
                      v-model="type.selectionne"
                      :label="type.nom"
                      :value="type"
                      color="indigo" ></v-checkbox>
        </v-card-actions>
      </modal-confirmation>
    </div>
    <v-snackbar v-model="open" timeout="1000"><v-alert type="success">{{message}}</v-alert></v-snackbar>
  </private-route>
</template>

<script setup lang="ts">
import UserInterface from "~/interfaces/UserInterface";
import ActionInterface from "~/interfaces/ActionInterface";
import {watch} from "#imports";
import Fetch from "~/services/FetchService";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import TypeInterface from "~/interfaces/TypeProduitInterface";
import ProduitsResponseInterface from "~/interfaces/ProduitsResponseInterface";
import AttributeInterface from "~/interfaces/AttributeInterface";
import serverconfig from "~/serverconfig";


const loading : Ref<boolean> = ref(false)
const produits: Ref<Array<ProduitInterface> | null> = ref(null)
const nombreParPage: Ref<string>= ref('10')
const types: Ref<Array<TypeInterface> >= ref([{}] as TypeInterface[])
const attributes: Ref<Array<AttributeInterface>> = ref([{header: 'Nom', attr:'nom',},
  {header: 'Image', attr: 'image', isImage: true}, {header: 'Stock', attr: 'nombre'}, {header: 'Type', attr: 'type.nom'}] as Array<AttributeInterface>)
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
/**
 * authenticate, booleén qui permet de savoir si l'utilisateur est authentifié
 */
const props = defineProps({
  authenticate: Boolean,
})

watch(page, () => recharger())
watch(nombreParPage, () => recharger())
watch(champRecherche, () => recharger())

/**
 * recharge la liste des utilisateurs lorsque la page est créée
 */
onMounted(()=>{
  Fetch.requete({ url: '/typeproduits' }, (result: [TypeInterface]) =>
      types.value = result.map(item => ({
        _id: item._id, nom: item.nom, proposablePot: item.proposablePot, proposableSoum: item.proposableSoum, nombreProduits: item.nombreProduits,  selectionne: false
      })));
  recharger();
})

/**
 * Recharge la page en envoyant une requète vers le back, si celle-ci réussie,
 * la liste des utilisateurs est mises à jour ainsi que la pagination
 */
const recharger = () => {
  loading.value = true
  Fetch.requete({ url: '/produits', data: { page: page.value, nombre: nombreParPage.value ,recherche: champRecherche.value } }, (result : ProduitsResponseInterface) => {
    paginationSize.value = Math.ceil(result.total / parseInt(nombreParPage.value));
    produits.value = result.documents

    total.value = result.total
    page.value = result.page > paginationSize.value ? paginationSize.value: result.page
    loading.value = false}, () => {loading.value = false} );
}

/**
 * envoie sur le composant de modification d'utilisateur
 * @param event ici le click sur le bouton
 * @param id l'identifiant de l'utilisateur sélectionné
 */
const handleModifier = (event: Event, id: string) => {
  event.stopPropagation()
  identifiant.value = id
  navigateTo(`/produits/edit/${identifiant.value}`)
}

/**
 * Active le dialog de confirmation de suppression de client
 * @param event ici le click sur le bouton
 * @param id l'identifiant de l'utilisateur sélectionné
 */
const handleSupprimer = (event: Event , id: string) => {
  event.stopPropagation()
  openDialog.value = true
  identifiantASupp.value =  id
}

/**
 * envoie sur le composant de création d'utilisateur
 */
const ajouter = () => {
  message.value = "modification OK"
  navigateTo('/produits/add')
}

/**
 * Affiche un message dans un snackbar lors de la fermeture d'un dialog
 * @param messageAfficher message à afficher
 */
const closeAction = (messageAfficher : string) => {
  if (messageAfficher) {
    open.value = true
    message.value = messageAfficher
  }
  recharger();
}

/**
 * Supprime l'utilisateur , affiche un message de confirmation dans une snackbar et ferme le dialog
 */
const handleConfirmerSuppression = () => {
  Fetch.requete({ url: `/users/${identifiantASupp.value}`, method: 'DELETE' }, () => {
    closeAction('SUPPRESSION ok');
    openDialog.value = false
  });
}

const confirmerInventairePartiel = () => {
  Fetch.requete({ url: '/produits/pdf', method: 'POST', data: { types:  types.value.filter(item => item.selectionne).map(item => item._id) } }, result => {
    window.open(`${serverconfig}v1/pdf/pdf?token=${result.ticket}`, '_blanck');
  });
  openInventairePartiel.value = !openInventairePartiel.value
}

const afficherPDF = () => {
  Fetch.requete({ url: '/produits/pdf', method: 'POST' }, result => {
    window.open(`${serverconfig}v1/pdf/pdf?token=${result.ticket}`, '_blanck');
  });
}

</script>

<style scoped>

</style>