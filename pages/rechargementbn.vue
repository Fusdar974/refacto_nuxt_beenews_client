<template>
    <private-route>
        <v-container class="ma-3">
            <v-row>
                <v-col cols="12" md="6" class="hidden-sm-and-down">
                    <v-autocomplete
                        auto-select-first
                        v-model="selectedReciever"
                        :items="users"
                        :item-title="(user) => user.nom?`${user.nom} ${user.prenom}`: isLoadingFetchUsers ? 'En chargement...' : 'Pas de correspondance'"
                        return-object
                        :loading="isLoadingFetchUsers"
                        :error-messages="(selectedReciever === null) ? 'Sélectionner un client' : ''"
                        label="Client"/>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field
                        type="number"
                        v-model.number="euros"
                        label="euros"
                        :error-messages="(euros > 0) ? '': 'Veuillez rentrer un nombre supérieur a 0'"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-select
                        v-model="modePaiement"
                        :items="modesPaiement"
                        label="mode de paiement"
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-card-title v-if="selectedReciever">BN possédés : {{ selectedReciever.compte }}, BN rechargé:
                        {{ nombreBn }}, BN totaux:
                        {{ selectedReciever.compte + nombreBn }}
                    </v-card-title>
                </v-col>
                <v-col cols="12" class="hidden-md-and-up">
                    <v-select
                        v-model="selectedReciever"
                        :items="users"
                        :item-title="(user) => `${user.nom} ${user.prenom}`"
                        return-object
                        label="Client"
                    />
                </v-col>

            </v-row>

            <v-btn color="primary"
                   @click="rechargerBN"
                   :block="!mdAndUp"
                   :disabled="!(selectedReciever && nombreBn > 0)">Recharger
            </v-btn>

        </v-container>
    </private-route>
</template>

<script setup lang="ts">
import UserInterface from "~/interfaces/UserInterface";
import {useSnackbarStore} from "~/stores/snackbarStore";
import Fetch from "~/services/FetchService";
import {storeToRefs} from "pinia";
import {useMenuStore} from "~/stores/menuStore";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import {useDisplay} from "vuetify";

/** REFS */
const users = ref<Array<UserInterface>>([]);
const selectedReciever = ref<UserInterface | null>(null);
const nombreBn = ref<number>(0);
const euros = ref<number>(0);
const valeurPoint = ref<number>(0)
const paiementEspece = ref<number>(0)
const paiementVirement = ref<number>(0)
const modePaiement = ref<string>("Espèce")
const modesPaiement = ref<Array<string>>(["Espèce", "Virement"]);
const isLoadingFetchUsers = ref<boolean>(false)
const value = ref<any>()

const {mdAndUp} = useDisplay()

/** STORES */

const {putSnackBarMessage} = useSnackbarStore()
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = 'Rechargement BN'

/** WATCHES */

watch(euros, () => eurosToBN())

/** LYFECYCLE */

onMounted(() => {
    getUsers()
    Fetch.requete({url: '/parametre/valeurBN', method: 'GET'}, (result: ValeurBNResponseInterface) => {
        valeurPoint.value = result.valeur
    });
})

/** METHODS */

/**
 * Récupère la liste des Utilisateurs
 */
const getUsers = () => {
    isLoadingFetchUsers.value = true
    Fetch.requete(
        {url: "/users", data: {page: 1, nombre: 1000}},
        (resultat: { documents: Array<UserInterface> }) => {
            isLoadingFetchUsers.value = false
            users.value = resultat.documents;
            selectedReciever.value = selectedReciever.value &&
                users.value.find(u => u._id === selectedReciever.value!._id) || resultat.documents[0];
        }, () => {
            isLoadingFetchUsers.value = false
            putSnackBarMessage("erreur serveur lors de la récupération des utilisateurs", "error")
        }
    );
}

/**
 * S'assure que la somme donnée est positive et met à jour la valeur des BN à transférer en fonction de la somme donnée
 * ajoute 2 BN bonus pour chaque 10 euros
 */
function eurosToBN() {
    if (euros.value < 0) {
        euros.value = 0
    } else {
        nombreBn.value = euros.value / valeurPoint.value + (Math.floor(euros.value / 10) * 2)
    }
}

/**
 * Affecte le la somme donnée au mode de paiement choisi
 * et envoie une requète de rechargement au back avec les point à recharger et la somme donnée dans le mode choisi
 * envoie un message de succès si la transaction a fonctionner et une erreur en cas d'échec
 */
function rechargerBN() {
    if (modePaiement.value === "Virement") {
        paiementVirement.value = euros.value
        paiementEspece.value = 0
    } else {
        paiementEspece.value = euros.value
        paiementVirement.value = 0
    }
    if (selectedReciever.value && nombreBn.value > 0) {
        Fetch.requete(
            {
                url: `/users/recharger/${selectedReciever.value._id}`,
                method: "POST",
                data: {
                    pointRecharge: nombreBn.value,
                    paiementEspece: paiementEspece.value,
                    paiementCarte: paiementVirement.value
                },
            },
            () => {
                putSnackBarMessage("transaction effectuée")
                getUsers()
            }, () => {
                putSnackBarMessage("erreur serveur", "error")
            }
        );
    }
}

</script>

<style scoped>

</style>