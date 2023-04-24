<template>
  <div>
    <h2> {title} </h2 >
    <v-form v-if="mode === SHOW">
      <v-text-field v-model="user" type="text" readonly label="nom"/>
      <v-text-field type="text" readonly label="prenom" v-model="user.prenom" />
      <v-text-field type="text" readonly label="surnom" v-model="user.surnom"/>
      <v-text-field type="text" readonly label="mail" v-model="user.mail" :error="erreurMail.value"/>
      <div v-for="(profil, index) in user.profils" :key="index" >
        <v-checkbox
            type="checkbox"
            :label="profil.value"
            @change="deselectionnerDroit(profil.value)"
            disabled/>
      </div>
      <span>Profils</span>
      <v-checkbox type="checkbox"
                  label="Compte désactivé"
                  v-model="user.value.isDesactive"
                  disabled/>
    </v-form>
    <v-form v-else>
      <v-text-field v-model="user" type="text"  label="nom"/>
      <v-text-field type="text" label="prenom" v-model="user.prenom" />
      <v-text-field type="text" label="surnom" v-model="user.surnom"/>
      <v-text-field type="text" label="mail" v-model="user.mail" :error="erreurMail.value"/>
      <div v-for="(profil, index) in user.profils" :key="index" >
        <v-checkbox
            type="checkbox"
            :label="profil.value"
            @change="deselectionnerDroit(profil.value)"
            />
      </div>
      <span>Profils</span>
      <v-checkbox type="checkbox"
                  label="Compte désactivé"
                  v-model="user.value.isDesactive"
                  />
    </v-form>

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
          <span>Profils</span>
        </td>
        <td>
          {
          user.profils.map((item) => (
          <div key={item._id}>{item.nom}
            <Checkbox
                type="checkbox"
                key={item._id}
                value={item._id}
                disabled={mode === this.SHOW}
            onChange={() => desectionnerDroit(item._id)}
            checked={item.isValid} />
          </div>
          ))
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
    userId: {type: String, required: true},
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
        mode.value= SHOW;
        break;
    }
      if (mode.value !== CREATE) {
        Fetch.requete({ url: `/users/${props.userId}`, method: 'GET' }, user);
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
      const newUser = user.value
      user.value!.profils = user.value!.profils.filter(item => item.isValid)
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
          open.value = false,
          openDefault.value = false,
          openSnack.value = true,
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
            openSnack.value = true,
            messageSnack.value = 'Mot de passe remis à zéro'
      } else {
          erreurMail.value = true,
          open.value = false,
          openSnack.value = true,
          messageSnack.value = 'Veuillez saisir une bonne adresse email'
      }
    });
  }

  const desactiverCompte = () => {
    if(user.value!.isDesactive === true){
      user.value!.isDesactive = false
    }
    else{
      user.value!.isDesactive = true
    }
  }
</script>

<style scoped>

</style>