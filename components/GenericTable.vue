<template>
  <v-table density="compact">
    <thead>
    <tr>
      <th class="text-center">{{Header1}}</th>
      <th class="text-center">{{Header2}}</th>
      <th class="text-center">{{Header3}}</th>
      <th class="text-center">{{Header4}}</th>
      <th class="text-center">{{Header5}}</th>
      <th class="text-center">{{Header6}}</th>
      <th class="text-center">{{Header7}}</th>
      <th class="text-center">{{Header8}}</th>
      <th class="text-center">{{Header9}}</th>
    </tr>
    </thead>
    <tbody >
    <tr v-for="(item, index) in historique"
        :key="index"
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
  </v-table>
</template>

<script setup lang="ts">

const props = defineProps({
  NombreLigne: {type: Number, required: true},
  NombreCol: {type: Number, required: true},
  Header1: {type: String, required: true},
  Header2: {type: String},
  Header3: {type: String},
  Header4: {type: String},
  Header5: {type: String},
  Header6: {type: String},
  Header7: {type: String},
  Header8: {type: String},
  Header9: {type: String},
})



</script>

<style scoped>

</style>