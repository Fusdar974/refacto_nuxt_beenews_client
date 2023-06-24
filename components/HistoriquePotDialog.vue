<template>
  <v-dialog v-model="openComputed" class="v-container" width="auto">
    <v-card v-if="commande !== null">
      <v-card-title>Détail commande</v-card-title>
      <v-container>
        <v-row>
          <v-col sm="3">Date:</v-col>
          <v-col sm="9">{{ new Date(commande.date).toLocaleString() }}</v-col>
          <v-col sm="3">Nom:</v-col>
          <v-col sm="9">{{ commande.nom }}</v-col>
        </v-row>
        <v-row v-if="commande.historique?.length > 0">
          <v-col sm="12">Articles</v-col>
          <ligne-article v-if="commande.historique" :items="commande.historique"/>
          <v-divider/>
        </v-row>
        <v-row>
          <v-col sm="12">Paiement</v-col>
        </v-row>
        <v-row v-if="commande.paiementCompte && commande.paiementCompte > 0">
          <v-col sm="6">Compte</v-col>
          <v-col sm="6">{{commande.paiementCompte}} BN</v-col>
        </v-row>
        <v-row v-if="commande.paiementEspece  && commande.paiementEspece > 0">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementEspece}} €</v-col>
        </v-row>
        <v-row v-if="commande.paiementCheque  && commande.paiementCheque > 0">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementCheque}} €</v-col>
        </v-row>
        <v-row v-if="commande.paiementVirement  && commande.paiementVirement > 0">
          <v-col sm="6">Espèce</v-col>
          <v-col sm="6">{{commande.paiementVirement}} €</v-col>
        </v-row>
        <v-row>
          <v-col sm="6">Monnaie rendue</v-col>
          <v-col sm="6">{{commande.rendreMonnaie}} €</v-col>
        </v-row>
      </v-container>
      <v-card-actions class="justify-end">
        <v-btn @click="openComputed = false" color="primary">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">

import HistoriqueLigneInterface from "~/interfaces/HistoriqueLigneInterface";

/** REFS */

interface PropsInterface {
    commande: HistoriqueLigneInterface
    openDialog: boolean
}

const props = defineProps<PropsInterface>()

/** EMITS */

const emits = defineEmits(['update:openDialog'])

/** COMPUTEDS */

const openComputed = computed({
    get: () => props.openDialog,
    set: (newValueOpen) => emits('update:openDialog', newValueOpen)
})

</script>

<style scoped>

</style>