<template>
    <div class="produit-card-container ma-5">
        <produit-card v-for="(a, index) in articles"
                      :key="a._id"
                      :shown="isShownArticle(a)"
                      v-model="articles[index]"></produit-card>
    </div>
</template>

<script setup lang="ts">
import ArticlePotInterface from "~/interfaces/ArticlePotInterface"
import ProduitInterface from "~/interfaces/ProduitInterface"

const articles: Ref<Array<ArticlePotInterface>> = ref([] as Array<ArticlePotInterface>)

const props = defineProps({
    modelValue: {type: Object as () => Array<ArticlePotInterface>, required: true},
    produitsDispoList: {type: Object as () => Array<ProduitInterface>, required: true},
    filterBy: {type: String},
    filterValue:[String, Number, Boolean],
    filterType:{type: String, default: 'isEqual'}
})

const emits = defineEmits(['update:modelValue'])

const isShownArticle = (article: ArticlePotInterface) => {
    if (props.filterBy && props.filterValue) {
        let articleTemp: any = {...article}
        props.filterBy.split('.').forEach((p: string)=> articleTemp = articleTemp[p])

        switch (props.filterType) {
            case 'isEqual':
                return articleTemp === props.filterValue
            case 'isGreater':
                if(typeof props.filterValue === 'number') {
                    return articleTemp > props.filterValue
                }else {
                    console.error(`Bad type for filterValue: ${typeof props.filterValue}. Please put a Number type for isGreater.`)
                    return false
                }
            case 'isLower':
                if(typeof props.filterValue === 'number') {
                    return articleTemp < props.filterValue
                }else {
                    console.error(`Bad type for filterValue: ${typeof props.filterValue}. Please put a Number type for isLower.`)
                    return false
                }
            case 'contain':
                if(typeof props.filterValue === 'string') {
                    return articleTemp.toLowerCase().includes(props.filterValue.toLowerCase())
                }else {
                    console.error(`Bad type for filterValue: ${typeof props.filterValue}. Please put a String type for Contain.`)
                    return false
                }
            default: {
                console.error(`Bad type for filterType: ${props.filterType} is unknown.`)
            }
        }
    } else return true
}

const inputValue = computed({
    get: () => props.modelValue,
    set: newValue => emits('update:modelValue', newValue)
})

watch(() => [...articles.value], newValue => {
    inputValue.value = newValue.filter(article => !!article.quantite)
})

onBeforeMount(()=>{
    articles.value = props.produitsDispoList.map(item => ({...item, quantite:0} as ArticlePotInterface))
})

</script>

<style scoped>

</style>