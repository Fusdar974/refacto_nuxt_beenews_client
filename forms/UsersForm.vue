<template>
  <div>
    <h2> {{ titre }} </h2 >
    <v-form v-if="user" :disabled="mode === SHOW">
      <v-text-field v-model="user.nom" type="text" label="nom" :rules="[v => !!v || 'Veuillez rentrer un nom']" required/>
      <v-text-field type="text" label="prenom" v-model="user.prenom" :rules="[v => !!v || 'Veuillez rentrer un prénom']"/>
      <v-text-field type="text" label="surnom" v-model="user.surnom"/>
      <v-text-field type="text" label="mail" v-model="user.mail" :error="erreurMail.value" :rules="[v => !!v || 'Veuillez rentrer un mail']"/>
      <div v-if="mode === EDIT">
        <v-btn @click="demandeConfirmation" variant="outlined" color="primary">Envoyer nouveau mot de passe</v-btn>
        <v-btn @click="demandeConfirmationDefaut" variant="outlined" color="primary">Mot de passe par défaut</v-btn>
      </div>
      <h4>Profils</h4>
      <div v-for="(profil, index) in user.profils" :key="index" >
        <v-checkbox
            :label="profil.nom"
            v-model="profil.isValid"
            ></v-checkbox>
      </div>
      <v-checkbox label="Compte désactivé"
                  v-model="user.isDesactive"
                  ></v-checkbox>
    </v-form>
    <historique-client v-if="userId" :user-id="userId" type="SOUM"></historique-client>
    <historique-client v-if="userId" :user-id="userId" type="POT"></historique-client>
    <ModalConfirmation v-model="open"
                       @confirmer="envoyerNouveauPwd"
                       titre="Envoyer nouveau mot de passe"
                       question="Voulez-vous envoyer un mot de passe ?"
    />
    <ModalConfirmation v-model="openDefault"
                       @confirmer="envoyerNouveauPwdDefaut"
                       titre="Remise à zéro du mot de passe"
                       question="Voulez-vous mettre le mot de passe par défaut ?"
    />

<!--

          {mode === this.EDIT &&
          <React.Fragment>
            <Button onClick={demandeConfirmation} variant="contained" color="primary">Envoyer nouveau mot de passe</Button>
            <Button onClick={demandeConfirmationDefaut} variant="contained" color="primary">Mot de passe par défaut</Button>
          </React.Fragment>
          }
        </td>
      </tr>

      <tr>
        <td>
          <span>Compte desactivé</span>
        </td>
        <td>
          <Checkbox
              type="checkbox"
              value={user.isDesactive}
              disabled={mode === this.SHOW}
          onChange={desactiverCompte}
          checked={user.isDesactive} />
        </td>
      </tr>
      </tbody>
    </table>


    {
    user._id &&
    <React.Fragment>
      <HistoriqueClient userId={user._id} type="SOUM" />
      <HistoriqueClient userId={user._id} type="POT" />
    </React.Fragment>
    }

    {
    open &&
    <ModalConfirmation
        handleClose={handleClose}
        confirmer={envoyerNouveauPwd}
        open={open}
        titre={"Envoyer nouveau mot de passe"}
    question={"Voulez-vous envoyer un mot de passe"}
    />
    }

    {
    openDefaut &&

    <ModalConfirmation
        handleClose={handleCloseDefaut}
        confirmer={envoyerNouveauPwdDefaut}
        open={openDefaut}
        titre={"Remise à zéro du mot de passe"}
    question={"Voulez-vous mettre le mot de passe par défaut ?"}
    />

    }

    {
    openSnack &&
    <Snackbar
        autoHideDuration={4000}
        onClose={this.handleCloseSnack}
        open={openSnack}
    >
      <Alert onClose={this.handleCloseSnack} severity={this.state.severity}>{messageSnack}</Alert>
    </Snackbar>

    }

    <div>
      {this.getBouton()}
    </div>-->
  </div >
</template>

