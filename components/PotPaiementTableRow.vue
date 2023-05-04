<template>
    <tr>
        <td class="pa-0">
            {{ participant.nom }} {{ participant.prenom }}
        </td>
        <td class="pa-0">
            <v-text-field v-model.number="paiementEspeceComputed"
                          :disabled="participant.paye || isDisable"
                          type="number"
                          step="0.25"
                          min="0"/>
        </td>
        <td class="pa-0">
            <v-text-field v-model.number="paiementChequeComputed"
                          :disabled="participant.paye || isDisable"
                          type="number"
                          step="0.25"
                          min="0"/>
        </td>
        <td class="pa-0">
            <v-text-field v-model.number="paiementVirementComputed"
                          :disabled="participant.paye || isDisable"
                          type="number"
                          step="0.25"
                          min="0"/>
        </td>
        <td class="pa-0">
            <v-alert v-if="!peutEtrePayeComputed"
                     icon="false"
                     type="warning">Manque {{ (renduMonnaieComputed * -1).toFixed(2) }} €
            </v-alert>
            <v-alert v-if="peutEtrePayeComputed && !participant.paye"
                     icon="false"
                     type="error">Rendre {{ renduMonnaieComputed.toFixed(2) }} €
                <v-btn color="primary"
                       @click="payer(participant._id)"> Payer
                </v-btn>
            </v-alert>
            <v-alert v-if="participant.paye"
                     type="success">Payé - Rendue {{ renduMonnaieComputed.toFixed(2) }} €
            </v-alert>
        </td>
    </tr>
</template>

<script setup lang="ts">
import ParticipantPotInterface from "~/interfaces/ParticipantPotInterface";
import {ComputedRef} from "vue";

const props = defineProps({
    participant: {type: Object as ()=>ParticipantPotInterface, required: true},
    totalParParticipant: {type: String, required: true},
    isDisable: {type: Boolean, required: true},
    payer: {type: Function, required: true}
})

const emits = defineEmits(['update:participant'])

const paiementEspeceComputed = computed({
    get: () => props.participant.paiementEspece,
    set: (newPaiementEspece) => emits('update:participant', {...props.participant, paiementEspece:newPaiementEspece} as ParticipantPotInterface),
})
const paiementVirementComputed = computed({
    get: () => props.participant.paiementVirement,
    set: (newPaiementVirement) => emits('update:participant', {...props.participant, paiementVirement:newPaiementVirement} as ParticipantPotInterface),
})
const paiementChequeComputed = computed({
    get: () => props.participant.paiementCheque,
    set: (newPaiementCheque) => emits('update:participant', {...props.participant, paiementCheque:newPaiementCheque} as ParticipantPotInterface),
})

const renduMonnaieComputed: ComputedRef<number> = computed(() => {
        const resultRenduMonnaie = Number(paiementChequeComputed.value) + Number(paiementEspeceComputed.value) + Number(paiementVirementComputed.value)
        - Number(props.totalParParticipant)
        props.participant.renduMonnaie = resultRenduMonnaie
        return resultRenduMonnaie
    }
)

const peutEtrePayeComputed: ComputedRef<boolean> = computed(() => {
    const resultPeutEtrePaye = Number(paiementChequeComputed.value) >= 0 && Number(paiementEspeceComputed.value) >= 0
    && Number(paiementVirementComputed.value) >= 0 && renduMonnaieComputed.value >= 0
    props.participant.peutEtrePaye = resultPeutEtrePaye
    return resultPeutEtrePaye
})

</script>

<style scoped>

</style>