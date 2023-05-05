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
            <v-table density="comfortable" hover>
              <thead>
              <tr>
                <th class="align-center">Nom</th>
                <th class="align-center">Prenom</th>
                <th class="align-center">BN</th>
                <th class="align-center hidden-md-and-down">Profils</th>
                <th class="align-center">Actions</th>
              </tr>
              </thead>
              <tbody v-if="users !== null">
                <tr v-for="(user, index) in users"
                    :key="index" @click="consulter(user._id)">
                  <td class="align-center">
                    <v-icon v-if="user.isDesactive" icon="mdi:mdi_small" color="red"/>
                    {{user.nom}}
                  </td>
                  <td class="align-center">{{user.prenom}}</td>
                  <td class="align-center">{{user.compte}}</td>
                  <td class="align-center hidden-md-and-down">{{user.profils.map(item => item.nom).join(',')}}</td>
                  <td class="align-center">
                    <v-btn-group variant="tonal">
                      <v-btn @click="handleModifier($event,user._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-pencil"></v-icon></v-btn>
                      <v-btn v-if="user.supprimable" @click="handleSupprimer($event, user._id)" class="ma-1"><v-icon icon="mdi mdi_small mdi-delete"></v-icon></v-btn>
                    </v-btn-group>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-pagination v-if="nombreParPage !== 'all'"
                          v-model="page"
                          :length="paginationSize"
                          prev-icon="mdi:mdi-arrow-left"
                          next-icon="mdi:mdi-arrow-right"/>
            <v-select v-model="nombreParPage"
                      @change="handleChangeSelect"
                      :items="[
                          {value:'10', title: '10'},
                          {value:'20', title: '20'},
                          {value:'30', title: '30'},
                          {value:'all', title: 'Tous'},
                          ]"
                      item-title="title"
                      item-value="value"/>

          </div>
        <v-container v-if="loading" class="align-center">
          <v-row>
              <v-col>
                  <v-progress-circular model-value="20"></v-progress-circular>
              </v-col>
          </v-row>
            <v-col>Chargement...</v-col>
            {{recharger}}
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
  import {no} from "vuetify/locale";
  import {watch} from "#imports";

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
   * envoie sur le composant de consultation d'utilisateur
   * @param id l'identifiant de l'utilisateur sélectionné
   */
  const consulter = (id : string) => {
    actionUtilisateur.value = true
    let newAction: ActionInterface
    newAction = {action : "edit", id : identifiant }
    action.value = newAction
    identifiant.value = id
    navigateTo(`/users/show/${identifiant.value}`)
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

  /**
   * Change le nombre d'utilisateurs affichés par pages lorsque la valeur du select est modifiée
   * @param e
   */
  const handleChangeSelect = (e: any) => {
    const valeur = e.target;
      nombreParPage.value = valeur.value;
      return { nombreParPage: valeur.value, loading: true }
  }

</script>

<style scoped>

</style>