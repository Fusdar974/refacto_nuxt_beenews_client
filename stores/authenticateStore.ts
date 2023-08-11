import {defineStore} from 'pinia'
import MenuInterface from "~/interfaces/MenuInterface";
import JwtPayloadInterface from "~/interfaces/userInterfaces/JwtPayloadInterface";
import jwtDecode from "jwt-decode";
import {useRouter} from "#app";
import Fetch from "~/services/FetchService";
import {onMounted} from "#imports";
import ConnectedUserInterface from "~/interfaces/userInterfaces/ConnectedUserInterface";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";

export const useAuthenticateStore = defineStore('authenticate', () => {

    /** Reference */
    const isAuthenticated = ref<boolean>(false)
    const isLoading = ref<boolean>(false)

    const menus = ref<Array<MenuInterface>>()

    const tokenDecode = ref<JwtPayloadInterface>()

    const profils = ref<Array<string>>([])

    const userBn = ref<number>(0)

    /** Computed */

    const userComputed = computed(() => {
        const user: ConnectedUserInterface = {
            _id: tokenDecode.value?.userId,
            nom: capitalyze(tokenDecode.value?.name),
            prenom: capitalyze(tokenDecode.value?.firstname),
            initiales: `${tokenDecode.value?.name.slice(0, 1)}${tokenDecode.value?.firstname.slice(0, 1)}`.toUpperCase()
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
            if (expire) {
                console.error('Token expiré');
                console.error("Connecté...:", new Date((newTokenDecode.iat || 0) * 1000));
                console.error("Expire.....:", new Date((newTokenDecode.exp || 0) * 1000));
                logout(2) // Réinitialise les droits en cas d'expiration
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
     * Met à jour l'authentification de l'application
     * @param boolAuth
     * @param newMenus
     */
    const setAuthenticate = (boolAuth: boolean, newMenus?: Array<MenuInterface>) => {
        isAuthenticated.value = boolAuth
        menus.value = newMenus || []
        isLoading.value = false
    }

    /**
     * Permet d'authentifier l'utilisateur et de récupérer sa liste de menus
     */
    const login = () => {
        isLoading.value = true
        const token = localStorage.getItem('token');
        if (token) {
            try {
                tokenDecode.value = jwtDecode(token);
            } catch (e) {
                logout(3)
                return
            }
            userBn.value = tokenDecode.value?.wallet ?? 0
            Fetch.requete({
                url: `/users/${tokenDecode.value?.userId}/menus`,
                method: 'GET'
            }, (result : Array<MenuInterface>) => {
                setAuthenticate(true, result)
            }, (result: any) => {
                logout(1)
            })
        }else{
            logout(0)
        }
    }

    /**
     * Met en place la déconnexion de l'utilisateur
     * Step: 0 = empty token
     *       1 = Error GetMenus
     *       2 = token expire
     *       3 = invalide token
     */
    const logout = (step?:number) => {
        console.info("logout - "+step||'other');
        isLoading.value = true
        localStorage.clear()
        setAuthenticate(false); // Réinitialise les droits
        useRouter().push('/')
    }

    /**
     * Récupère en BDD les BN de l'utilisateur
     */
    const calculateUserBn = () => {
        Fetch.requete({url: `/users/${userComputed.value._id}`, method: 'GET'},
            (resultUser: { user: UserInterface }) => {
                userBn.value = resultUser.user.wallet ?? 0
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
        calculateUserBn,
    }
})