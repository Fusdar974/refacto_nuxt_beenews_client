<template>
    <slot v-if="token"/>
    <v-progress-linear v-else indeterminate :height="5"></v-progress-linear>
</template>

<script setup lang="ts">

import jwtDecode from "jwt-decode";
import JwtPayloadInterface from "~/interfaces/JwtPayloadInterface";
import {navigateTo, useRouter} from "#app";
import {onBeforeMount} from "#imports";

const rights: Ref<string|null> = ref('')
  const privateRoute = () => {
    rights.value = localStorage.getItem('rights')
    if (rights.value) {
      if (!rights.value) return navigateTo('/')
    } else return navigateTo('/')
  }

  onBeforeMount(() => privateRoute())
</script>

<style scoped>

</style>
