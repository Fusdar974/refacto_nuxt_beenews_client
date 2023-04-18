<template>
    <v-container class="ma-1">
      <v-row>
        <v-col v-if="historique && historique.length > 0" sm="12">
            <h3>Historique {type}</h3>
              <v-table density="compact">
                <thead>
                  <tr v-if="type === 'SOUM'">
                    <th class="pa-0 text-center">Date</th>
                    <th class="pa-0 text-center">Ancien solde</th>
                    <th class="pa-0 text-center disparaitre">BN crédité(s)</th>
                    <th class="pa-0 text-center disparaitre">BN débité(s)</th>
                    <th class="pa-0 text-center">Nouveau Solde</th>
                    <th class="pa-0 text-center disparaitre">Espece</th>
                    <th class="pa-0 text-center disparaitre">Chèque</th>
                    <th class="pa-0 text-center disparaitre">Virement</th>
                    <th class="pa-0 text-center disparaitre">Monnaie rendue</th>
                    <th class="pa-0 text-center"></th>
                  </tr>
                  <tr v-else-if="type === 'POT'">
                    <th class="pa-0 text-center">Date</th>
                    <th class="pa-0 text-center">Nom</th>
                    <th class="pa-0 text-center"></th>
                  </tr>
                </thead>
                <tbody v-if="type === 'SOUM'">
                  <tr v-for="(item, index) in historique"
                      :key="`SOUM${index}`"
                      @click="() => afficherDetail(item._id)">
                    <td class="pa-0 text-center">{{ new Date(item.date).toLocaleString() }}</td>
                    <td class="pa-0 text-center">{{ item.ancienSolde }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.nouveauCredit }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.paiementCompte }}</td>
                    <td class="pa-0 text-center">{{ item.nouveauSolde }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.paiementEspece }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.paiementCheque }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.paiementVirement }}</td>
                    <td class="pa-0 text-center disparaitre">{{ item.rendreMonnaie }}</td>
                    <td class="pa-0 text-center"><v-btn prepend-icon="mdi:mdi-eye"/></td>
                  </tr>
                </tbody>
                <tbody v-if="type === 'POT'">
                  <tr v-for="(item, index) in historique"
                      :key="`POT${index}`"
                      @click="() => afficherDetail(item._id)">
                  <td class="pa-0 text-center">{{ new Date(item.date).toLocaleString() }}</td>
                  <td class="pa-0 text-center">{{ item.nom }}</td>
                  <td class="pa-0 text-center">
                    <div v-if="item.rendreMonnaie < 0">
                      Vous devez {{ item.rendreMonnaie * (-1) }} €
                      <v-btn prepend-icon="mdi:mdi-eye"/></div>
                    <div v-else>Payé <v-btn prepend-icon="mdi:mdi-eye"/></div>
                  </td>
                  </tr>
                </tbody>
              </v-table>
            <br />
          <v-pagination v-model="page"
                        :length="Math.ceil(total / nombreParPage)"/>
<!--            <ButtonGroup>-->
<!--              {this.createLien()}-->
<!--            </ButtonGroup>-->
        </v-col>
      </v-row>
    </v-container>

