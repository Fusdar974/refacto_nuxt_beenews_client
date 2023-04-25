<template>
  <div>
    <users-form action="show" :user-id="$route.params.id"/>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  userId: {type: String, required: true},
})

import UsersForm from "~/forms/UsersForm.vue";

</script>

<style scoped>

</style>