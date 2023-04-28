<template>
<div>
  <users-form :action="action" :user-id="id"/>
</div>
</template>

<script setup lang="ts">

import UsersForm from "~/forms/UsersForm.vue";

const {action,id} = useRoute().params

</script>

<style scoped>

</style>