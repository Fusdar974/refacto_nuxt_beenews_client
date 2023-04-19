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
    <detail-historique-card :commande="commande" :type="type" :close-fonction="handleClose"/>
  </v-dialog>

</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService";
import {onMounted, watch} from "#imports";
import HistoriqueInterface from "~/interfaces/HistoriqueInterface";
import HistoriqueLigneInterface from "~/interfaces/HistoriqueLigneInterface";
import HistoriqueLigneResponseInterface from "~/interfaces/HistoriqueLigneResponseInterface";
import LigneArticle from "~/components/LigneArticle.vue";
import DetailHistoriqueCard from "~/components/DetailHistoriqueCard.vue";

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