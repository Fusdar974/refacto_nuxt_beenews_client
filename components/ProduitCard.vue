<template>
    <v-card v-show="shown" density="compact" width="120" height="230">
        <div v-if="modelValue[tarifAttr]"
             class="tarif">
            {{ `${modelValue[tarifAttr]} ${tarifAttr.toLowerCase().includes('euro') ? '€' : 'BN'}` }}
        </div>
        <v-card-item density="compact" style="min-height: 105px;">
            <v-img alt="test"
                   style="max-height: 85px"
                   :src="`${serverconfig}${modelValue.image}`" width="100"
            />
            <v-badge color="secondary"
                     class="badge"
                     :model-value="!!modelValue.quantite"
                     max="99"
                     :content="modelValue.quantite"/>
        </v-card-item>
        <v-divider/>
        <v-card-text class="text-center align-center justify-center" style="display:flex ;padding:10px; height: 75px">
            <p style="font-size: 12px; font-weight: bold">{{ modelValue.nom }}</p>
        </v-card-text>
        <v-card-actions style="height: 52px; padding: 10px" class="w-100">
            <v-btn-group v-if="!productNull || modelValue.quantite!==0" style="width: 100%">
                <v-btn :class="`ma-0 w-${productNull?'100':'50'}`"
                       style="height: 40px"
                       variant="outlined"
                       v-if="modelValue.quantite!==0"
                       @click="reduireQuantite"
                       :icon="`mdi:mdi-${modelValue.quantite===1?'delete':'minus'}`"/>
                <v-btn :class="`ma-0 w-${modelValue.quantite===0?'100':'50'}`"
                       style="height: 40px"
                       variant="outlined"
                       v-if="!productNull"
                       @click="augmenterQuantite"
                       icon="mdi:mdi-plus"/>
            </v-btn-group>
            <v-btn-group v-else style="width: 100%">
                <v-btn class="w-100"
                       style="height: 40px"
                       variant="outlined"
                       color="grey">STOCK
                </v-btn>
            </v-btn-group>
        </v-card-actions>
        <div v-if="modelValue.quantite!==0"
             style="background-color:#ffce1c; position: absolute; bottom: 0; height: 4px;width: 100% "/>

    </v-card>
</template>

<script setup lang="ts">
import serverconfig from "~/serverconfig";
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";

const attr = 'prix'

const props = defineProps({
    modelValue: {
        type: Object as () => ArticlePotInterface,
        required: true
    },
    shown: {type: Boolean, required: true},
    tarifAttr: String
})

const emits = defineEmits(['update:modelValue'])

const productNull = computed(() => {
    return props.modelValue.nombre <= props.modelValue?.quantite
})

const inputValue = computed({
    get: () => props.modelValue,
    set: newValue => emits('update:modelValue', newValue)
})

const reduireQuantite = () =>
    inputValue.value = {...inputValue.value, quantite: inputValue.value?.quantite - 1}
const augmenterQuantite = () =>
    inputValue.value = {...inputValue.value, quantite: inputValue.value?.quantite + 1}

</script>

<style scoped>
.tarif {
    color: #3f51b5;
    background-color: white;
    border-radius: 10px;
    position: absolute;
    z-index: 5;
    top: 0;
    left: 0;
    padding: 1px 5px;
    font-size: 13px;
    font-weight: bold;
}


.badge {
    position: absolute;
    top: 9px;
    right: 15px;
}

</style>