<template>
  <div>
    <users-form action="edit" :user-id="$route.params.id"/>
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