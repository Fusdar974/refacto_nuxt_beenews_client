<template>
    <v-dialog v-model="openComputed" class="v-container" width="auto">
        <v-card v-if="commande !== null">
            <v-card-title>Détail commande</v-card-title>
            <v-container>
                <v-row>
                    <v-col sm="3">Barman</v-col>
                    <v-col sm="9">{{ commande.barman.nom }} {{ commande.barman.prenom }}</v-col>
                    <v-col sm="3">Date:</v-col>
                    <v-col sm="9">{{ new Date(commande.date).toLocaleString() }}</v-col>
                    <v-divider/>
                </v-row>

                <v-row v-if="(commande.historique?.length ?? 0) > 0">
                    <v-col sm="12">Articles</v-col>
                    <ligne-article :items="commande.historique ?? []"/>
                    <v-divider/>
                </v-row>
                <v-row>
                    <v-col sm="12"><h4>Paiement</h4></v-col>
                </v-row>
                <v-row v-if="commande.paiementCompte">
                    <v-col sm="6">Compte</v-col>
                    <v-col sm="6">{{ commande.paiementCompte }} BN</v-col>
                </v-row>
                <v-row v-if="commande.paiementEspece">
                    <v-col sm="6">Espèce</v-col>
                    <v-col sm="6">{{ commande.paiementEspece }} €</v-col>
                </v-row>
                <v-row v-if="commande.paiementCheque">
                    <v-col sm="6">Espèce</v-col>
                    <v-col sm="6">{{ commande.paiementCheque }} €</v-col>
                </v-row>
                <v-row v-if="commande.paiementVirement">
                    <v-col sm="6">Espèce</v-col>
                    <v-col sm="6">{{ commande.paiementVirement }} €</v-col>
                </v-row>
                <v-row>
                    <v-col sm="6">Monnaie rendue</v-col>
                    <v-col sm="6">{{ commande.rendreMonnaie }} €</v-col>
                </v-row>
                <v-divider/>
                <v-row>
                    <v-col sm="6">Ancien solde</v-col>
                    <v-col sm="6">{{ commande.ancienSolde }} BN</v-col>
                </v-row>
                <v-row>
                    <v-col sm="6">Nouveau solde</v-col>
                    <v-col sm="6">{{ commande.nouveauSolde }} BN</v-col>
                </v-row>
                <v-row v-if="commande.commentaires">
                    <v-col sm="6">Commentaires</v-col>
                    <v-col sm="6">{{ commande.commentaires }}</v-col>
                </v-row>
            </v-container>
            <v-card-actions class="justify-end">
                <v-btn @click="openComputed = false" color="primary">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import HistoriqueLigneInterface from "~/interfaces/historiqueInterfaces/HistoriqueLigneInterface";

/** REFS */

interface PropsInterface {
    commande: HistoriqueLigneInterface
    openDialog: boolean
}

const props = defineProps<PropsInterface>()

/** EMITS */

const emits = defineEmits(['update:openDialog'])

/** COMPUTEDS */

const openComputed = computed({
    get: () => props.openDialog,
    set: (newValueOpen) => emits('update:openDialog', newValueOpen)
})
</script>

<style scoped>

</style>