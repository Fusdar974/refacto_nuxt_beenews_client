<template>
<div>
  <users-form :action="action" :user-id="id"/>
</div>
</template>

<script setup lang="ts">

import UsersForm from "~/forms/UsersForm.vue";

definePageMeta({
  validate: async (route) => {
    // Check if the id is made up of digits
    return ['show','edit'].includes(route.params.action as string)
        && /[0-9a-zA-Z]{16}/.test(route.params.id as string)
        || route.params.action === 'add' && route.params.id ===''
  }
})

const {action,id} = useRoute().params

</script>

<style scoped>

</style>