<template>
  <LazyVitePwaManifest/>
  <NuxtLayout>
    <!--        <div class="imageFondChargement"/>-->
    <v-layout v-if="isAuthenticated" class="root">
      <drawer v-model="mobileOpen">
        <v-container style="height: calc(100% - 65px)" class="pb-1">
          <v-row class="h-100">
            <v-col>
              <v-list>
                <v-list-item v-for="(menu, index) in menus as Array<MenuInterface>"
                             :key="index"
                             :value="menu"
                             @click="handleOnClick(menu)"
                             :class="isClickedBtn(menu.to) ? 'current-route' : ''">
                  <template v-slot:prepend>
                    <v-icon v-if="menu.icone" :icon="menu.icone.replace(' ',':')"></v-icon>
                  </template>
                  <v-list-item-title v-if="menu.libelle">{{ menu.libelle }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col class="d-flex align-end justify-center mr-0">
              <disconnect-button :fonc-deco="logout"/>
            </v-col>
          </v-row>
        </v-container>
      </drawer>
      <v-app-bar color="primary" class="appBar">
        <template v-slot:prepend>
          <v-app-bar-nav-icon icon="mdi:mdi-menu"
                              @click="handleDrawerToggle"
                              class="d-md-none"/>
        </template>
        <v-app-bar-title>{{ titleAppBar }}</v-app-bar-title>
        <v-spacer></v-spacer>
        <panier-soum v-if="!panierVide"/>
      </v-app-bar>
      <v-main style="min-height: 300px;">
        <NuxtPage/>
      </v-main>
      <v-snackbar v-model="snackbarStoreOpen"
                  :color="snackbarStoreCouleur"
                  variant="elevated"
                  :timeout="snackbarStoreCouleur === 'error' ? 10000 : 5000">
        <v-container class="pa-3">
          <v-row class="align-center">
            <v-col cols="2">
              <v-icon
                  size="26"
                  :icon="`mdi:mdi-${
                                snackbarStoreCouleur==='success'?'check':'alert'}
                            }-circle-outline`"/>
            </v-col>
            <v-col style="font-size: 1rem">{{ snackbarStoreMessage }}</v-col>
          </v-row>
        </v-container>
      </v-snackbar>
    </v-layout>
    <v-layout v-else class="rootDeco">
      <v-container class="container-deco">
        <v-row class="flex-grow-0">
          <v-col class="imageAccueil"></v-col>
        </v-row>
        <v-row class="flex-grow-0">
          <v-col class="divAccueilConnexion">
            Bienvenue sur votre application du SOUM
          </v-col>
        </v-row>
        <v-row class="flex-grow-0">
          <login-form/>
        </v-row>
      </v-container>
    </v-layout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {useRouter} from "#app";
import MenuInterface from "~/interfaces/MenuInterface";
import DisconnectButton from "~/components/DisconnectButton.vue";
import Drawer from "~/components/Drawer.vue"
import LoginForm from "~/forms/LoginForm.vue";
import {useDisplay} from "vuetify";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {storeToRefs} from "pinia";
import {useAuthenticateStore} from "~/stores/authenticateStore";
import {useMenuStore} from "~/stores/menuStore";
import PanierSoum from "~/components/panierSoum/PanierSoum.vue";
import {usePanierStore} from "~/stores/panierStore";
import Fetch from "~/services/FetchService";
import {Ref} from "vue";

const konamiChaine1 = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].join('/')
const konamiChaine2 = [38, 38, 40, 40, 37, 39, 37, 39, 98, 97].join('/')

const mobileOpen: Ref<boolean> = ref(false)
const lettres: Ref<Array<number>> = ref([])
const konami: Ref<boolean> = ref(false)

/** STORES */

const {mdAndUp} = useDisplay()
const {panierVide} = storeToRefs(usePanierStore())
const {isAuthenticated, menus} = storeToRefs(useAuthenticateStore())
const {login, logout} = useAuthenticateStore()
const {titleAppBar} = storeToRefs(useMenuStore())
const {
  open: snackbarStoreOpen,
  message: snackbarStoreMessage,
  couleur: snackbarStoreCouleur
} = storeToRefs(useSnackbarStore())


const handleDrawerToggle = () => {
  mobileOpen.value = !mobileOpen.value
}

//Met en place la déconnexion de l'utilisateur
Fetch.setFonctionDeco(logout);

const isClickedBtn = (path: string) => useRouter().currentRoute.value.path === path

const handleKeyUp = (e: any) => {
  if (lettres.value.push(e.keyCode) > 10) {
    lettres.value = lettres.value.slice(1)
  }
  const joinedLetters: string = lettres.value.join('/')
  if (joinedLetters === konamiChaine1 || joinedLetters === konamiChaine2) {
    lettres.value = []
    konami.value = true
  }
}

const handleOnClick = (item: MenuInterface) => {
  useRouter().push(item.to)
  if (!mdAndUp) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  if (typeof localStorage.getItem('token') === 'string') {
    //Décode le token de l'utilisateur
    login();
  }
})
</script>
<style>
.root {
  display: flex;
  height: 100vh;
}

.appBar {
  width: 100%;
}

.rootDeco {
  background-color: rgba(255, 181, 81, 0.1);
  box-shadow: 0 0 30px rgba(255, 181, 81, 0.8) inset;
  height: 100vh;
}

.container-deco {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.divAccueilConnexion {
  padding-top: 10px;
  padding-bottom: 20px;
  font-family: "Roboto", serif;
  font-weight: bold;
  text-align: center;
}

.imageAccueil {
  position: relative;
  height: 100px;
  width: 100px;
  background-image: url('/192.png');
  background-size: 100px 100px;
  background-repeat: no-repeat;
  background-position: center;
}

.current-route {
  background-color: rgb(50, 50, 50, 0.1);
}

@keyframes clignotementFG {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: rotate(180deg);
    opacity: 0.5;
  }
  100% {
    transform: rotate(360deg);
    opacity: 1;
  }
}

.imageFondChargement {
  z-index: 0;
  position: absolute;
  bottom: calc(100% / 2 - 100px);
  right: calc(100% / 2 - 240px + 100px);
  height: 200px;
  width: 200px;
  background-image: url('/192.png');
  background-size: 200px 200px;
  background-repeat: no-repeat;
  background-position: center;
  animation: 1s clignotementFG linear infinite;
}

.centerCard {
  width: 300px;
  align-items: center;
  align-self: center;
}

</style>