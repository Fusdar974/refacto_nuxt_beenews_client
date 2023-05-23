<template>
    <v-row class="align-center justify-center">
        <v-col v-if="mdAndUp" md="2" cols="9">
            <v-alert>{{ participant.nom }} {{ participant.prenom }}</v-alert>
        </v-col>
        <v-col md="2" cols="9">
            <v-text-field v-model.number="paiementEspeceComputed"
                          :disabled="participant.paye || isDisable"
                          variant="plain"
                          :label="`${mdAndUp?'': 'Espèce'}`"
                          type="number"
                          step="0.25"
                          suffix="€"
                          min="0"/>
        </v-col>
        <v-col md="2" cols="9">
            <v-text-field v-model.number="paiementChequeComputed"
                          :disabled="participant.paye || isDisable"
                          variant="plain"
                          :label="`${mdAndUp?'': 'Chèque'}`"
                          type="number"
                          step="0.25"
                          suffix="€"
                          min="0"/>
        </v-col>
        <v-col md="2" cols="9">
            <v-text-field v-model.number="paiementVirementComputed"
                          :disabled="participant.paye || isDisable"
                          variant="plain"
                          :label="`${mdAndUp?'': 'Virement'}`"
                          type="number"
                          step="0.25"
                          suffix="€"
                          min="0"/>
        </v-col>
        <v-col md="4" cols="9">
            <v-alert :icon="false"
                     :type="typeAlertComputed">
                <p v-if="!peutEtrePayeComputed">
                    Manque {{ (renduMonnaieComputed * -1).toFixed(2) }} €
                </p>
                <p v-else-if="!participant.paye">
                    Rendre {{ renduMonnaieComputed.toFixed(2) }} €
                    <v-btn color="primary"
                           @click="payer(participant._id)"> Payer
                    </v-btn>
                </p>
                <p v-else>
                    Payé - Rendue {{ renduMonnaieComputed.toFixed(2) }} €
                </p>
            </v-alert>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import ParticipantPotInterface from "~/interfaces/potsInterfaces/ParticipantPotInterface";
import {ComputedRef} from "vue";
import {useDisplay} from "vuetify";

const props = defineProps({
    participant: { type: Object as () => ParticipantPotInterface, required: true },
    totalParParticipant: {type: String, required: true},
    isDisable: {type: Boolean, required: true},
    payer: {type: Function, required: true}
})

const {mdAndUp} = useDisplay()

const emits = defineEmits(['update:participant', 'update:color'])

/** Computed permettant de faire le lien entre la props paiement Espece
 * et le nouveau participant emit */
const paiementEspeceComputed = computed({
    get: () => props.participant.paiementEspece,
    set: (newPaiementEspece) =>
        emits('update:participant', {
            ...props.participant,
            paiementEspece: String(newPaiementEspece) === '' ? 0 : newPaiementEspece
        } as ParticipantPotInterface)
})

/** Computed permettant de faire le lien entre la props paiement Virement
 * et le nouveau participant emit */
const paiementVirementComputed = computed({
    get: () => props.participant.paiementVirement,
    set: (newPaiementVirement) =>
        emits('update:participant', {
            ...props.participant,
            paiementVirement: String(newPaiementVirement) === '' ? 0 : newPaiementVirement
        } as ParticipantPotInterface),
})

/** Computed permettant de faire le lien entre la props paiement Chèque
 * et le nouveau participant emit */
const paiementChequeComputed = computed({
    get: () => props.participant.paiementCheque,
    set: (newPaiementCheque) =>
        emits('update:participant', {
            ...props.participant,
            paiementCheque: String(newPaiementCheque) === '' ? 0 : newPaiementCheque
        } as ParticipantPotInterface),
})

/** Calcul du rendu de monnaie avant paiement */
const renduMonnaieComputed: ComputedRef<number> = computed(() => {
        const resultRenduMonnaie = Number(paiementChequeComputed.value) + Number(paiementEspeceComputed.value) + Number(paiementVirementComputed.value)
            - Number(props.totalParParticipant)
        props.participant.renduMonnaie = resultRenduMonnaie
        return resultRenduMonnaie
    }
)

/** Calcul du booleen permettant l'affichage du bouton 'payer' */
const peutEtrePayeComputed: ComputedRef<boolean> = computed(() => {
    const resultPeutEtrePaye = Number(paiementChequeComputed.value) >= 0 && Number(paiementEspeceComputed.value) >= 0
        && Number(paiementVirementComputed.value) >= 0 && renduMonnaieComputed.value >= 0
    props.participant.peutEtrePaye = resultPeutEtrePaye
    return resultPeutEtrePaye
})

/** Calcule la couleur en fonction de l'état du paiement */
const typeAlertComputed = computed(()=> {
    const typeAlert = !peutEtrePayeComputed.value ? 'warning' : !props.participant.paye ? 'error' : 'success'
    emits('update:color', typeAlert)
    return typeAlert
})

</script>

<style scoped>

</style>