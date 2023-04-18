<template>
  {{menus}}
</template>

<script setup lang="ts">
import MenuInterface from "~/interfaces/MenuInterface";
import {watch} from "@vue/runtime-core";
import {onMounted} from "#imports";

const props = defineProps({
  menus: Object as () => MenuInterface,
})

onMounted(()=>{
  console.log('mounted',props.menus)
})

watch(() => props.menus, newValue =>{
  console.log(newValue)
})

</script>

<style scoped>

</style>