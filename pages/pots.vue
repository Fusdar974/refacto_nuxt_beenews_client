<template>


</template>

<script setup lang="ts">
import ArticlePotInterface from "~/interfaces/ArticlePotInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import VueDatePicker from '@vuepic/vue-datepicker';
import PotsForm from "~/forms/PotsForm.vue";
const date: Ref<string> = ref('')
const loading: Ref<boolean> = ref(false)
const pots: Ref<any> = ref([])
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const vertical: Ref<string> = ref('top')
const horizontal: Ref<string> = ref('center')
const open: Ref<boolean> = ref(false)
const openDialog: Ref<boolean> = ref(false)
const actionUtilisateur: Ref<boolean> = ref(false)
const pot: Ref<ArticlePotInterface> = ref({} as ArticlePotInterface)

// const setpots = (potsP) => {
//     pots.value = potsP.documents
//     total.value = potsP.total
//     page.value = potsP.page
//     loading.value = false
//     actionUtilisateur.value = false
// }

// watch(() => articlesTest.value?.[1].quantite, nv => console.log(nv))



</script>

<style scoped>
.produit-card-container{
    display: grid;
    grid-template-columns: repeat(auto-fill,110px);
    grid-gap: 1rem;
    justify-content: space-between;
}
@keyframes clignotementFG {
    0% {
        transform: rotate(0deg);
        opacity: 1;
    }
    50% {
        transform: rotate(180deg);
        opacity: 0.5;
    }
    100% {
        transform: rotate(360deg);
        opacity: 1;
    }
}

.imageFondChargement {
    z-index: 0;
    position: absolute;
    bottom: calc(100% / 2 - 100px);
    right: calc(100% / 2 - 240px + 100px);
    height: 200px;
    width: 200px;
    background-image: url('/192.png');
    background-size: 200px 200px;
    background-repeat: no-repeat;
    background-position: center;
    animation: 1s clignotementFG linear infinite;
}
</style>