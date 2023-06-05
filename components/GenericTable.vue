<template>
    <v-table density="compact" hover>
        <thead>
        <tr>
            <th v-for="(attrs, index) in attributes " :key="index" class="text-center">{{ attrs.header }}</th>
            <th v-if="actionsTd">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(obj, index) in objects"
            :style="rowColors ?`background-color: ${rowColors[index]}`:''"
            :key="index"
            @click="() => emits('consulter', obj._id)">
            <td v-for="(attrs, indexAttr) in attributes"
                :key="indexAttr" class="text-center">
                <v-img v-if="attributes[indexAttr].isImage"
                       :style="`max-height: ${maxHeightImg}px; max-width: ${maxWidthImg}px`"
                       :src="serverconfig.concat(reachDepth(attrs.attr, obj))"></v-img>
                <div v-else-if="attributes[indexAttr].isDate">
                    {{
                        new Date(reachDepth(attrs.attr, obj)).toLocaleString('fr-FR', {
                            dateStyle: 'full',
                            timeStyle: 'short'
                        })
                    }}
                </div>
                <div v-else>{{ reachDepth(attrs.attr, obj) }}</div>
            </td>
            <slot v-if="actionsTd" :obj="obj"/>
        </tr>
        </tbody>
    </v-table>
    <v-pagination v-if="nombreParPageComputed !== 'all'"
                  v-model="pageComputed"
                  :length="paginationSizeComputed"
                  prev-icon="mdi:mdi-arrow-left"
                  next-icon="mdi:mdi-arrow-right"/>
    <v-select v-model="nombreParPageComputed"
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
import GenericInterface from "~/interfaces/GenericInterface";

/** REFS */

interface PropsInterface {
    objects: Array<GenericInterface>
    attributes: AttributeInterface[]
    actionsTd?: boolean
    nbParPage: string
    page: number
    paginationSize: number
    maxHeightImg?: number
    maxWidthImg?: number
    rowColors?: Array<string>
}

const props = withDefaults(defineProps<PropsInterface>(), {
    actionsTd: false,
    maxHeightImg: 200,
    maxWidthImg: 200,
})

/** EMITS */

const emits = defineEmits(['update:nbParPage', 'update:page', 'update:pageSize', 'update:openDialog', 'consulter'])

/** COMPUTEDS */

const nombreParPageComputed = computed({
    get: () => props.nbParPage,
    set: (newValueNbP) => emits('update:nbParPage', newValueNbP)
})

const pageComputed = computed({
    get: () => props.page,
    set: (newValue) => emits('update:page', newValue)
})

const paginationSizeComputed = computed({
    get: () => props.paginationSize,
    set: (newValue) => emits('update:pageSize', newValue)
})

/** METHODS */

/**
 * Change le nombre d'objets affichés par pages lorsque la valeur du select est modifiée
 * @param e un évênement
 */
const handleChangeSelect = (e: any) => {
    const valeur = e.target;
    nombreParPageComputed.value = valeur.value;
    return {nombreParPage: valeur.value, loading: true}
}
</script>

<style scoped>
th {
  font-weight: bold !important;
}
</style>