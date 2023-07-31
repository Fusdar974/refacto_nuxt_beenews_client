<template>
  <div>
    <v-navigation-drawer
            v-model="drawer"
            :temporary="!mdAndUp"
            :permanent="mdAndUp"
    >
        <v-container>
            <v-row align="center">
                <v-col cols="2" class="pa-1">
                    <div style="height: 40px; width: 40px; background-color: #3f51b5; color: white; border-radius: 20px; text-align: center; line-height: 40px; font-size: 1.3rem">
                        {{ userComputed.initiales }}
                    </div>
                </v-col>
                <v-col cols="6" class="pb-1 pt-1">
                    <p class="noLongWord">{{ userComputed.nom }}</p>
                    <p class="noLongWord">{{ userComputed.prenom }}</p>
                </v-col>
                <v-col cols="3" class="pa-1">
                    <v-btn variant="text"
                           stacked
                           size="small"
                           density="compact"
                           prepend-icon="mdi:mdi-update"
                           style="font-size: 0.9rem"
                           @click="calculateUserBn">{{ userBn }}BN
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
        <v-divider/>
        <slot/>
    </v-navigation-drawer>
  </div >
</template>

<script setup lang="ts">
import {useDisplay} from "vuetify";
import {useAuthenticateStore} from "~/stores/authenticateStore";
import {storeToRefs} from "pinia";

const props = defineProps({
    modelValue: Boolean,
})

const {mdAndUp} = useDisplay()

const {userComputed, userBn} = storeToRefs(useAuthenticateStore())
const {calculateUserBn} = useAuthenticateStore()

const emit = defineEmits(['update:modelValue'])

const drawer = computed({
    get() {
        return props.modelValue || mdAndUp.value
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

</script>

<style lang="scss" scoped>
@use 'vuetify/settings';

.toolbarSpace {
  height: settings.$toolbar-title-extended-padding;
}

.noLongWord {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>