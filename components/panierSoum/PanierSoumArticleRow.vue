<template>
    <v-container>
        <v-row class="align-center justify-space-between">
            {{ `${article.quantite}x ${article.nom}` }}
            <v-btn-group>
                <v-btn icon="mdi:mdi-plus"
                       :disabled="!articleExists(article)"
                       @click="ajouter(article)"/>
                <v-btn icon="mdi:mdi-minus"
                       @click="retirer(article)"/>
                <v-btn icon="mdi:mdi-delete"
                       @click="retirer(article, true)"/>
            </v-btn-group>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";

/** PROPS */
const props = defineProps<{
    article: ArticlePotInterface
}>()

/** EMITS */
const emit = defineEmits(['emptied'])

/** METHODS */

/**
 * Vérifie si l'article est dispo dans le stock
 * @param article
 */
const articleExists = (article: ArticlePotInterface) => {
    return article.quantite < article.nombre
}

/**
 * Ajoute un élément de l'article
 * @param article
 */
const ajouter = (article: ArticlePotInterface) => {
    if (articleExists(article)) {
        article.quantite += 1
    }
}

/**
 * Retire un ou tout élément de l'article
 * @param article
 * @param all
 */
const retirer = (article: ArticlePotInterface, all: boolean = false) => {
    if (all) {
        article.quantite = 0
    } else article.quantite -= 1
    if (article.quantite === 0) emit('emptied')
}

</script>

<style scoped>

</style>