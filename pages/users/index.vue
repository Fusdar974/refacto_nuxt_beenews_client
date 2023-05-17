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
                       @click="navigateTo('/users/add')">Créer</v-btn>
              </v-col>
            </v-row>
          </v-row>
        </v-container>
          <div v-if="!loading" class="maxW1000" >
            <generic-table :objects="users"
                           :attributes="attributes"
                           :actions-td="true"
                           v-model:page-size="paginationSize"
                           v-model:page="page"
                           v-model:nb-par-page="nombreParPage">
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
        <modal-confirmation v-model="openDialogConfirmationSuppression"
                            :titre="'Confirmation de suppression'"
                            :question="'Voulez vous supprimer cet utilisateur ?'"
                            @confirmer="handleConfirmerSuppression">
        </modal-confirmation>
      </div>
  </private-route>
</template>

<script setup lang="ts">

import UserInterface from "~/interfaces/UserInterface";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import AttributeInterface from "~/interfaces/AttributeInterface";
import GenericTable from "~/components/GenericTable.vue";
import Fetch from "~/services/FetchService";
import {watch} from "#imports";
import {storeToRefs} from "pinia";
import {useMenuStore} from "~/stores/menuStore";
import {useSnackbarStore} from "~/stores/snackbarStore";

const loading: Ref<boolean> = ref(false)
const users: Ref<Array<UserInterface>> = ref([])
const nombreParPage: Ref<string> = ref('10')
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)
const openDialogConfirmationSuppression: Ref<boolean> = ref(false)
const identifiantASupp: Ref<string> = ref("")
const champRecherche: Ref<string> = ref("")

const attributes: Ref<Array<AttributeInterface>> = ref([{header: 'Nom', attr:'nom',},
    {header: 'Prenom', attr: 'prenom'}, {header: 'BN', attr: 'compte'}, {header: 'Profils', attr: 'profils.nom'}] as Array<AttributeInterface>)


  const {
      open: snackbarStoreOpen,
      message: snackbarStoreMessage,
  } = storeToRefs(useSnackbarStore())

  const {titleAppBar} = storeToRefs(useMenuStore())
  titleAppBar.value = 'Clients'

  watch(page, () => recharger())
  watch(nombreParPage, () => recharger())
  watch(champRecherche, () => recharger())

  /**
   * recharge la liste des utilisateurs lorsque la page est montée dans le DOM
   */
  onMounted(()=>{
    recharger();
  })

  /**
   * Recharge la liste des utilisateurs  en envoyant une requète http vers le back,
   * en cas de réponse positive : les données sont mises à jour ainsi que la pagination
   */
    const recharger = () => {
      loading.value = true
      Fetch.requete({
          url: '/users',
          data: { page: page.value, nombre: nombreParPage.value ,recherche: champRecherche.value }
      }, (result : UsersResponseInterface) => {
        paginationSize.value = Math.ceil(result.total / parseInt(nombreParPage.value));
        users.value = result.documents
        total.value = result.total
        page.value = result.page > paginationSize.value ? paginationSize.value: result.page
        loading.value = false
      }, () => {loading.value = false} );
    }

/**
 * envoie sur le composant de modification d'utilisateur
 * @param event evenement du click sur le bouton
 * @param id l'identifiant de l'utilisateur sélectionné
 */
const handleModifier = (event: Event, id: string | undefined) => {
    event.stopPropagation() // empèche le déclenchement d'un autre event (show)
    if (id) {
        navigateTo(`/users/edit/${id}`)
    }
}

/**
 * Active le dialog de confirmation de suppression de client
 * @param event evenement du click sur le bouton
 * @param id l'identifiant de l'utilisateur sélectionné
 */
const handleSupprimer = (event: Event, id: string | undefined) => {
    event.stopPropagation()
    if (id) {
        openDialogConfirmationSuppression.value = true
        identifiantASupp.value = id
    }
}

  /**
   * Supprime l'utilisateur , affiche un message de confirmation dans une snackbar et ferme le dialog
   */
  const handleConfirmerSuppression = () => {
    Fetch.requete({ url: `/users/${identifiantASupp.value}`, method: 'DELETE' }, () => {
        snackbarStoreOpen.value = true
        snackbarStoreMessage.value = 'Suppression OK'
        recharger();
        openDialogConfirmationSuppression.value = false
    })
  }

</script>

<style scoped>

</style>