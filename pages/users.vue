<template>
  <private-route>

  </private-route>
</template>

<script setup lang="ts">

  import UserInterface from "~/interfaces/UserInterface";
  import UsersResponseInterface from "~/interfaces/UsersResponseInterface";

   const loading : Ref<boolean> = ref(false)
   const users: Ref<Array<UserInterface> | null> = ref(null)
   const nombreParPage: Ref<number>= ref(10)
   const total: Ref<number> = ref(0)
   const page: Ref<number> = ref(1)
   const vertical: Ref<string> = ref('top')
   const horizontal: Ref<string> = ref('center')
   const open: Ref<boolean> = ref(false)
   const openDialog: Ref<boolean> = ref(false)


  const setUsers = (usersP : UsersResponseInterface) => {
    const pageMax = Math.ceil(usersP.total / nbParPage);

    return {
      users: usersP.documents,
      total: usersP.total,
      page: usersP.page > pageMax ? pageMax: usersP.page,
      loading: false,
      actionUtilisateur: false
    }
  }
</script>

<style scoped>

</style>