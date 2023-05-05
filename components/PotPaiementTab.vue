<template>
    <v-col>
        <v-table density="compact">
            <thead>
            <tr>
                <th class="pa-0">Nom</th>
                <th class="pa-0">Espèce</th>
                <th class="pa-0">Chèque</th>
                <th class="pa-0">Virement</th>
            </tr>
            </thead>
            <tbody>
                <slot/>
            </tbody>
        </v-table>
    </v-col>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>