<template>
    <slot v-if="mdAndUp"/>
    <v-expansion-panel v-else>
        <v-expansion-panel-title :color="colorAlert">{{[participant.nom,participant.prenom].join(' ')}}</v-expansion-panel-title>
        <v-expansion-panel-text>
            <slot/>
        </v-expansion-panel-text>
    </v-expansion-panel>
</template>

<script setup lang="ts">
import {useDisplay} from "vuetify";
import ParticipantPotInterface from "~/interfaces/potsInterfaces/ParticipantPotInterface";

const props = defineProps({
    participant: { type: Object as () => ParticipantPotInterface, required:true },
    colorAlert: {type: String}
})

const {mdAndUp} = useDisplay()


</script>

<style scoped>

</style>