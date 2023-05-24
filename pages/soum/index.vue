<template>
    <v-select v-model="panier.utilisateur"
              :items="users"
              :item-title="(user) => `${user.nom}  ${user.prenom}`"
              return-object
              label="Client"/>
    <v-container>
        <v-row>
            <v-col>
                <v-tabs v-model="filtre"
                        center-active
                        color="primary"
                        slider-color="secondary"
                        align-tabs="center">
                    <v-tab v-for="(typeproduit, index) in typeproduits as Array<TypeProduitInterface>"
                           :key="index"
                           :value="typeproduit._id">{{ typeproduit.nom }}
                    </v-tab>
                </v-tabs>
                <!--            <v-alert v-if="v$Encaisser.articles.$errors.length !==0"-->
                <!--                     type="error"-->
                <!--                     density="compact">-->
                <!--                Pas d'articles sélectionnés.-->
                <!--            </v-alert>-->
            </v-col>
            <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    location="end"
            >
                <template v-slot:activator="{ props }">
                    <v-btn
                            color="indigo"
                            v-bind="props"
                            icon="mdi:mdi-cart"
                    />
                </template>

                <v-card min-width="400">
                    <v-list>
                        <v-list-item
                                prepend-avatar="/192.png"
                                :title="stepPaiement?'Paiement panier':'Total panier'"
                                subtitle="Soum"
                        >
                            <!--                        <template v-slot:append>-->
                            <!--                            <v-btn-->
                            <!--                                    variant="text"-->
                            <!--                                    :class="fav ? 'text-red' : ''"-->
                            <!--                                    icon="mdi:mdi-content-save"-->
                            <!--                                    @click="fav = !fav"-->
                            <!--                            ></v-btn>-->
                            <!--                        </template>-->
                        </v-list-item>
                    </v-list>
                    <v-divider></v-divider>
                    <div v-if="panier.articles.length === 0">Pas d'article dans le panier.</div>
                    <v-list v-else-if="!stepPaiement">
                        <v-list-item v-for="(article, index) in panier.articles"
                                     :key="index"
                        >
                            <v-container>
                                <v-row class="align-center justify-space-between">
                                    {{ `${article.quantite}x ${article.nom}` }}
                                    <v-btn-group>
                                        <v-btn icon="mdi:mdi-plus"/>
                                        <v-btn icon="mdi:mdi-minus"/>
                                        <v-btn icon="mdi:mdi-delete"/>
                                    </v-btn-group>
                                </v-row>
                            </v-container>
                        </v-list-item>
                    </v-list>
                    <v-list v-else>
                        <v-list-item>

                        </v-list-item>
                    </v-list>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                                variant="text"
                                @click="menu = false"
                        >
                            Cancel
                        </v-btn>
                        <v-btn
                                color="primary"
                                variant="text"
                                @click="()=> stepPaiement?'':stepPaiement=true "
                        >
                            Save
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </v-row>
        <v-row>
            <v-col>
                <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
                <div v-else>
                    <produits-list :key="panier"
                                   v-model="panier.articles"
                                   :filters="[
                                                   {by:'type._id', value:filtre as string},
                                                   ] as Array<ProduitsListFilterInterface>"
                                   :produits-dispo-list="produitToScreen"/>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import TypeProduitInterface from "~/interfaces/TypeProduitInterface";
import UserInterface from "~/interfaces/UserInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import UsersResponseInterface from "~/interfaces/UsersResponseInterface";
import ValeurBNResponseInterface from "~/interfaces/ValeurBNResponseInterface";
import ProduitsListFilterInterface from "~/interfaces/ProduitsListFilterInterface";
import {useMenuStore} from "~/stores/menuStore";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import ArticlePotInterface from "~/interfaces/potsInterfaces/ArticlePotInterface";

interface PanierSoumInterface {
    articles: Array<ArticlePotInterface>
    utilisateur?: UserInterface
    paiementCompte: number
    paiementCheque: number
    paiementEspece: number
    paiementVirement: number
    rendreMonnaie: number
}

