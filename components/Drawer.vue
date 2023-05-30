<template>
  <div>
    <v-navigation-drawer
        v-model="drawer"
        :temporary="!mdAndUp"
        :permanent="mdAndUp"
    >
      <div class="mt-16"></div>
      <v-divider />
      <slot/>
    </v-navigation-drawer>
  </div >
</template>

<script setup lang="ts">
import {useDisplay} from "vuetify";

const props = defineProps({
  modelValue: Boolean,
})

const {mdAndUp} = useDisplay()

const emit = defineEmits(['update:modelValue'])

const drawer = computed({
  get() {
    return props.modelValue || mdAndUp.value
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>

<style lang="scss" scoped>
@use 'vuetify/settings';

.toolbarSpace{
  height: settings.$toolbar-title-extended-padding;
}

</style>