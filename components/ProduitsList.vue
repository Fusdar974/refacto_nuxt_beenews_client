<template>
    <div class="produit-card-container ma-5">
        <produit-card v-for="(a, index) in articles"
                      :key="a._id"
                      :shown="isShownArticle(a)"
                      v-model="articles[index]"></produit-card>
    </div>
</template>

<script setup lang="ts">
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface"
import ProduitInterface from "~/interfaces/ProduitInterface"
import {SymbolKind} from "vscode-languageserver-types";
import ProduitsListFilterInterface from "~/interfaces/ProduitsListFilterInterface";
import Array = SymbolKind.Array;

const props = defineProps({
    modelValue: {type: Object as () => Array<ArticlePotInterface>, required: true},
    produitsDispoList: {type: Object as () => Array<ProduitInterface>, required: true},
    filters: {type: Object as () => Array<ProduitsListFilterInterface>}
})

const articles: Ref<Array<ArticlePotInterface>> = ref([] as Array<ArticlePotInterface>)

const emits = defineEmits(['update:modelValue'])



const isShownArticle = (article: ArticlePotInterface) => {
    return props.filters?.every(filter => {
        if (filter.by && (filter.value || filter.value === 0)) {
            let articleTemp: any = {...article}
            filter.by.split('.').forEach((p: string) => articleTemp = articleTemp[p])
            switch (filter.type) {
                case 'isGreater':
                    if (typeof filter.value === 'number') {
                        return articleTemp > filter.value
                    } else {
                        console.error(`Bad type for filter.value: ${typeof filter.value}. Please put a Number type for isGreater.`)
                        return false
                    }
                case 'isLower':
                    if (typeof filter.value === 'number') {
                        return articleTemp < filter.value
                    } else {
                        console.error(`Bad type for filter.value: ${typeof filter.value}. Please put a Number type for isLower.`)
                        return false
                    }
                case 'contain':
                    if (typeof filter.value === 'string') {
                        return articleTemp.toLowerCase().includes(filter.value.toLowerCase())
                    } else {
                        console.error(`Bad type for filter.value: ${typeof filter.value}. Please put a String type for Contain.`)
                        return false
                    }
                default: {
                    return articleTemp === filter.value
                }
            }
        } else return true
    }) ?? true
}

const inputValue = computed({
    get: () => props.modelValue,
    set: newValue => emits('update:modelValue', newValue)
})

watch(() => [...articles.value], newValue => {
    inputValue.value = newValue.filter(article => !!article.quantite)
})

onMounted(()=>{
    articles.value = props.produitsDispoList.map(item => ({...item, quantite: props.modelValue?.find(article => article._id === item._id)?.quantite ?? 0} as ArticlePotInterface))
})

</script>

<style scoped>
.produit-card-container{
    display: grid;
    grid-template-columns: repeat(auto-fill,110px);
    grid-gap: 1rem;
    justify-content: space-between;
}
</style>