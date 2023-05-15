<template>
  <v-dialog v-model="open">
    <v-card>
      <v-card-title>{{titre}}</v-card-title>
      <v-card-text>{{question}}</v-card-text>
      <slot/>
      <v-card-actions>
        <v-btn @click="emits('confirmer')" color="primary">Valider</v-btn>
        <v-btn @click="open = false" color="primary">Annuler</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">

const props = defineProps({
    modelValue: Boolean,
    titre: String,
    question: String,
})

const emits = defineEmits(['update:modelValue', 'confirmer'])

const open = computed({
    get: ()=> props.modelValue,
    set: (newValue) => emits('update:modelValue', newValue)
})
</script>

<style scoped>

</style>