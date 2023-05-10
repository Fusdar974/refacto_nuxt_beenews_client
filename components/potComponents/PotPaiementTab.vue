<template>
    <div v-if="mdAndUp">
        <v-row>
            <v-col cols="2">
                Nom
            </v-col>
            <v-col cols="2">
                Espèce
            </v-col>
            <v-col cols="2">
                Chèque
            </v-col>
            <v-col cols="2">
                Virement
            </v-col>
            <v-col cols="4">
                Etat
            </v-col>
        </v-row>
        <slot/>
    </div>
    <v-expansion-panels v-else
                        v-model="panel"
                        multiple>
        <slot/>
    </v-expansion-panels>

</template>

<script setup lang="ts">
import {useDisplay} from "vuetify";

const {mdAndUp} = useDisplay()

const props = defineProps({
    initPanel:Array<number>
})

const panel: Ref<Array<number>> = ref(props.initPanel || [])

</script>

<style scoped>

</style>