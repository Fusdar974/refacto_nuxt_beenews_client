<template>
    <v-table density="compact">
        <tbody>
        <tr v-for="(item, index) in pot.articles.filter(article => article.quantite > 0)"
            :key="'row' + index">
            <td>
                {{ item.quantite }}x {{ item.nom }}
            </td>
            <td>
                {{ item.prixEuros * item.quantite + item.prix * item.quantite * valeurPoint }}€
            </td>
        </tr>
        <tr>
            <td class="text-end">Total</td>
            <td>{{ total }} €</td>
        </tr>
        <tr>
            <td class="text-end">Total par personne</td>
            <td>{{ totalParParticipant }} €</td>
        </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import Fetch from "~/services/FetchService";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import {ComputedRef} from "vue";
import PotInterface from "~/interfaces/PotInterface";

const props = defineProps({
 pot:{type: Object as ()=> PotInterface, required:true}
})

const valeurPoint: Ref<number> = ref(0)

const total = computed(()=>{
    let result = 0
    props.pot?.articles
        .map(article => article.prixEuros * article.quantite + article.prix * article.quantite * valeurPoint.value)
        .forEach(valeurEuros => result+=valeurEuros)
    return result
})

const totalParParticipant: ComputedRef<string | number> = computed(()=>{
    if(props.pot.participants && props.pot.participants.length!==0) {
        return (total.value / props.pot.participants.length).toFixed(2)
    }else return ''
})

onMounted(()=>{
    Fetch.requete({ url: '/parametre/valeurBN', method: 'GET' }, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = resultBN.valeur
    })
})
</script>

<style scoped>

</style>