<template>
    <v-table density="compact">
        <tbody>
        <tr v-for="(item, index) in pot.articles.filter(article => article.quantite > 0)"
            :key="'row' + index">
            <td>
                {{ item.quantite }}x {{ item.nom }}
            </td>
            <td>
                {{ item.prixEuros * item.quantite + item.prix * item.quantite * props.valeurPoint }}€
            </td>
        </tr>
        <tr>
            <td class="text-end">Total</td>
            <td>{{ props.total }} €</td>
        </tr>
        <tr>
            <td class="text-end">Total par personne</td>
            <td>{{ props.totalParParticipant }} €</td>
        </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import PotInterface from "~/interfaces/potsInterfaces/PotInterface";

const props = defineProps({
    pot:{type: Object as ()=> PotInterface, required:true},
    total: {type: Number, required: true},
    totalParParticipant:{type: String, required: true},
    valeurPoint: {type: Number, required: true}
})


</script>

<style scoped>

</style>