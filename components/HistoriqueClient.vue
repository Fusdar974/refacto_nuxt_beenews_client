<template>
    <v-container class="ma-1">
      <v-row>
        <v-col v-if="historique && historique.length > 0" sm="12">
            <h3>Historique {{ type }}</h3>
              <v-table density="compact">
                <thead>
                  <tr v-if="type === 'SOUM'">
                    <th class="text-center">Date</th>
                    <th class="text-center">Ancien solde</th>
                    <th class="text-center disparaitre">BN crédité(s)</th>
                    <th class="text-center disparaitre">BN débité(s)</th>
                    <th class="text-center">Nouveau Solde</th>
                    <th class="text-center disparaitre">Espece</th>
                    <th class="text-center disparaitre">Chèque</th>
                    <th class="text-center disparaitre">Virement</th>
                    <th class="text-center disparaitre">Monnaie rendue</th>
                    <th class="text-center"></th>
                  </tr>
                  <tr v-else-if="type === 'POT'">
                    <th class="text-center">Date</th>
                    <th class="text-center">Nom</th>
                    <th class="text-center"></th>
                  </tr>
                </thead>
                <tbody v-if="type === 'SOUM'">
                  <tr v-for="(item, index) in historique"
                      :key="`SOUM${index}`"
                      @click="() => afficherDetail(item._id)">
                    <td class="text-center">{{ new Date(item.date).toLocaleString() }}</td>
                    <td class="text-center">{{ item.ancienSolde }}</td>
                    <td class="text-center disparaitre">{{ item.nouveauCredit }}</td>
                    <td class="text-center disparaitre">{{ item.paiementCompte }}</td>
                    <td class="text-center">{{ item.nouveauSolde }}</td>
                    <td class="text-center disparaitre">{{ item.paiementEspece }}</td>
                    <td class="text-center disparaitre">{{ item.paiementCheque }}</td>
                    <td class="text-center disparaitre">{{ item.paiementVirement }}</td>
                    <td class="text-center disparaitre">{{ item.rendreMonnaie }}</td>
                    <td class="text-center"><v-btn icon="mdi:mdi-eye" variant="text"/></td>
                  </tr>
                </tbody>
                <tbody v-if="type === 'POT'">
                  <tr v-for="(item, index) in historique"
                      :key="`POT${index}`"
                      @click="() => afficherDetail(item._id)">
                  <td class="text-center">{{ new Date(item.date).toLocaleString() }}</td>
                  <td class="text-center">{{ item.nom }}</td>
                  <td class="text-center">
                    <div v-if="item.rendreMonnaie < 0">
                      Vous devez {{ item.rendreMonnaie * (-1) }} €
                      <v-btn icon="mdi:mdi-eye" variant="text"/></div>
                    <div v-else>Payé <v-btn icon="mdi:mdi-eye" variant="text"/></div>
                  </td>
                  </tr>
                </tbody>
              </v-table>
            <br />
          <v-pagination v-model="page"
                        :length="paginationSize"
                        prev-icon="mdi:mdi-arrow-left"
                        next-icon="mdi:mdi-arrow-right"/>
        </v-col>
      </v-row>
    </v-container>

  <v-dialog v-model="openDialog" class="v-container">
    <v-card v-if="commande !== null">
      <v-card-title>Détail commande</v-card-title>
      <v-container v-if="type==='SOUM'">
        <v-row>
          <v-col sm="3">Barman</v-col>
          <v-col sm="9">{{commande.barman.nom}} {{commande.barman.prenom}}</v-col>
          <v-col sm="3">Date:</v-col>
          <v-col sm="9">{{ new Date(commande.date).toLocaleString() }}</v-col>
          <v-divider/>
        </v-row>

        <v-row v-if="commande.historique.length > 0">
          <v-col sm="12">Articles</v-col>
          <ligne-article :items="commande.historique"/>
          <v-divider/>
        </v-row>
        <v-row>
          <v-col sm="12">Paiement</v-col>
        </v-row>
        <v-row v-if="commande.paiementCompte">
          <v-col sm="6">Compte</v-col>
          <v-col sm="6">{{commande.paiementCompte}} BN</v-col>
        </v-row>
        <v-row v-if="commande.paiementEspece">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementEspece}} €</v-col>
        </v-row>
        <v-row v-if="commande.paiementCheque">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementCheque}} €</v-col>
        </v-row>
        <v-row v-if="commande.paiementVirement">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementVirement}} €</v-col>
        </v-row>
        <v-row>
          <v-col sm="6">Monnaie rendue</v-col>
          <v-col sm="6">{{commande.rendreMonnaie}} €</v-col>
        </v-row>
        <v-divider/>
        <v-row>
          <v-col sm="6">Ancien solde</v-col>
          <v-col sm="6">{{commande.ancienSolde}} BN</v-col>
        </v-row>
        <v-row>
          <v-col sm="6">Nouveau solde</v-col>
          <v-col sm="6">{{commande.nouveauSolde}} BN</v-col>
        </v-row>
        <v-row v-if="commande.commentaires">
          <v-col sm="6">Commentaires</v-col>
          <v-col sm="6">{{commande.commentaires}}</v-col>
        </v-row>

        <v-row v-if="type==='POT'">
          <v-col sm="3">Date:</v-col>
          <v-col sm="9">{{new Date(commande.date).toLocaleString()}}</v-col>
          <v-col sm="3">Nom:</v-col>
          <v-col sm="9">{{commande.nom}}</v-col>
          <v-col sm="3">Participants:</v-col>