/** REFS */
const panier = ref<PanierSoumInterface>({
    articles: [],
    utilisateur: undefined,
    paiementCompte: 0,
    paiementCheque: 0,
    paiementEspece: 0,
    paiementVirement: 0,
    rendreMonnaie: 0,
})
const users = ref<Array<UserInterface>>([])
const typeproduits = ref<Array<TypeProduitInterface>>([])
const produitToScreen = ref<Array<ProduitInterface>>([])
const filtre = ref<string>('')
const colorAlertPaiement: Ref<Array<string>> = ref([])
const valeurPoint: Ref<number> = ref(0)
const show: Ref<boolean> = ref(false)
const openDialogValidation: Ref<boolean> = ref(false)
const menu = ref<boolean>(false)
const fav = ref<boolean>(true)
const stepPaiement = ref<boolean>(false)

/** STORES */

/** Gestion du Titre dans l'APPBAR*/
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = "Soum"

/** Gestion du message success or error de App.vue */
const {
    putSnackBarMessage
} = useSnackbarStore()

/** VUELIDATE */

// /** Règles vuelidate utilisées pour l'encaissement */
// const rulesEncaisser = {
//     articles: {required}
// }

// const v$Encaisser = useVuelidate(rulesEncaisser, pot)

/** LIFECYCLE */

/** Chargement des données après le montage du composant dans le dom */
onMounted(() => {
    Fetch.requete({url: '/parametre/valeurBN', method: 'GET'}, (resultBN: ValeurBNResponseInterface) => {
        valeurPoint.value = Number(resultBN.valeur)
    })

    Fetch.requete({
        url: '/typeproduits',
        method: 'POST',
        data: {"proposableSoum": true}
    }, (resultTypeproduits: Array<TypeProduitInterface>) => {
        Fetch.requete({url: '/soum', method: 'POST'}, (resultProduits: {
            produits: Array<ProduitInterface>
        }) => {
            typeproduits.value = resultTypeproduits
            filtre.value = resultTypeproduits[0]._id || ''
            const produitsWithStock = resultProduits.produits.filter(produit => produit.nombre > 0)
            const produitsWithoutStock = resultProduits.produits.filter(produit => produit.nombre === 0)
            produitToScreen.value = produitsWithStock.concat(produitsWithoutStock)
        })
    })
    Fetch.requete({
        url: '/users',
        data: {page: 1, nombre: 1000, isDesactive: false}
    }, (resultUtil: UsersResponseInterface) => {
        users.value = resultUtil.documents
    })
})

watch(() => panier.value.articles, nv => console.log(nv))

