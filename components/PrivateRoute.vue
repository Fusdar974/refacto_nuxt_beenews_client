<template>
    <slot v-if="rights"/>
    <v-progress-linear v-else :indeterminate="true" :height="5"></v-progress-linear>
</template>

<script setup lang="ts">

import jwtDecode from "jwt-decode";
import JwtPayloadInterface from "~/interfaces/userInterfaces/JwtPayloadInterface";
import {navigateTo, useRouter} from "#app";
import {onBeforeMount} from "#imports";
import MenuInterface from "~/interfaces/MenuInterface";

const rights: Ref<string|null> = ref('')
const privateRoute = () => {
    rights.value = localStorage.getItem('rights')
    if (rights.value) {
        const rightsParsed : Array<MenuInterface> = JSON.parse(rights.value || '[]')
        const autorizedComponent = rightsParsed.some((item : MenuInterface) => item.to === useRouter().currentRoute.value.path)
        if (!autorizedComponent) return navigateTo('/')
    } else return navigateTo('/')
}

onBeforeMount(() => privateRoute())
</script>

<style scoped>

</style>
