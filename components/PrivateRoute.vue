<template>
    <slot v-if="token"/>
    <v-progress-linear v-else indeterminate :height="5"></v-progress-linear>
</template>

<script setup lang="ts">

import jwtDecode from "jwt-decode";
import JwtPayloadInterface from "~/interfaces/loginInterfaces/JwtPayloadInterface";
import {navigateTo, useRouter} from "#app";
import {onBeforeMount} from "#imports";

const token: Ref<string|null> = ref('')
  const privateRoute = () => {
    token.value = localStorage.getItem('token')
    if (token.value) {
      const tokenDecode: JwtPayloadInterface = jwtDecode(token.value)
      const autorizedComponent = tokenDecode.droits.some(item => item.to === useRouter().currentRoute.value.path)
      if (!autorizedComponent) return navigateTo('/')
    } else return navigateTo('/')
  }

  onBeforeMount(() => privateRoute())
</script>

<style scoped>

</style>