// const loading: Ref<boolean> = ref(false)
// const openDialog: Ref<boolean> = ref(false)
// const openTicketJour: Ref<boolean> = ref(false)
//
// const typeProduits: Ref<Array<TypeProduitInterface>> = ref([] as Array<TypeProduitInterface>)
// const typeProduitSelectionne: Ref<TypeProduitInterface> = ref({} as TypeProduitInterface)
// const idTab: Ref<Number> = ref(0)
// const infoDetaillee: Ref<boolean> = ref(false)
// const valeurPoint: Ref<Number> = ref(0)
//
// const users: Ref<Array<UserInterface>> = ref({} as Array<UserInterface>)
// const compteTemporaire: Ref<Number> = ref(0)
// const produits: Ref<Array<ProduitInterface>> = ref({} as Array<ProduitInterface>)
// const produitsConsomme: Ref<Array<ProduitInterface>> = ref({} as Array<ProduitInterface>)
//
// const totalPanierBeeNews: Ref<Number> = ref(0)
// const totalPanierEuros: Ref<Number> = ref(0)
// const manqueEuro: Ref<Number> = ref(0)
// const manqueBeeNews: Ref<Number> = ref(0)
// const rendreMonnaie: Ref<Number> = ref(0)
//
// const paiementCompte2: Ref<string> = ref("")
// const paiementCheque2: Ref<string> = ref("")
// const paiementEspece2: Ref<string> = ref("")
// const paiementVirement2: Ref<string> = ref("")
// const calculerPanier: Ref<boolean> = ref(false)
//
// const user: Ref<UserInterface> = ref({} as UserInterface)
//
// const chargementInitial = () => {
//
//   const promiseUsers = new Promise(resolve => {
//     Fetch.requete({ url: '/users', data: { page: 1, nombre: 1000, isDesactive: false } }, (resultUtil: UsersResponseInterface) => {
//         users.value = resultUtil.documents
//       return resolve(resultUtil)
//     });
//   });
//
//   const promiseTypesProduits = new Promise(resolve => {
//     Fetch.requete({ url: '/typeproduits' }, (result: [TypeInterface]) =>
//         typeProduits.value = result.map(item => ({
//           _id: item._id, nom: item.nom, proposablePot: item.proposablePot, proposableSoum: item.proposableSoum, nombreProduits: item.nombreProduits,  selectionne: false
//         })));
//   })
//
//   const promisesProduits = new Promise(resolve => {
//     promiseTypesProduits.then(() => {Fetch.requete({ url: '/soum' }, (result: ProduitsResponseInterface) => {
//       produits.value = result.documents
//       if (typeProduits.value.length > 0) {
//         typeProduitSelectionne.value = typeProduits.value[0];
//       }
//       resolve(result);
//     })})
//
//   });
//
//   const promiseValeurPoint = new Promise(resolve => {
//     Fetch.requete({ url: '/parametre/valeurBN', method: 'GET' }, (result: ValeurBNResponseInterface) => {
//       valeurPoint.value = result.valeurBN
//       resolve(result);
//     });
//   })
//
//   Promise.all([promiseUsers, promisesProduits, promiseValeurPoint]).then(() => {
//     let panierTmp = localStorage.getItem('panier');
//     if (typeof panierTmp === 'string') {
//       // SUppression du panier tmp
//       localStorage.removeItem('panier');
//
//       // Transformation en objet JSON
//       panierTmp = JSON.parse(panierTmp);
//
//       const date = new Date();
//       const datePanier = new Date(panierTmp?.date);
//
//       if (datePanier.getFullYear() === date.getFullYear() &&
//           datePanier.getMonth() === date.getMonth() &&
//           datePanier.getDate() === date.getDate()) {
//
//         panierTmp.panier.forEach(item => {
//           for (let i = 0; i < item.nombre; i++) {
//             this.ajouterProduitPanier(item.produit._id, item.produit.type._id);
//           }
//         });
//
//         const utilisateur = this.state.utilisateurs.find(item => item._id === panierTmp.utilisateur);
//         if (utilisateur) {
//           this.setState({ utilisateur });
//         }
//
//       }
//     };
//
//     this.setState({
//       chargement: false
//     });
//   });
// }
//
// changementUtilisateur = event => {
//
//   this.setState(state => ({ utilisateur: state.utilisateurs.find(item => item._id === event.target.value), calculerPanier: true }));
//
// }
//
// componentDidMount() {
//   this.chargementInitial();
// }
//
//
// componentWillUnmount() {
//   // Enregistrement du panier
//   const panierTmp = this.state.produitsConsomme;
//   if (panierTmp.length) {
//     localStorage.setItem('panier', JSON.stringify({ panier: panierTmp, date: new Date(), utilisateur: this.state.utilisateur._id }));
//   }
// }
//
// ajouterProduitPanier = (idProduit, idType) => {
//   let articleConsomme = this.state.produitsConsomme.find(item => item.produit._id === idProduit);
//
//   const type = this.state.typeProduits.find(item => item._id === idType);
//   const produit = type.produits.find(item => item._id === idProduit);
//
//   let { compteTemporaire, produitsConsomme } = this.state;
//
//   if (produit && produit.nombre - produit.reserve) {
//
//
//     if (produit.credit > 0) {
//       compteTemporaire += produit.credit;
//     }
//
//     if (!articleConsomme) {
//       articleConsomme = {
//         produit,
//         nombre: 0
//       }
//       produitsConsomme.push(articleConsomme);
//     }
//
//     articleConsomme.nombre++;
//     produit.reserve++;
//
//     this.setState({ produitsConsomme: this.state.produitsConsomme, compteTemporaire, calculerPanier: true });
//
//   }
// }
//
// supprimerProduitPanier = (idProduit, idType) => {
//   const nombreReserve = this.state.produitsConsomme.find(item => item.produit._id === idProduit).nombre;
//   const type = this.state.typeProduits.find(item => item._id === idType);
//   const produit = type.produits.find(item => item._id === idProduit);
//   produit.reserve -= nombreReserve;
//
//   let { compteTemporaire } = this.state;
//   if (produit.credit > 0) {
//     compteTemporaire -= produit.credit * nombreReserve
//   }
//
//   const produitsConsomme = this.state.produitsConsomme.filter(item => item.produit._id !== idProduit);
//   this.setState({ produitsConsomme, compteTemporaire, calculerPanier: true });
//
// }
//
// retirerUnProduitPanier = (idProduit, idType) => {
//
//   let { compteTemporaire, produitsConsomme } = this.state;
//
//   const produitConsomme = produitsConsomme.find(item => item.produit._id === idProduit);
//   produitConsomme.nombre--;
//
//   const type = this.state.typeProduits.find(item => item._id === idType);
//   const produit = type.produits.find(item => item._id === idProduit);
//   produit.reserve -= 1;
//
//   if (produit.credit > 0) {
//     compteTemporaire -= produit.credit;
//     this.setState({ compteTemporaire });
//   }
//
//   if (produitConsomme.nombre === 0) {
//     produitsConsomme = produitsConsomme.filter(item => item.produit._id !== idProduit);
//   }
//
//   this.setState({ produitsConsomme, compteTemporaire, calculerPanier: true });
//
//
//
// }
//
// validerPanier = () => {
//
//   const paiementCheque2 = this.state.paiementCheque2.toString().replace(',', '.');
//   const paiementEspece2 = this.state.paiementEspece2.toString().replace(',', '.');
//   const paiementVirement2 = this.state.paiementVirement2.toString().replace(',', '.');
//
//   const paiementCheque = isNaN(parseFloat(paiementCheque2)) ? 0 : parseFloat(paiementCheque2);
//   const paiementEspece = isNaN(parseFloat(paiementEspece2)) ? 0 : parseFloat(paiementEspece2);
//   const paiementVirement = isNaN(parseFloat(paiementVirement2)) ? 0 : parseFloat(paiementVirement2);
//
//
//   const panier = {
//     articles: this.state.produitsConsomme.map(item => (
//         {
//           nom: item.produit.nom,
//           produit: item.produit._id,
//           prix: item.produit.prix,
//           credit: item.produit.credit,
//           prixEuros: item.produit.prixEuros,
//           quantite: item.nombre
//         }
//     )),
//     utilisateur: this.state.utilisateur,
//     paiementCompte: this.state.paiementCompte2,
//     paiementCheque,
//     paiementEspece,
//     paiementVirement,
//     rendreMonnaie: this.state.rendreMonnaie
//   }
//
//   Fetch.requete({ url: '/soum/panier', data: { panier } }, reponse => {
//     this.setState({ openDialog: false });
//     this.chargementInitial();
//   });
// }
//
//
// changerPaiement2 = event => {
//   let value = event.target.value;
//   value = value.replace('.', ',');
//   var regexp = /^[0-9]*$|^[0-9]*,$|^[0-9]*,[0-9]*$/gi;
//   if (Array.isArray(value.match(regexp))) {
//     this.setState({ [event.target.name]: value, calculerPanier: true });
//   }
// }
//
//
//
// afficherTypeProduits = (e, identifiant) => {
//   this.setState(state => ({ idTab: identifiant, typeProduitSelectionne: state.typeProduits[identifiant] })); //.filter(item => item._id === identifiant)[0] }));
// }
//
//
// recalculerPanier = () => {
//   new Promise(resolve => {
//
//
//     this.setState(state => {
//
//       const totalPanierBeeNews = parseFloat(state.produitsConsomme.map(item => item.produit.prix * item.nombre).reduce((a, b) => a + b, 0));
//       const totalPanierEuros = parseFloat(state.produitsConsomme.map(item => item.produit.prixEuros * item.nombre).reduce((a, b) => a + b, 0));
//       let paiementCompte2 = state.paiementCompte2.toString().replace(',', '.');
//
//       let paiementCompte = isNaN(parseFloat(paiementCompte2)) ? 0 : parseFloat(paiementCompte2);
//
//
//       const maxCompte = parseInt(this.state.utilisateur.compte) + this.state.compteTemporaire;
//
//       if (paiementCompte > maxCompte) {
//         paiementCompte = maxCompte;
//       }
//
//       if (paiementCompte > totalPanierBeeNews) {
//         paiementCompte = totalPanierBeeNews;
//       }
//
//       const paiementCheque2 = state.paiementCheque2.toString().replace(',', '.');
//       const paiementEspece2 = state.paiementEspece2.toString().replace(',', '.');
//       const paiementVirement2 = state.paiementVirement2.toString().replace(',', '.');
//
//       const paiementCheque = isNaN(parseFloat(paiementCheque2)) ? 0 : parseFloat(paiementCheque2);
//       const paiementEspece = isNaN(parseFloat(paiementEspece2)) ? 0 : parseFloat(paiementEspece2);
//       const paiementVirement = isNaN(parseFloat(paiementVirement2)) ? 0 : parseFloat(paiementVirement2);
//
//       let manqueBeeNews = totalPanierBeeNews - paiementCompte;
//       let manqueEuro = totalPanierEuros - (paiementCheque + paiementEspece + paiementVirement);
//       let rendreMonnaie = 0;
//
//       if (manqueEuro < 0) {
//         rendreMonnaie = -manqueEuro;
//         manqueEuro = 0;
//         if (manqueBeeNews >= rendreMonnaie / state.valeurPoint) {
//           manqueBeeNews -= (rendreMonnaie / state.valeurPoint);
//           rendreMonnaie = 0;
//         } else {
//           rendreMonnaie -= manqueBeeNews * state.valeurPoint;
//           manqueBeeNews = 0;
//         }
//       }
//       rendreMonnaie = rendreMonnaie.toFixed(2);
//
//       return {
//         totalPanierBeeNews, totalPanierEuros, manqueEuro, manqueBeeNews, paiementCompte2: paiementCompte, rendreMonnaie, calculerPanier: false
//       }
//
//     });
//     resolve();
//
//   });
// }
//
// ouvrirValidationPanier = () => {
//   this.setState({ openDialog: true });
// }
//
// handleCloseValidationPanier = () => {
//   this.setState({ openDialog: false });
// }
//
// handleCloseTicketJour = () => {
//   this.setState({ openTicketJour: false });
// }
//
// ouvrirTicketJour = () => {
//
//   Fetch.requete({ url: '/planning/barmanJour', method: 'GET' }, result => {
//
//     let message = [];
//
//     if (result.data !== 'personne') {
//
//       const barman = result.data.barman;
//       const barmanRecompense = result.data.barmanRecompense;
//
//       if (barman) {
//         message.push(<div>Le barman sur le planning est {barman.nom} {barman.prenom}. </div>);
//       }
//       if (barmanRecompense) {
//         message.push(<div>Le barman recompensé est {barmanRecompense.nom} {barmanRecompense.prenom}. </div>);
//       } else {
//         message.push(<div>Aucun barman a reçu une récompense. </div>);
//       }
//       message.push(<div>&nbsp;</div>);
//     }
//     this.setState({ openTicketJour: true, message });
//
//   });
//
//
//
// }
//
// confirmerTicketJour = () => {
//   Fetch.requete({ url: '/soum/ticketjour', method: 'POST' }, result => {
//     window.open(`${Constantes.url}v1/pdf/ticketJour?token=${result.ticket}&mail`, '_blanck');
//     this.handleCloseTicketJour();
//   });
//
// }
</script>

<style scoped>


</style>