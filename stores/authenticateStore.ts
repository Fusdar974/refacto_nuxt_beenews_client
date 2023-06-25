import {defineStore} from 'pinia'
import {Ref} from "vue";
import MenuInterface from "~/interfaces/MenuInterface";
import JwtPayloadInterface from "~/interfaces/JwtPayloadInterface";
import jwtDecode from "jwt-decode";
import {useRouter} from "#app";
import Fetch from "~/services/FetchService";
import {onMounted} from "#imports";
import UserResponseInterface from "~/interfaces/UserResponseInterface";
import ConnectedUserInterface from "~/interfaces/ConnectedUserInterface";

export const useAuthenticateStore = defineStore('authenticate', () => {

    /** Reference */
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

    const profils = ref<Array<string>>([])

    const userBn = ref<number>(0)

    /** Computed */

    const userComputed = computed(() => {
        const user: ConnectedUserInterface = {
            _id: tokenDecode.value?.userId,
            nom: capitalyze(tokenDecode.value?.nom),
            prenom: capitalyze(tokenDecode.value?.prenom),
            initiales: `${tokenDecode.value?.nom.slice(0, 1)}${tokenDecode.value?.prenom.slice(0, 1)}`.toUpperCase()
        }
        return tokenDecode.value ? user : {
            _id: undefined,
            nom: undefined,
            prenom: undefined,
            compte: undefined,
            initiales: undefined
        }
    })

    const isAdminComputed = computed(() =>
        profils.value.includes('Admin'))

    const isOpenSoumComputed = computed(() =>
        profils.value.includes('OpenSoum'))

    /** Watches */
    watch(tokenDecode, newTokenDecode => {
        if (newTokenDecode) {
            localStorage.setItem('idCompte', newTokenDecode.userId);
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

    /** LifeCycle */
    onMounted(() => {
        if (typeof localStorage.getItem('token') === 'string') {
            login();
        }
    })

    /** Methods */
    /**
     * Permet de mettre la première lettre d'un mot en majuscule
     * @param s
     */
    const capitalyze = (s: string = '') =>
        `${s.slice(0, 1).toUpperCase()}${s.slice(1, s.length).toLowerCase()}`

    /**
     * Met à jour l'autentification de l'application
     * @param boolAuth
     * @param newMenus
     */
    const setAuthenticate = (boolAuth: boolean, newMenus: Array<MenuInterface>) => {
        isAuthenticated.value = boolAuth
        menus.value = newMenus
        isLoading.value = false
    }

    /**
     * Décode le token de l'utilisateur
     */
    const login = () => {
        isLoading.value = true
        const token = localStorage.getItem('token');
        if (token) {
            tokenDecode.value = jwtDecode(token);
            userBn.value = tokenDecode.value?.compte ?? 0
            Fetch.requete({
                url: `/users/${tokenDecode.value?.userId}`,
                method: 'GET'
            }, (resultUser: UserResponseInterface) => {
                profils.value = resultUser.user.profils?.map(profil => profil.nom) ?? []
            })
        }
    }

    /**
     * Met en place la déconnection de l'utilisateur
     */
    const logout = () => {
        isLoading.value = true
        setAuthenticate(false, initMenu);
        useRouter().push('/').then(() => localStorage.clear())
    }

    /**
     * Récupère en BDD les BN de l'utilisateur
     */
    const calculateUserBn = () => {
        Fetch.requete({url: `/users/${userComputed.value._id}`, method: 'GET'},
            (resultUser: UserResponseInterface) => {
                userBn.value = resultUser.user.compte ?? 0
            })
    }

    Fetch.setFonctionDeco(logout);


    return {
        isAuthenticated,
        login,
        logout,
        menus,
        userComputed,
        isAdminComputed,
        isOpenSoumComputed,
        userBn,
        calculateUserBn
    }
})