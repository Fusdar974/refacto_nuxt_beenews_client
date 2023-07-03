<template>
    <div v-show="!lgAndUp && props.item?.moisEnCours || lgAndUp"
         @click="emit('changeBarman')"
         :class="`cellule ${
                   props.item?.moisEnCours && !props.item?.weekEnd ?'day-to-click ':''
               }${
                   props.item?.auj ? 'today ': ''
               }${
                   props.item?.weekEnd && props.item?.moisEnCours ? 'week-end ':''
               }${
                     !props.item?.moisEnCours ? 'no-month-day ':''
               }`">
        <div>
            <div>
                {{ item.libelleJour }} {{ item.jour }}
            </div>
            <div style="white-space: nowrap">
                <div v-if="props.item?.barman">
                    <span>{{ item.barman.nom }} {{ item.barman.prenom }}</span>
                    <div v-if="props.item?.barmanRecompense">
                        <br/>
                        <v-icon icon="mdi:mdi-trophy"/>
                        <span>{{ item.barmanRecompense.nom }} {{ item.barmanRecompense.prenom }} </span>
                    </div>
                </div>
                <span v-if="!props.item?.barman && props.item?.moisEnCours && !props.item?.weekEnd">
                    <v-icon icon="mdi:mdi-alert" class="alertBarman"/> Pas de barman
                </span>
                <span v-if="!props.item?.barman && (!props.item?.moisEnCours || props.item?.weekEnd)">&nbsp;</span>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">

import CalendrierJourInterface from "~/interfaces/calendrierInterfaces/CalendrierJourInterface";
import {useDisplay} from "vuetify";

const props = defineProps({
    item: {type: Object as () => CalendrierJourInterface},
})

const emit = defineEmits(['changeBarman'])

const {lgAndUp} = useDisplay()

const dayScreenSize = computed(() => lgAndUp.value ? 7 : 1)

</script>

<style scoped>

.day-to-click {
    cursor: pointer;
}

.cellule {
    width: calc(100% / v-bind(dayScreenSize));
    padding: 10px;
    height: auto;
    color: black;
    background-color: white;
    text-align: center;
}

.today {
    background-color: rgba(255, 206, 28, 0.95) !important;
}

.week-end {
    background-color: rgba(63, 81, 181, 0.95) !important;
}

.no-month-day {
    color: white;
}

</style>