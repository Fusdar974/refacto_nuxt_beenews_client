<template>
  <private-route>
    <div>
        <v-container class="maxW1000 align-center align-content-lg-space-between ma-3">
          <v-row>
            <v-col>
              <h3 class="d-lg-none">Clients </h3>
              <h1 class="d-none d-lg-block">Clients</h1>
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
          <div v-if="!loading" class="maxW1000" >
            <generic-table :objects="users" :attributes="attributes" :actions-td="true"
                           v-model:page-size="paginationSize" v-model:page="page" v-model:nb-par-page="nombreParPage">
              <template v-slot:default="slotProps">
                <td>
                  <v-btn-group variant="tonal">
                    <v-btn @click="handleModifier($event,slotProps.obj._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-pencil"></v-icon></v-btn>
                    <v-btn v-if="slotProps.obj.supprimable" @click="handleSupprimer($event, slotProps.obj._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-delete"></v-icon></v-btn>
                  </v-btn-group>
                </td>
              </template>
            </generic-table>

          </div>
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
      </div>
    <v-snackbar v-model="open" timeout="1000"><v-alert type="success">{{message}}</v-alert></v-snackbar>
  </private-route>
</template>

<script setup lang="ts">

import UserInterface from "~/interfaces/UserInterface";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import Fetch from "~/services/FetchService";
import ActionInterface from "~/interfaces/ActionInterface";
import {watch} from "#imports";
import AttributeInterface from "~/interfaces/AttributeInterface";
import GenericTable from "~/components/GenericTable.vue";
import {useDisplay} from "vuetify";
import {Ref} from "vue";

const loading : Ref<boolean> = ref(false)
  const users: Ref<Array<UserInterface> | null> = ref(null)
  const nombreParPage: Ref<string>= ref('10')
  const total: Ref<number> = ref(0)
  const page: Ref<number> = ref(1)
  const paginationSize: Ref<number> = ref(1)
  const open: Ref<boolean> = ref(false)
  const openDialog: Ref<boolean> = ref(false)
  const actionUtilisateur: Ref<boolean> = ref(false)
  const action: Ref<ActionInterface |null> = ref(null)
  const identifiant: Ref<string> = ref("")
  const identifiantASupp: Ref<string> = ref("")
  const champRecherche: Ref<string> = ref("")
  const message: Ref<string> = ref("")
  const attributes: Ref<Array<AttributeInterface>> = ref([{header: 'Nom', attr:'nom',},
    {header: 'Prenom', attr: 'prenom'}, {header: 'BN', attr: 'compte'}] as Array<AttributeInterface>)
const attributesMdandUp: Ref<Array<AttributeInterface>> = ref([{header: 'Nom', attr:'nom',},
  {header: 'Image', attr: 'image', isImage: true}, {header: 'Stock', attr: 'nombre'}, {header: 'Type', attr: 'type.nom'}] as Array<AttributeInterface>)

const {mdAndUp} = useDisplay()

  /**
   * authenticate, booleén qui permet de savoir si l'utilisateur est authentifié
   */
  const props = defineProps({
    authenticate: Boolean,
  })

/**
 * Liste d'attributs à afficher en fonction de la taille de l'écran
 */
const attributesComputed = computed(() => mdAndUp.value ? attributesMdandUp.value : attributes.value)

  watch(page, () => recharger())
  watch(nombreParPage, () => recharger())
  watch(champRecherche, () => recharger())

  /**
   * recharge la liste des utilisateurs lorsque la page est créée
   */
  onMounted(()=>{
    recharger();
  })

  /**
   * Recharge la page en envoyant une requète vers le back, si celle-ci réussie,
   * la liste des utilisateurs est mises à jour ainsi que la pagination
   */
    const recharger = () => {
      loading.value = true
      Fetch.requete({ url: '/users', data: { page: page.value, nombre: nombreParPage.value ,recherche: champRecherche.value } }, (result : UsersResponseInterface) => {
        paginationSize.value = Math.ceil(result.total / parseInt(nombreParPage.value));
        users.value = result.documents
        total.value = result.total
        page.value = result.page > paginationSize.value ? paginationSize.value: result.page
        loading.value = false
        actionUtilisateur.value = false}, () => {loading.value = false} );
    }

  /**
   * envoie sur le composant de modification d'utilisateur
   * @param event ici le click sur le bouton
   * @param id l'identifiant de l'utilisateur sélectionné
   */
  const handleModifier = (event: Event, id: string) => {
    event.stopPropagation()
    actionUtilisateur.value = true
    identifiant.value = id
    let newAction: ActionInterface
    newAction = {action : "edit", id : identifiant }
    action.value = newAction
    navigateTo(`/users/edit/${identifiant.value}`)
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
    actionUtilisateur.value = true
    message.value = "modification OK"
    navigateTo('/users/add')
  }

  /**
   * Affiche un message dans un snackbar lors de la fermeture d'un dialog
   * @param messageAfficher message à afficher
   */
  const closeAction = (messageAfficher : string) => {
    if (messageAfficher) {
      actionUtilisateur.value = false
      open.value = true
      message.value = messageAfficher
    }
    else {
      actionUtilisateur.value = false
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

</script>

<style scoped>

</style>