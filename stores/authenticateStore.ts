import {defineStore} from 'pinia'
import {Ref} from "vue";
import MenuInterface from "~/interfaces/MenuInterface";
import JwtPayloadInterface from "~/interfaces/JwtPayloadInterface";
import jwtDecode from "jwt-decode";
import {useRouter} from "#app";
import Fetch from "~/services/FetchService";
import {onMounted} from "#imports";

export const useAuthenticateStore = defineStore('authenticate', () => {
    const isAuthenticated: Ref<boolean> = ref(false)
    const isLoading: Ref<boolean> = ref(false)

    const initMenu = <Array<MenuInterface>>[{
        _id: 1,
        to: "/",
        libelle: 'Accueil',
        auth: false
    }]
    const menus = ref<Array<MenuInterface>>(initMenu)

    const tokenDecode = ref<JwtPayloadInterface>()

    const userComputed = computed(() => {
        const user = {
            nom: capitalyze(tokenDecode.value?.nom),
            prenom: capitalyze(tokenDecode.value?.prenom),
            compte: tokenDecode.value?.compte,
            initiales: `${tokenDecode.value?.nom.slice(0, 1)}${tokenDecode.value?.prenom.slice(0, 1)}`.toUpperCase()
        }
        return tokenDecode.value ? user : {}
    })

    const capitalyze = (s: string = '') =>
        `${s.slice(0, 1).toUpperCase()}${s.slice(1, s.length).toLowerCase()}`

    const setAuthenticate = (boolAuth: boolean, newMenus: Array<MenuInterface>) => {
        isAuthenticated.value = boolAuth
        menus.value = newMenus
        isLoading.value = false
    }
    const login = () => {
        isLoading.value = true
        const token = localStorage.getItem('token');
        if (token) {
            tokenDecode.value = jwtDecode(token);
        }
    }

    const logout = () => {
        isLoading.value = true
        setAuthenticate(false, initMenu);
        useRouter().push('/').then(() => localStorage.clear())
    }

    Fetch.setFonctionDeco(logout);

    onMounted(() => {
        if (typeof localStorage.getItem('token') === 'string') {
            login();
        }
    })

    watch(tokenDecode, newTokenDecode => {
        if (newTokenDecode) {
            localStorage.setItem('idCompte', newTokenDecode.userId);
            console.log(userComputed.value)
            const expire = new Date((newTokenDecode.exp || 0) * 1000) < new Date();
            if (!expire) {
                setAuthenticate(true, newTokenDecode.droits);
            } else {
                console.error('Token expiré');
                console.error("Connecté...:", new Date((newTokenDecode.iat || 0) * 1000));
                console.error("Expire.....:", new Date((newTokenDecode.exp || 0) * 1000));
            }
        }
    })

    return {isAuthenticated, login, logout, menus, userComputed}
})