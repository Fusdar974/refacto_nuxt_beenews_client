<template>

  <v-table density="compact" :hover="true">
    <thead>
    <tr>
      <th v-for="(attrs, index) in attributes " :key="index" class="text-center">{{attrs.header}}</th>
      <th v-if="actionsTd">Actions</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(obj, index) in objects"
        :key="index"
        @click="navigateTo(`${useRouter().currentRoute.value.path}/show/${obj._id}`)">
      <td v-for="(attrs, indexAttr) in attributes"
          :key="indexAttr" class="text-center">
        <v-img v-if="attributes[indexAttr].isImage" style="max-height: 200px; max-width: 200px" :src="serverconfig.concat(reachDepth(attrs.attr, obj))"></v-img>
        <div v-else>{{ reachDepth(attrs.attr, obj) }}</div>
      </td>
      <slot v-if="actionsTd" :obj="obj"/>
    </tr>
    </tbody>
  </v-table>
  <v-pagination v-if="nombreParPage !== 'all'"
                v-model="page"
                :length="paginationSize"
                prev-icon="mdi:mdi-arrow-left"
                next-icon="mdi:mdi-arrow-right"/>
  <v-select v-model="nombreParPage"
            @change="handleChangeSelect"
            :items="[
                          {value:'10', title: '10'},
                          {value:'20', title: '20'},
                          {value:'30', title: '30'},
                          {value:'all', title: 'Tous'},
                          ]"
            item-title="title"
            item-value="value"/>

</template>

<script setup lang="ts">

import AttributeInterface from "~/interfaces/AttributeInterface";
import reachDepth from "../functions/reachDepth";
import serverconfig from "~/serverconfig";
import {useRouter} from "#app";

const props = defineProps( {
  objects: {type: Object  as Object[], required: true},
  attributes: {type: Object as () => AttributeInterface[], required: true},
  actionsTd: {type: Boolean, default: false},
  nbParPage: {type: Number, required: true},
  page: {type: Number, required: true},
  pageSize: {type: Number, required: true},
})

const emits = defineEmits(['update:nbParPage', 'update:page', 'update:pageSize'])

const nombreParPage = computed({
  get: ()=> props.nbParPage,
  set: (newValueNbP) => emits('update:nbParPage', newValueNbP)
})

const page = computed({
  get: ()=> props.page,
  set: (newValue) => emits('update:page', newValue)
})

const paginationSize = computed({
  get: ()=> props.pageSize,
  set: (newValue) => emits('update:pageSize', newValue)
})

/**
 * Change le nombre d'objets affichés par pages lorsque la valeur du select est modifiée
 * @param e un évênement
 */
const handleChangeSelect = (e: any) => {
  const valeur = e.target;
  nombreParPage.value = valeur.value;
  return { nombreParPage: valeur.value, loading: true }
}

</script>

<style scoped>

</style>