<!--          <v-col sm="9">{{commande.participants.map((value, index) =>
              (<Chip key={index + "participant"} size="small" label={value.nom + " " + value.prenom} />)}}</v-col>-->
<!--          TODO::a modifier après vérification sur l'application en prod, participant n'existe pas dans commande-->
          <v-row v-if="commande.historique.length > 0">
            <v-col sm="12">Articles</v-col>
            <ligne-article :items="commande.historique"/>
            <v-divider/>
          </v-row>
          <v-row>
            <v-col sm="12">Paiement</v-col>
          </v-row>
          <v-row v-if="commande.paiementCompte">
            <v-col sm="6">Compte</v-col>
            <v-col sm="6">{{commande.paiementCompte}} BN</v-col>
          </v-row>
          <v-row v-if="commande.paiementEspece">
            <v-col sm="6">Espèce</v-col>
            <v-col sm="6">{{commande.paiementEspece}} €</v-col>
          </v-row>
          <v-row v-if="commande.paiementCheque">
            <v-col sm="6">Espèce</v-col>
            <v-col sm="6">{{commande.paiementCheque}} €</v-col>
          </v-row>
          <v-row v-if="commande.paiementVirement">
            <v-col sm="6">Espèce</v-col>
            <v-col sm="6">{{commande.paiementVirement}} €</v-col>
          </v-row>
          <v-row>
            <v-col sm="6">Monnaie rendue</v-col>
            <v-col sm="6">{{commande.rendreMonnaie}} €</v-col>
          </v-row>
        </v-row>
      </v-container>
      <v-card-actions class="justify-end">
        <v-btn @click="handleClose" color="primary">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


<!--              <Grid item xs={12}>Paiement</Grid>-->

<!--              {-->
<!--              this.state.commande.paiementCompte > 0 &&-->
<!--              <React.Fragment>-->
<!--                <Grid item xs={6}>Compte</Grid>-->
<!--                <Grid item xs={6}>{this.state.commande.paiementCompte} BN</Grid>-->
<!--              </React.Fragment>-->
<!--              }-->

<!--              {-->
<!--              this.state.commande.paiementEspece > 0 &&-->
<!--              <React.Fragment>-->
<!--                <Grid item xs={6}>Espèce</Grid>-->
<!--                <Grid item xs={6}>{this.state.commande.paiementEspece} €</Grid>-->
<!--              </React.Fragment>-->
<!--              }-->

<!--              {-->
<!--              this.state.commande.paiementCheque > 0 &&-->
<!--              <React.Fragment>-->
<!--                <Grid item xs={6}>Chèque</Grid>-->
<!--                <Grid item xs={6}>{this.state.commande.paiementCheque} €</Grid>-->
<!--              </React.Fragment>-->
<!--              }-->

<!--              {-->
<!--              this.state.commande.paiementVirement > 0 &&-->
<!--              <React.Fragment>-->
<!--                <Grid item xs={6}>Virement</Grid>-->
<!--                <Grid item xs={6}>{this.state.commande.paiementVirement} €</Grid>-->
<!--              </React.Fragment>-->
<!--              }-->

<!--              <Grid item xs={6}>Monnaie rendue</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.rendreMonnaie} €</Grid>-->

<!--              <Grid item xs={12}><Divider /></Grid>-->


<!--            </React.Fragment>-->
<!--            }-->

<!--            <Grid item xs={6}>Ancien solde</Grid>-->
<!--            <Grid item xs={6}>{this.state.commande.ancienSolde} BN</Grid>-->

