<template>
    <v-col>
        <v-table density="compact">
            <thead>
            <tr>
                <th class="pa-0">Nom</th>
                <th class="pa-0">Espèce</th>
                <th class="pa-0">Chèque</th>
                <th class="pa-0">Virement</th>
            </tr>
            </thead>
            <tbody>
             <pot-paiement-table-row v-for="(participant, index) in participants"
                                     :payer="payer"
                                     :is-disable="isDisable"
                                     :total-par-participant="totalParParticipant"
                                     :participant="participant"
                                     @update:participant="(newValue: ParticipantPotInterface) =>
                                     participants[index] = newValue"
                                     :key="index"/>
            </tbody>
        </v-table>
    </v-col>
</template>

<script setup lang="ts">
import ParticipantPotInterface from "~/interfaces/ParticipantPotInterface";
import PotPaiementTableRow from "~/components/PotPaiementTableRow.vue";

const props = defineProps({
    participants: { type: Object as () => ParticipantPotInterface[], required: true },
    isDisable: {type: Boolean, required: true},
    payer: {type: Function, required: true},
    totalParParticipant: {type: String, required: true}
})

</script>

<style scoped>

</style>