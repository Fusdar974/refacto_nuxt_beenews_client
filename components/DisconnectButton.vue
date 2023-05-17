<template>
  <div>
    <v-btn prepend-icon="mdi:mdi-logout"
           size="small"
           @click="foncDeco"
           class="disconnectButton">
      Déconnecter
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import LoginForm from "~/forms/LoginForm.vue";

const props = defineProps({
  foncDeco: {type: Function, required: true},
})


</script>

<style scoped>
.disconnectButton {
  line-height: 1;
  background-color: rgba(255, 206, 28, 0.87);
  color: black;
}
.disconnectButton:hover {
  background-color: rgba(255,206,28,1);
}
</style>