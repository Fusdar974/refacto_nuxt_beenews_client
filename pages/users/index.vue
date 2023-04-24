<template>
  <private-route>
    <div v-if="!actionUtilisateur">
        <v-container class="maxW800 align-center align-content-lg-space-between ma-3">
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
          <div v-if="!loading" class="maxW800" >
            <v-table density="comfortable">
              <thead>
              <tr>
                <th class="align-center">Nom</th>
                <th class="align-center">Prenom</th>
                <th class="align-center">BN</th>
                <th class="align-center">Profils</th>
                <th class="align-center">Actions</th>
              </tr>
              </thead>
              <tbody v-if="users !== null">
                <tr v-for="(user, index) in users"
                    :key="index">
                  <td class="align-center">
                    <v-icon v-if="user.isDesactive" icon="mdi:mdi_small" color="red"/>
                    {{user.nom}}
                  </td>
                  <td class="align-center">{{user.prenom}}</td>
                  <td class="align-center">{{user.compte}}</td>
                  <td class="align-center">{{user.profils.map(item => item.nom).join(',')}}</td>
                  <td class="align-center">
                    <v-btn-group variant="tonal">
                      <v-btn @click="modifier(user._id)"><v-icon icon="mdi mdi_small mdi-pencil"></v-icon></v-btn>
                      <v-btn v-if="user.supprimable" @click="supprimer(user._id)"><v-icon icon="mdi mdi_small mdi-delete"></v-icon></v-btn>
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
                            @confirmer="confirmerSuppression">
        </modal-confirmation>
      </div>


<!--    {actionUtilisateur && <ActionsUsers onClose={this.closeAction} params={this.state.action} />}-->
<!--    <Snackbar-->
<!--        autoHideDuration={1000}-->
<!--        onClose={this.handleClose}-->
<!--        open={open}-->
<!--    >-->
<!--      <Alert onClose={this.handleClose} severity="success">{message}</Alert>-->
<!--    </Snackbar>-->

<!--    {-->
<!--    openDialog && <ModalConfirmation-->
<!--      handleClose={handleCloseSupprimer}-->
<!--      confirmer={confirmerSuppression}-->
<!--      open={openDialog}-->
<!--      titre={"Confirmation de suppression"} question={"Voulez vous supprimer cet utilisateur ?"} />-->
<!--    }-->

<!--    </div >-->
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
  const vertical: Ref<string> = ref('top')
  const horizontal: Ref<string> = ref('center')
  const open: Ref<boolean> = ref(false)
  const openDialog: Ref<boolean> = ref(false)
  const actionUtilisateur: Ref<boolean> = ref(false)
  const action: Ref<string> = ref("")
  const identifiant: Ref<any> = ref("")
  const identifiantASupp: Ref<string> = ref("")
  const champRecherche: Ref<string> = ref("")
  const message: Ref<string> = ref("")

  const champRechercheRef =  ref()

  const props = defineProps({
    authenticate: Boolean,
  })

  const setUsers = (usersP : UsersResponseInterface) => {
    paginationSize.value = Math.ceil(usersP.total / parseInt(nombreParPage.value));
    users.value = usersP.documents
    total.value = usersP.total
    page.value = usersP.page > paginationSize.value ? paginationSize.value: usersP.page
    loading.value = false
    actionUtilisateur.value = false
  }
    // const obtenirRecheche =() => {
    //   let retour = "";
    //   try {
    //     retour = champRecherche.value;
    //   }
    //   catch (err) {
    //     retour = "";
    //   }
    //   return retour;
    // }

    const recharger = () => {
      Fetch.requete({ url: '/users', data: { page: page.value, nombre: nombreParPage.value ,recherche: champRecherche.value } }, setUsers);
    }

  const modifier = (identifiant: any) => {
    actionUtilisateur.value = true
    action.value = "edit"
    identifiant.value = identifiant
  }

  const supprimer = (identifiant: string) => {
    openDialog.value = true
    identifiantASupp.value =  identifiant
  }

  const consulter = (identifiant : any) => {
    actionUtilisateur.value = true
    action.value = "show"
    identifiant.value = identifiant
  }

  const ajouter = () => {
    actionUtilisateur.value = true
    action.value = "add"
    identifiant.value = identifiant
  }

  onMounted(()=>{
    const chaineDecoupe = location.pathname.split('/');
    if (chaineDecoupe.length >= 3) {
      const [, , action, identifiant] = chaineDecoupe;
      switch (action) {
        case "show": consulter(identifiant); break;
        case "edit": modifier(identifiant); break;
        case "add": ajouter(); break;
        default:
          recharger();
      }
    } else {
      recharger();
    }
  })

  watch(page, () => recharger())
  watch(nombreParPage, () => recharger())
  watch(champRecherche, () => recharger())

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

  const handleClose = (reason : string) => {
    if (reason === 'clickaway') {
      return;
    }
    open.value = false
  }

  const confirmerSuppression = () => {
    Fetch.requete({ url: `/users/${identifiantASupp.value}`, method: 'DELETE' }, () => {
      closeAction('SUPPRESSION ok');
      openDialog.value = false
    });
  }

  const recherche = () => {
    recharger();
  }

  const handleChangeSelect = (e: any) => {
    const valeur = e.target;
      nombreParPage.value = valeur.value;
      return { nombreParPage: valeur.value, loading: true }
  }

</script>

<style scoped>

</style>