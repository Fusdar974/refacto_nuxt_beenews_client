<template>
    <v-list>
        <v-list-item>
            <slot/>
        </v-list-item>
        <v-list-item>
            <v-text-field v-if="utilisateur && utilisateur.compte > 0"
                          v-model.number="paiementCompte"
                          label="Compte"
                          class="mt-2"
                          suffix="BN"
                          density="compact"
                          variant="outlined"
                          min="0"
                          @input="handleVerifierSolde"
                          type="number"/>
            <v-text-field label="Espèce"
                          v-model.number="paiementEspece"
                          :class="utilisateur && utilisateur.compte > 0?'':'mt-2'"
                          suffix="€"
                          density="compact"
                          variant="outlined"
                          type="number"
                          @input="()=>paiementEspece = Math.max(formatToNumber(paiementEspece),0)"/>

            <v-text-field label="Virement"
                          v-model.number="paiementVirement"
                          suffix="€"
                          min="0"
                          density="compact"
                          variant="outlined"
                          type="number"
                          @input="()=>paiementVirement = Math.max(formatToNumber(paiementVirement),0)"/>

            <v-text-field label="Chèque"
                          v-model.number="paiementCheque"
                          suffix="€"
                          density="compact"
                          variant="outlined"
                          @input="()=>paiementCheque=Math.max(formatToNumber(paiementCheque),0)"
                          type="number"/>
        </v-list-item>
        <v-list-item v-if="manqueEuro>0">
            <v-alert color="warning">Manque euros : {{ manqueEuro }}</v-alert>
        </v-list-item>
        <v-list-item v-if="manqueBeeNews>0">
            <v-alert color="warning">Manque bee news : {{ manqueBeeNews }}</v-alert>
        </v-list-item>
        <v-list-item v-if="rendreMonnaieComputed>0">
            <v-alert color="error">Rendre monnaie : {{ rendreMonnaieComputed }} €</v-alert>
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">

import {usePanierStore} from "~/stores/panierStore";
import {storeToRefs} from "pinia";

const props = defineProps<{
    valeurPoint: number
    clientBn: number
}>()

const emit = defineEmits(['valide'])

/** STORES **/

const {formatToNumber} = usePanierStore()

const {
    paiementCompte,
    paiementCheque,
    paiementEspece,
    paiementVirement,
    rendreMonnaie,
    utilisateur,
    totalPanierBeeNews,
    totalPanierEuros
} = storeToRefs(usePanierStore())

/** COMPUTED **/

/**
 * Somme des 3 moyens de paiement en euros
 */
const totalPaiementEuro = computed(() =>
    formatToNumber(paiementCheque.value) + formatToNumber(paiementEspece.value) + formatToNumber(paiementVirement.value))

/**
 * Vérifie s'il manque des Euros à payer
 * Ne prend pas en compte les BN convertis
 */
const manqueEuro = computed(() => totalPanierEuros.value - totalPaiementEuro.value)

/**
 * Vérifie s'il manque des BN à payer
 */
const manqueBeeNews = computed(() =>
    Number(rendreMonnaieComputed.value) < 0 ? totalPanierBeeNews.value - formatToNumber(paiementCompte.value) : 0)

/**
 * Calcule le rendu de monnaie
 * Prend en compte les BN convertis
 */
const rendreMonnaieComputed = computed(() => {
    const totalPaiementEuroWithBN = totalPaiementEuro.value + formatToNumber(paiementCompte.value) * props.valeurPoint
    const totalEuroComputed = formatToNumber(totalPanierBeeNews.value) * props.valeurPoint + totalPanierEuros.value

    rendreMonnaie.value = (totalPaiementEuroWithBN - totalEuroComputed).toFixed(2)
    return rendreMonnaie.value
})

/**
 * Vérifie si les conditions de paiement sont OK
 */
const panierPayable = computed(() => manqueEuro.value <= 0 && manqueBeeNews.value <= 0 && !!utilisateur.value)

/** WATCHES **/

/**
 * Déclanche l'évent Valide au changement de resultat de panierPayable
 */
watch(() => panierPayable.value, newValue => emit('valide', newValue))

/** METHODS */

/**
 * Vérifie si la valeur entrée dans le champs compte
 */
const handleVerifierSolde = () => {
    paiementCompte.value = Number(formatToNumber(paiementCompte.value).toFixed(0))
    if (utilisateur.value &&
        paiementCompte.value) {
        paiementCompte.value = Math.min(paiementCompte.value, props.clientBn, totalPanierBeeNews.value)
    }
}

</script>

<style scoped>

</style>