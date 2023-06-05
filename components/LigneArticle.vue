<template>
  <v-container>
    <v-row>
      <v-col key="nom" sm="6">Nom</v-col>
      <v-col key="qte" sm="2">Qté</v-col>
      <v-col key="prix" sm="2">Prix</v-col>
      <v-col key="total" sm="2">Total</v-col>
    </v-row>
    <v-row v-for="(item, index) in items">
      <v-col :key="`nom_${index}`" sm="6">{{item.nom}}</v-col>
      <v-col :key="`qte_${index}`" sm="2">{{item.quantite}}</v-col>
      <v-col :key="`prix_${index}`" sm="2">{{item.prix === 0 ? item.prixEuros + " €" : item.prix + " BN"}}</v-col>
      <v-col :key="`total${index}`" sm="2">{{item.prix === 0 ? item.prixEuros * item.quantite : item.prix * item.quantite}}</v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import HistoriqueDetailInterface from "~/interfaces/historiqueInterfaces/HistoriqueDetailInterface";

const props = defineProps({
  items: {type: Object as () => Array<HistoriqueDetailInterface>, required: true},
})

</script>

<style scoped>

</style>