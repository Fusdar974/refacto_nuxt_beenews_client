<template>
    <private-route>
        <v-card>
            <v-container>
                <v-row align="center">
                    <v-col class="text-start">
                        <v-btn icon="mdi:mdi-arrow-left"
                               variant="text"
                               @click="moisPrecedent"/>
                    </v-col>
                    <v-col class="text-center">
                        <div>{{ libelleMois }} {{ annee }}</div>
                    </v-col>
                    <v-col class="text-end">
                        <v-btn icon="mdi:mdi-arrow-right"
                               variant="text"
                               @click="moisSuivant"/>
                    </v-col>
                </v-row>
                <v-row>
                    <planning-barman-cellule v-for="(jour, index) in calendrier"
                                             :key="index"
                                             :item="jour"
                                             @changeBarman="changerBarman(index)"/>
                </v-row>
            </v-container>
        </v-card>
        <modal-confirmation class-card="centerCard"
                            v-model="openDialog"
                            :titre="`Barman du ${jourAffichage}`"
                            @confirmer="confirmerChoix">
            <v-form>
                <v-select v-model="barmanSelectionne"
                          :items="barmans"
                          :item-title="(barman) => `${barman.nom}  ${barman.prenom}`"
                          return-object
                          label="Barman"/>
            </v-form>
        </modal-confirmation>
    </private-route>
</template>

<script setup lang="ts">

import UserInterface from "~/interfaces/UserInterface";
import CalendrierJourInterface from "~/interfaces/CalendrierInterfaces/CalendrierJourInterface";
import Fetch from "~/services/FetchService";
import CalendrierResponseInterface from "~/interfaces/CalendrierInterfaces/CalendrierResponseInterface";
import BarmansResponseInterface from "~/interfaces/BarmansResponseInterface";
import {Ref} from "vue";

const date = new Date()
const openDialog: Ref<boolean> = ref(false)
const mois: Ref<number> = ref(date.getMonth())
const annee: Ref<number> = ref(date.getFullYear())
const calendrier: Ref<Array<CalendrierJourInterface>> = ref([])
const barmans: Ref<Array<UserInterface>> = ref([])
const barmanSelectionne: Ref<UserInterface | undefined> = ref()
const jourSelectionne: Ref<number> = ref(0)
const libelleMois: Ref<string> = ref('')

const jourAffichage = computed(() =>
    calendrier.value.length && `${
        calendrier.value[jourSelectionne.value].jour
    }/${
        calendrier.value[jourSelectionne.value].mois
    }/${
        calendrier.value[jourSelectionne.value].annee}` || '')

const recupererMois = () => {
    Fetch.requete({
        url: `/planning/${annee.value}/${mois.value}`,
        method: 'GET'
    }, (resultat: CalendrierResponseInterface) => {
        calendrier.value = resultat.calendrier
        libelleMois.value = resultat.libelleMois
    });
}

const recupererBarman = () => {
    Fetch.requete({url: `/planning/barmans`, method: 'GET'}, (resultat: BarmansResponseInterface) => {
        barmans.value = resultat.barmans
        barmanSelectionne.value = resultat.barmans?.[0]
    })
}

const moisPrecedent = () => {
    if (--mois.value < 0) {
        mois.value = 11
        --annee.value
    }
    recupererMois()
}

const moisSuivant = () => {
    if (++mois.value > 11) {
        mois.value = 0;
        ++annee.value;
    }
    recupererMois();
}

const changerBarman = (index: number) => {
    if (!calendrier.value[index].weekEnd && calendrier.value[index].moisEnCours) {
        if (calendrier.value[index].barman) {
            barmanSelectionne.value = calendrier.value[index].barman
        } else {
            barmanSelectionne.value = barmans.value[0]
        }
        jourSelectionne.value = index
        openDialog.value = true
    }
}

const confirmerChoix = () => {
    calendrier.value[jourSelectionne.value].barman = {
        ...barmanSelectionne.value,
        profils: undefined,
        compte: undefined
    } as UserInterface
    const {jour, mois, annee, barman} = calendrier.value[jourSelectionne.value];
    const planning = {jour, mois, annee, barman};
    Fetch.requete({url: '/planning/', method: 'POST', data: {planning}}, () => {
        openDialog.value = false
    });
}

onMounted(() => {
    recupererMois();
    recupererBarman();
})

</script>

<style scoped>

</style>