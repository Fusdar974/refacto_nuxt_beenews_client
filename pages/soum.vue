<template>
    <v-container>
        <v-row>
            <v-col>
                <v-tabs v-model="filtre"
                        center-active
                        color="primary"
                        slider-color="secondary"
                        align-tabs="center">
                    <v-tab v-for="(typeproduit, index) in typeproduits as Array<TypeProduitInterface>"
                           :key="index"
                           :value="typeproduit._id">{{ typeproduit.nom }}
                    </v-tab>
                </v-tabs>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
                <div v-else>
                    <lazy-produits-list v-model="articles"
                                        :filters="[
                                                   {by:'type._id', value:filtre as string},
                                                   ] as Array<ProduitsListFilterInterface>"
                                        :produits-dispo-list="produitToScreen"/>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import TypeProduitInterface from "~/interfaces/TypeProduitInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import ProduitsListFilterInterface from "~/interfaces/ProduitsListFilterInterface";
import {useMenuStore} from "~/stores/menuStore";
import {storeToRefs} from "pinia";
import {usePanierStore} from "~/stores/panierStore";

/** REFS */
const typeproduits = ref<Array<TypeProduitInterface>>([])
const produitToScreen = ref<Array<ProduitInterface>>([])
const filtre = ref<string>('')
const show: Ref<boolean> = ref(false)

/** STORES */

/** Gestion du Titre dans l'APPBAR*/
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = "Soum"

const {articles} = storeToRefs(usePanierStore())

/** LIFECYCLE */

/** Chargement des données après le montage du composant dans le dom */
onMounted(() => {
    Fetch.requete({
        url: '/typeproduits',
        method: 'POST',
        data: {"proposableSoum": true}
    }, (resultTypeproduits: Array<TypeProduitInterface>) => {
        Fetch.requete({url: '/soum', method: 'POST'}, (resultProduits: {
            produits: Array<ProduitInterface>
        }) => {
            typeproduits.value = resultTypeproduits
            filtre.value = resultTypeproduits[0]._id || ''
            const produitsWithStock = resultProduits.produits.filter(produit => produit.nombre > 0)
            const produitsWithoutStock = resultProduits.produits.filter(produit => produit.nombre === 0)
            produitToScreen.value = produitsWithStock.concat(produitsWithoutStock)
        })
    })
})
</script>

<style scoped>


</style>