<!--    {
    openDialog &&
    <Dialog
        open={openDialog}
        onClose={handleClose}
        scroll={"paper"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">Détail commande</DialogTitle>
      <DialogContent dividers={true}>

        <Grid container>

          {type === 'SOUM' &&
          <React.Fragment>

            <Grid item xs={3}>Barman</Grid>
            <Grid item xs={9}>{this.state.commande.barman.nom} {this.state.commande.barman.prenom}</Grid>
            <Grid item xs={3}>Date:</Grid>
            <Grid item xs={9}> {new Date(this.state.commande.date).toLocaleString()}</Grid>
            <Grid item xs={12}><Divider /></Grid>

            {this.state.commande.historique.length > 0 &&
            <React.Fragment>

              <Grid item xs={12}>Articles</Grid>
              {
              getLigneArticle(this.state.commande.historique)
              }

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12}>Paiement</Grid>

              {
              this.state.commande.paiementCompte > 0 &&
              <React.Fragment>
                <Grid item xs={6}>Compte</Grid>
                <Grid item xs={6}>{this.state.commande.paiementCompte} BN</Grid>
              </React.Fragment>
              }

              {
              this.state.commande.paiementEspece > 0 &&
              <React.Fragment>
                <Grid item xs={6}>Espèce</Grid>
                <Grid item xs={6}>{this.state.commande.paiementEspece} €</Grid>
              </React.Fragment>
              }

              {
              this.state.commande.paiementCheque > 0 &&
              <React.Fragment>
                <Grid item xs={6}>Chèque</Grid>
                <Grid item xs={6}>{this.state.commande.paiementCheque} €</Grid>
              </React.Fragment>
              }

              {
              this.state.commande.paiementVirement > 0 &&
              <React.Fragment>
                <Grid item xs={6}>Virement</Grid>
                <Grid item xs={6}>{this.state.commande.paiementVirement} €</Grid>
              </React.Fragment>
              }

              <Grid item xs={6}>Monnaie rendue</Grid>
              <Grid item xs={6}>{this.state.commande.rendreMonnaie} €</Grid>

              <Grid item xs={12}><Divider /></Grid>


            </React.Fragment>
            }

            <Grid item xs={6}>Ancien solde</Grid>
            <Grid item xs={6}>{this.state.commande.ancienSolde} BN</Grid>

            <Grid item xs={6}>Nouveau solde</Grid>
            <Grid item xs={6}>{this.state.commande.nouveauSolde} BN</Grid>

            {this.state.commande.commentaires &&
            <React.Fragment>
              <Grid item xs={6}>Commentaires</Grid>
              <Grid item xs={6}>{this.state.commande.commentaires}</Grid>
            </React.Fragment>
            }
          </React.Fragment>
          }

          {
          type === 'POT' &&
          <React.Fragment>
            <Grid item xs={3}>Date:</Grid>
            <Grid item xs={9}> {new Date(this.state.commande.date).toLocaleString()}</Grid>

            <Grid item xs={3}>Nom:</Grid>
            <Grid item xs={9}> {this.state.commande.nom}</Grid>

            <Grid item xs={12} md={3}>Participants:</Grid>
            <Grid item xs={12} md={9}> {
              this.state.commande.participants.map((value, index) => (
              <Chip key={index + "participant"} size="small" label={value.nom + " " + value.prenom} />
              ))
              }</Grid>

            {this.state.commande.historique.length > 0 &&
            <React.Fragment>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12}>Articles</Grid>
              <Grid item xs={12}><Divider /></Grid>
              {
              getLigneArticle(this.state.commande.historique)
              }
            </React.Fragment>
            }
            {this.state.commande.rendreMonnaie >= 0 &&
            <React.Fragment>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={6}>Espèce</Grid>
              <Grid item xs={6}>{this.state.commande.paiementEspece} €</Grid>

              <Grid item xs={6}>Chèque</Grid>
              <Grid item xs={6}>{this.state.commande.paiementCheque} €</Grid>

              <Grid item xs={6}>Virement</Grid>
              <Grid item xs={6}>{this.state.commande.paiementVirement} €</Grid>

              <Grid item xs={6}>Monnaie rendue</Grid>
              <Grid item xs={6}>{this.state.commande.rendreMonnaie} €</Grid>
            </React.Fragment>
            }
          </React.Fragment>

          }
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Fermer</Button>
      </DialogActions>
    </Dialog>
    }-->
</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService";
import {onMounted} from "#imports";

const loading: Ref<boolean>  = ref(true)
const openDialog: Ref<boolean> = ref(false)
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const historique: Ref<Array<SoumHistoriqueLigne> | null> = ref(null)
const commande: Ref<string> = ref('')

const props = defineProps({
  userId: {type: String, required: true},
  type: {type: String, required: true},
})

interface Historique {
  page: number,
  nombreParPage: number,
  total: number,
  historique: Array<any>,
}

interface SoumHistoriqueLigne{
  ancienSolde: number,
  barman: {
    userId: string,
    nom: string,
    prenom: string,
  },
  nom: string,
  prenom: string,
  userId: string,
  client: string,
  date: string,
  nouveauCredit: number,
  nouveauSolde: number,
  paiementCheque: number,
  paiementCompte: number,
  paiementEspece: number,
  paiementVirement: number,
  rendreMonnaie: string,
  type: string,
  _id: string,
}

const setHistorique = (histo: Historique) =>{
  page.value = histo.page
  nombreParPage.value = histo.nombreParPage
  total.value = histo.total
  historique.value = histo.historique
}

const majUser = (id: string, type: string) => {
  Fetch.requete(
      {
        method: 'GET',
        data: { page: page.value },
        url:`/users/historique/${type}/${id}`
      },
      setHistorique)
}

onMounted(()=>{
  majUser(props.userId, props.type)
})

const afficherDetail = (identifiantHistorique: string) => {
  Fetch.requete({ url: `/historique/${identifiantHistorique}`, method: 'GET' }, resultat => {
    openDialog.value = true
    commande.value = resultat.doc
  })
}

const handleClose = () => {
  openDialog.value = false
}

/**
 * Affiche la page demandée
 */
const afficherPage = (id: number) => {
  loading.value = true
  Fetch.requete({ url: `/users/historique/SOUM/${props.userId}?page=${id}`, method: 'GET' }, setHistorique);
}

</script>

<style scoped>

</style>