<template>
  <NuxtLayout>
    <v-layout v-if="authenticate" class="root">
      <drawer v-model="mobileOpen">
        <v-list>
          <v-list-item v-for="(menu, index) in menus"
                       :key="index"
                       :value="menu"
                       @click="handleOnClick(menu)"
                       :class="isClickedBtn(menu.to) ? 'current-route' : ''">
            <template v-slot:prepend>
              <v-icon v-if="menu.icone" :icon="menu.icone.replace(' ',':')"></v-icon>
            </template>
            <v-list-item-title v-if="menu.libelle" v-text="menu.libelle"></v-list-item-title>
          </v-list-item>
        </v-list>
      </drawer>
      <v-app-bar color="primary" class="appBar">
        <template v-slot:prepend>
          <v-app-bar-nav-icon icon="mdi:mdi-menu"
                              @click="handleDrawerToggle"
                              class="d-md-none"/>
        </template>
        <v-app-bar-title>{{ title }}</v-app-bar-title>
        <v-spacer></v-spacer>
        <disconnect-button :fonc-deco="logout"
                           class="mr-2"/>
      </v-app-bar>
      <v-main style="min-height: 300px;">
        <suspense>
          <NuxtPage :authenticate="authenticate"/>
          <template #fallback>
            <div class="imageFondChargement"/>
          </template>
        </suspense>
      </v-main>
      <v-snackbar v-model="snackbarStoreOpen" timeout="4000">
        <v-alert type="success">{{ snackbarStoreMessage }}</v-alert>
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
          <login-form :submit="login"/>
        </v-row>
      </v-container>
    </v-layout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import jwtDecode from "jwt-decode";
import {useRouter} from "#app";
import {onMounted} from "#imports";
import MenuInterface from "~/interfaces/MenuInterface";
import JwtPayloadInterface from "~/interfaces/JwtPayloadInterface";
import DisconnectButton from "~/components/DisconnectButton.vue";
import Drawer from "~/components/Drawer.vue"
import LoginForm from "~/components/LoginForm.vue";
import {useDisplay} from "vuetify";
import {useSnackbarStore} from "~/stores/snackbarStore";
import {storeToRefs} from "pinia";
import Fetch from "~/services/FetchService";

const konamiChaine1 = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].join('/')
const konamiChaine2 = [38, 38, 40, 40, 37, 39, 37, 39, 98, 97].join('/')
const initMenu: Array<MenuInterface> = [{_id: 1, to: "/", libelle: 'Accueil', auth: false}]

const menus: Ref<Array<MenuInterface>> = ref(initMenu)
const mobileOpen: Ref<boolean> = ref(false)
const authenticate: Ref<boolean> = ref(false)
const title: Ref<string> = ref(initMenu[0].libelle)
const lettres: Ref<Array<number>> = ref([])
const konami: Ref<boolean> = ref(false)

const {mdAndUp} = useDisplay()

const {open: snackbarStoreOpen, message: snackbarStoreMessage} = storeToRefs(useSnackbarStore())

const handleDrawerToggle = () => {
  mobileOpen.value = !mobileOpen.value
}

const setAuthenticate = (boolAuth: boolean, newMenus: Array<MenuInterface>) => {
  authenticate.value = boolAuth
  menus.value = newMenus
}

const login = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const tokenDecode: JwtPayloadInterface = jwtDecode(token);
    localStorage.setItem('idCompte', tokenDecode.userId);

    const expire = new Date((tokenDecode.exp || 0) * 1000) < new Date();
    if (!expire) {
      setAuthenticate(true, tokenDecode.droits);
    } else {
      console.error('Token expiré');
      console.error("Connecté...:", new Date((tokenDecode.iat || 0) * 1000));
      console.error("Expire.....:", new Date((tokenDecode.exp || 0) * 1000));
    }
  }
}

const logout = () => {
  setAuthenticate(false, initMenu);
  useRouter().push('/');
  localStorage.clear();
}

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
  title.value = item.libelle
  if (!mdAndUp) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  if (typeof localStorage.getItem('token') === 'string') {
    login();
  }
})
</script>
<style scoped>
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

</style>