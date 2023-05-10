<template>
<v-card v-show="shown" density="compact" width="110" height="200">
    <v-card-actions>
        <v-btn-group density="compact">
            <v-btn density="compact"
                   :disabled="productNull"
                   @click="augmenterQuantite"
                   icon="mdi:mdi-plus"/>
            <v-btn class="ma-0"
                   density="compact"
                   :disabled="modelValue.quantite===0"
                   @click="reduireQuantite"
                   icon="mdi:mdi-minus"/>
        </v-btn-group>
        <v-spacer/>
        <v-badge color="secondary"
                 :model-value="!!modelValue.quantite"
                 inline
                 max="999"
                 :content="modelValue.quantite"/>
    </v-card-actions>
    <v-card-item>
        <v-img alt="test" :src="`${serverconfig}${modelValue.image}`" width="100" aspect-ratio="1/1"/>
    </v-card-item>
    <v-card-text class="text-center" >{{modelValue.nom}}</v-card-text>
</v-card>
</template>

<script setup lang="ts">
import serverconfig from "~/serverconfig";
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";

const props = defineProps({
    modelValue:{
        type: Object as () => ArticlePotInterface,
        required: true
    },
    shown: {type: Boolean, required:true}
})

const emits = defineEmits(['update:modelValue'])

const productNull = computed(() => {
    return props.modelValue.nombre <= props.modelValue?.quantite
})

const inputValue = computed({
    get: () => props.modelValue,
    set: newValue => emits('update:modelValue', newValue    )
})

const reduireQuantite = () =>
    inputValue.value = {...inputValue.value, quantite: inputValue.value?.quantite-1}
const augmenterQuantite = () =>
    inputValue.value = {...inputValue.value, quantite: inputValue.value?.quantite+1}

</script>

<style scoped>
</style>