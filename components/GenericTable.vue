<template>

  <v-table density="compact">
    <thead>
    <tr>
      <th v-for="(attrs, index) in attributes " :key="index" class="text-center">{{attrs.header}}</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(obj, index) in objects" :key="index">
<!--      @click="() => afficherDetail(item._id)"-->
      <td v-for="(attrs, indexAttr) in attributes"
      :key="indexAttr" class="text-center">
        <v-img  v-if="attributes[indexAttr].isImage" :src="serverconfig.concat(reachDepth(attrs.attr, obj))"></v-img>
        <div v-else>{{ reachDepth(attrs.attr, obj) }}</div>
      </td>
      <slot :obj="obj"/>
    </tr>
    </tbody>
  </v-table>

</template>

<script setup lang="ts">

import {Ref} from "vue";
import {SymbolKind} from "vscode-languageserver-types";
import Array = SymbolKind.Array;
import AttributeInterface from "~/interfaces/AttributeInterface";
import reachDepth from "../functions/reachDepth";
import serverconfig from "~/serverconfig";

const props = defineProps({
  objects: {type: Object  as Object[], required: true},
  attributes: {type: Object as () => AttributeInterface[], required: true},
  fonction: {type: Function}
})

</script>

<style scoped>

</style>