<script setup lang="ts">

  import UserInterface from "~/interfaces/UserInterface";
  import Fetch from "~/services/FetchService";
  import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
  import PasswordChangeResponseInterface from "~/interfaces/PasswordChangeResponseInterface";
  import ProfilInterface from "~/interfaces/ProfilInterface";
  import UserResponseInterface from "~/interfaces/UserResponseInterface";
  import ProfilsResponseInterface from "~/interfaces/ProfilsResponseInterface";

  const SHOW ='show'
  const EDIT = 'edit';
  const CREATE = 'create';
  const user: Ref<UserInterface | null> = ref(null)
  const open: Ref<boolean> = ref(false)
  const openDefault: Ref<boolean> = ref(false)
  const openSnack: Ref<boolean> = ref(false)
  const erreurMail: Ref<boolean> = ref(false)
  const messageSnack: Ref<string> = ref("")
  const mode: Ref<string> = ref("")
  const titre: Ref<string> = ref("Aucun titre")

  const props = defineProps({
    userId: {type: String},
    action: {type: String, required: true},
  })

  const fermer = (messageAfficher: string) => {
    if (messageAfficher) {
      onUnmounted(() => {

      })
    }
  }

  onBeforeMount(() => {
    let title: string;
    switch (props.action) {
      case 'show':
        title = "Informations client"
        mode.value = SHOW;
        break;
      case 'edit':
        title = "Modifier client"
        mode.value = EDIT;
        break;
      case 'add':
        title = "Ajouter client"
        mode.value = CREATE;
        break;
      default:
        title = "Informations client"
        mode.value = SHOW;
        break;
    }
      if (mode.value !== CREATE) {
        Fetch.requete({url: `/users/${props.userId}`, method: 'GET'}, (resultUser: UserResponseInterface) => {
          user.value = resultUser.user
        })

      } else {
        user.value = {
          isDesactive: false,
          nom: "",
          prenom: "",
          surnom: "",
          profils: [],
          mail: "",
          compte: 0,
          password: "",
          supprimable: true,
          _id: "",
        }
        Fetch.requete({ url: `/users/profils`, method: 'POST' }, (profiles: ProfilsResponseInterface) =>{;
        const profilsPossede = user.value!.profils || [];
        const profilsAfficher = profiles.profils.map(item => {
          item.isValid = typeof profilsPossede.find(item2 => item2._id === item._id) !== 'undefined';
          return item;
        })
        user.value!.profils = profilsAfficher;
        })
      }
      titre.value = title
  })

  const retourModifier = () => {
    mode.value = EDIT
  }

  const handleClose = () => {
    open.value = false
  }

  const handleCloseDefaut = () => {
    openDefault.value = false
  }

  const handleCloseSnack = () => {
    openSnack.value = false
  }

  const demandeConfirmation = () => {
    open.value = true
  }

  const demandeConfirmationDefaut = () => {
    openDefault.value = true
    open.value = false
  }

  const creer = () => {
    if (user !== null){
      const newUser = user.value;
      newUser!.profils = user.value!.profils.filter(item => item.isValid)
      Fetch.requete({ url: '/users/create', method: 'POST', data: { user } }, () => {
        fermer('Création OK')
        open.value = false
      });
    }
  }

  const modifier = () => {
    if (user !== null){
      const newUser = user.value /* apparement pas utilisé */
      user.value!.profils = user.value!.profils.filter(item => item.isValid) /* ! ou ? */
      Fetch.requete({ url: `/users/${user.value!._id}`, data: { user }, method: 'PUT' }, () => {
        fermer('Modification OK');
      });
    }

  }

  const deselectionnerDroit = (valeur : number) => {
    let droit = user.value!.profils.find(item => item._id === valeur);
    droit!.isValid = !droit!.isValid;
  }

  const envoyerNouveauPwdDefaut = () => {
    Fetch.requete({
      url: `/users/passwordDefault/${user.value!._id}`,
      method: 'POST',
    }, (reussite: PasswordChangeResponseInterface) => {

      if (reussite.data === 'ok') {
          open.value = false
          openDefault.value = false
          openSnack.value = true
          messageSnack.value = 'Mot de passe remis à zéro'
      }
    });
  }

  const envoyerNouveauPwd = () => {
    Fetch.requete({
      url: `/users/genererNewPwd/${user.value!._id}`,
      method: 'POST',
      data: {
        mail: user.value!.mail
      }
    }, (reussite: PasswordChangeResponseInterface) => {

      if (reussite.data === 'ok') {
        open.value = false,
            openSnack.value = true
            messageSnack.value = 'Mot de passe remis à zéro'
      } else {
          erreurMail.value = true
          open.value = false,
          openSnack.value = true
          messageSnack.value = 'Veuillez saisir une bonne adresse email'
      }
    });
  }

</script>

<style scoped>

</style>