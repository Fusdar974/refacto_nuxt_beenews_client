<template>
  <private-route>
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
                   @click="navigateTo('/users/add')">Créer</v-btn>
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
                 @click="navigateTo('/users/add')">Créer</v-btn>
        </v-row>
      </v-container>
          <div v-if="!loading" >
            <generic-table :objects="users"
                           :attributes="attributesComputed"
                           :actions-td="true"
                           v-model:pagination-size="paginationSize"
                           v-model:page="page"
                           v-model:nb-par-page="nombreParPage"
                           @consulter="(_id) => navigateTo(`users/show/${_id}`)">
                <template v-slot:default="slotProps">
                    <td>
                        <v-btn-group variant="tonal">
                            <v-btn @click="handleModifier($event,slotProps.obj._id)" class="ma-1">
                                <v-icon icon="mdi mdi_small mdi-pencil"></v-icon>
                            </v-btn>
                            <v-btn v-if="(slotProps.obj as UserInterface).isArchived"
                                   @click="handleSupprimer($event, slotProps.obj._id)" class="ma-1">
                                <v-icon icon="mdi mdi_small mdi-delete"></v-icon>
                            </v-btn>
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

import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import AttributeInterface from "~/interfaces/AttributeInterface";
import GenericTable from "~/components/GenericTable.vue";
import Fetch from "~/services/FetchService";
import {watch} from "#imports";
import {storeToRefs} from "pinia";
import {useMenuStore} from "~/stores/menuStore";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {useDisplay} from "vuetify";
import {Ref} from "vue";
import ResponseListInterface from "~/interfaces/ResponseListInterface";

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
    {header: 'Prenom', attr: 'prenom'}, {header: 'BN', attr: 'compte'}] as Array<AttributeInterface>)
const attributesMdandUp: Ref<Array<AttributeInterface>> = ref([{header: 'Nom', attr:'nom',},
    {header: 'Prenom', attr: 'prenom'}, {header: 'BN', attr: 'compte'}, {header: "Profils", attr: "profils.nom"}] as Array<AttributeInterface>)

const {mdAndUp} = useDisplay()

  const {
      open: snackbarStoreOpen,
      message: snackbarStoreMessage,
  } = storeToRefs(useSnackbarStore())

  const {titleAppBar} = storeToRefs(useMenuStore())
  titleAppBar.value = 'Clients'

/**
 * Liste d'attributs à afficher en fonction de la taille de l'écran
 */
const attributesComputed = computed(() => mdAndUp.value ? attributesMdandUp.value : attributes.value)

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
          method: 'GET',
          data: { page: page.value, limit: nombreParPage.value, search: champRecherche.value}
      }, (result: ResponseListInterface<UserInterface>) => {
          paginationSize.value = Math.ceil(result.total / parseInt(nombreParPage.value));
          users.value = result.documents
          total.value = result.total
          page.value = result.page > paginationSize.value ? paginationSize.value : result.page
          loading.value = false
      }, () => {
          loading.value = false
      });
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