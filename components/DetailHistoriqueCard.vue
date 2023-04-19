<template>
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
      <v-btn @click="closeFonction" color="primary">Fermer</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import HistoriqueLigneInterface from "~/interfaces/HistoriqueLigneInterface";

const props = defineProps({
  type: {type: String, required: true},
  commande: {type: Object as () => HistoriqueLigneInterface | null, required: true},
  closeFonction: {type: Function},
})
</script>

<style scoped>

</style>