<!--            <Grid item xs={6}>Nouveau solde</Grid>-->
<!--            <Grid item xs={6}>{this.state.commande.nouveauSolde} BN</Grid>-->

<!--            {this.state.commande.commentaires &&-->
<!--            <React.Fragment>-->
<!--              <Grid item xs={6}>Commentaires</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.commentaires}</Grid>-->
<!--            </React.Fragment>-->
<!--            }-->
<!--          </React.Fragment>-->
<!--          }-->

<!--          {-->
<!--          type === 'POT' &&-->
<!--          <React.Fragment>-->
<!--            <Grid item xs={3}>Date:</Grid>-->
<!--            <Grid item xs={9}> {new Date(this.state.commande.date).toLocaleString()}</Grid>-->

<!--            <Grid item xs={3}>Nom:</Grid>-->
<!--            <Grid item xs={9}> {this.state.commande.nom}</Grid>-->

<!--            <Grid item xs={12} md={3}>Participants:</Grid>-->
<!--            <Grid item xs={12} md={9}> {-->
<!--              this.state.commande.participants.map((value, index) => (-->
<!--              <Chip key={index + "participant"} size="small" label={value.nom + " " + value.prenom} />-->
<!--              ))-->
<!--              }</Grid>-->

<!--            {this.state.commande.historique.length > 0 &&-->
<!--            <React.Fragment>-->
<!--              <Grid item xs={12}><Divider /></Grid>-->
<!--              <Grid item xs={12}>Articles</Grid>-->
<!--              <Grid item xs={12}><Divider /></Grid>-->
<!--              {-->
<!--              getLigneArticle(this.state.commande.historique)-->
<!--              }-->
<!--            </React.Fragment>-->
<!--            }-->
<!--            {this.state.commande.rendreMonnaie >= 0 &&-->
<!--            <React.Fragment>-->

<!--              <Grid item xs={12}><Divider /></Grid>-->

<!--              <Grid item xs={6}>Espèce</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.paiementEspece} €</Grid>-->

<!--              <Grid item xs={6}>Chèque</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.paiementCheque} €</Grid>-->

<!--              <Grid item xs={6}>Virement</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.paiementVirement} €</Grid>-->

<!--              <Grid item xs={6}>Monnaie rendue</Grid>-->
<!--              <Grid item xs={6}>{this.state.commande.rendreMonnaie} €</Grid>-->
<!--            </React.Fragment>-->
<!--            }-->
<!--          </React.Fragment>-->

<!--          }-->
<!--        </Grid>-->
<!--      </DialogContent>-->
<!--      <DialogActions>-->
<!--        <Button onClick={handleClose} color="primary">Fermer</Button>-->
<!--      </DialogActions>-->
<!--    </Dialog>-->
<!--    }-->
</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService";
import {onMounted, watch} from "#imports";
import HistoriqueInterface from "~/interfaces/HistoriqueInterface";
import HistoriqueLigneInterface from "~/interfaces/HistoriqueLigneInterface";
import HistoriqueLigneResponseInterface from "~/interfaces/HistoriqueLigneResponseInterface";
import LigneArticle from "~/components/LigneArticle.vue";

const loading: Ref<boolean>  = ref(true)
const openDialog: Ref<boolean> = ref(false)
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)
const historique: Ref<Array<HistoriqueLigneInterface> | null> = ref(null)
const commande: Ref<HistoriqueLigneInterface | null> = ref(null)

const props = defineProps({
  userId: {type: String, required: true},
  type: {type: String, required: true},
})

const setHistorique = (histo: HistoriqueInterface) =>{
  page.value = histo.page
  nombreParPage.value = histo.nombre
  total.value = histo.count
  historique.value = histo.histo
  paginationSize.value = Math.ceil(histo.count / histo.nombre)
}

const majUser = () => {
  Fetch.requete(
      {
        url:`/users/historique/${props.type}/${props.userId}?page=${page.value}`,
        data: { page: page.value },
        method: 'GET',
      },
      setHistorique)
}

onMounted(()=>{
  majUser()
})

watch(page, () => majUser())

const afficherDetail = (identifiantHistorique: string) => {
  Fetch.requete({ url: `/historique/${identifiantHistorique}`, method: 'GET' }, (resultat: HistoriqueLigneResponseInterface) => {
    commande.value = resultat.doc
    openDialog.value = true
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

@media (max-width: 500px){
  .disparaitre {
    display: none !important;
  }
}

th{
  font-weight: bold !important;
}

</style>