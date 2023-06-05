<template>
    <v-dialog v-model="open" width="auto">
        <v-card :class="classCard">
            <v-card-title>{{ titre }}</v-card-title>
            <v-card-text v-if="question">{{ question }}</v-card-text>
            <slot/>
            <v-card-actions class="justify-center">
                <v-btn @click="emits('confirmer')" color="primary">Valider</v-btn>
                <v-btn @click="open = false" color="primary">Annuler</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

/**REFS*/

const props = defineProps({
    modelValue: Boolean,
    titre: String,
    question: String,
    classCard: {type: String, default: ""},
})

/**EMITS*/

const emits = defineEmits(['update:modelValue', 'confirmer'])

/**COMPUTEDS*/

const open = computed({
    get: () => props.modelValue,
    set: (newValue) => emits('update:modelValue', newValue)
})

</script>

<style scoped>

</style>