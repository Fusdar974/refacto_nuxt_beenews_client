<template>
  <div>
    <h2> {{ titre }} </h2 >
    <v-form v-if="user" :disabled="mode === SHOW">
      <v-text-field v-model="user.nom" type="text" label="nom" :rules="[v => !!v || 'Veuillez rentrer un nom']"/>
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
                  color="red"
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
    <div>
      <v-btn v-if="mode === SHOW" color="primary" class="ma-1" variant="outlined" key="edit" @click="retourModifier">Modifier</v-btn>
      <v-btn v-if="mode === EDIT" color="primary" class="ma-1" variant="outlined" key="edit" @click="modifier">Valider</v-btn>
      <v-btn v-if="mode === CREATE" color="primary" class="ma-1" variant="outlined" key="create" @click="creer">Créer</v-btn>
      <v-btn color="primary" class="ma-1" variant="outlined" key="create" @click="fermer">Fermer</v-btn>
    </div>
    <v-snackbar v-if="openSnack" v-model="openSnack" timeout="4000"><v-alert :type="severity">{{messageSnack}}</v-alert></v-snackbar>
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
  import router from "#app/plugins/router";

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
  const severity: Ref<string> = ref("")

  const props = defineProps({
    userId: {type: String},
    action: {type: String, required: true},
  })

  //const emits = defineEmits(['update:modelValue', "message"])

  const fermer = (messageAfficher: string) => {
    if (messageAfficher) {
      //emits("message", messageAfficher)
    }
    navigateTo('/users')
  }

  /*export default {
    setup () {
      return { v$: useVuelidate() }
    },
    data () {
      return {
        firstName: '',
        lastName: '',
        contact: {
          email: ''
        }
      }
    },
    validations () {
      return {
        firstName: { required }, // Matches this.firstName
        lastName: { required }, // Matches this.lastName
        contact: {
          email: { required, email } // Matches this.contact.email
        }
      }
    }
  }*/

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
      Fetch.requete({ url: '/users/create', method: 'POST', data: { newUser } }, () => {
        fermer('Création OK')
        open.value = false
      });
    }
  }

  const modifier = () => {
    if (user !== null){
      const newUser = user.value /* apparement pas utilisé */
      newUser!.profils = newUser!.profils.filter(item => item.isValid) /* ! ou ? */
      Fetch.requete({ url: `/users/${user.value!._id}`, data: { newUser }, method: 'PUT' }, () => {
        fermer('Modification OK');
      });
    }

  }

  const envoyerNouveauPwdDefaut = () => {
    Fetch.requete({
      url: `/users/passwordDefault/${user.value!._id}`,
      method: 'POST',
    }, (reussite: PasswordChangeResponseInterface) => {

      if (reussite.data === 'ok') {
          severity.value = "success"
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
        severity.value = "success"
        open.value = false
            openSnack.value = true
            messageSnack.value = 'Mot de passe remis à zéro'
      } else {
        severity.value = "error"
          erreurMail.value = true
          open.value = false
          openSnack.value = true
          messageSnack.value = 'Veuillez saisir une bonne adresse email'
      }
    });
  }

</script>

<style scoped>

</style>