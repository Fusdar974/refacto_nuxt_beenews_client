<template>
    <v-container>
        <v-row justify="space-between" align="start">
            <v-col cols="auto">
                <v-sheet class="pa-2 ma-2">
                    <h2 class="d-none d-md-flex">Catégories</h2>
                    <h3 class="d-flex d-md-none">Catégories</h3>
                </v-sheet>

            </v-col>
            <v-col cols="auto" >
                <v-sheet class="pa-2 ma-2">
                    <v-btn  color="pink">
                        + CRÉER
                    </v-btn>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row align="center">
            <v-col  >
                <v-table>
                    <thead>
                    <tr>
                        <th class="text-left">
                            Nom
                        </th>
                        <th class="text-left">
                            Pot
                        </th>
                        <th class="text-left">
                            Soum
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                        v-for="category in categorys"
                        :key="category._id"
                    >
                        <td>
                            <v-text-field
                            v-model="category.nom"
                            :rules="[v => !!v || 'Veuillez rentrer un nom']"
                            onchange="updateCategoryName(event, category._id)"
                            ></v-text-field>
                        </td>
                        <td>
                            <v-checkbox v-model="category.proposablePot"></v-checkbox>
                        </td>
                        <td>
                            <v-checkbox v-model="category.proposableSoum"></v-checkbox>
                        </td>
                        <td>{{ category.nombreProduits }} produits en stock</td>
                    </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
        <v-row justify="space-between" align="start">
            <v-col cols="auto">
                <v-sheet class="pa-2 ma-2">
                    <h2 class="d-none d-md-flex">Export</h2>
                    <h3 class="d-flex d-md-none">Export</h3>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import Fetch from "~/services/FetchService";
import Category from "~/interfaces/Category";
import {Ref} from "vue";
const categorys: Ref<Array<Category>> = ref([])

// const updateCategoryName = (event: any, identifiant: string) => {
//     const type = categorys.value.find(item => item._id === identifiant);
//     if (event.target.name !== 'nom') {
//         type[event.target.name] = !type[event.target.name];
//     } else {
//         type[event.target.name] = event.target.value;
//     }
//     Fetch.requete({ url: `/typeproduits/${identifiant}`, method: 'PUT', data: { typeproduit: type } }, res => {
//         console.log(res)
//     })
// }
//
// const ajouter = () => {
//     const data = {
//         typeproduit: {
//             nom: "",
//             proposablePot: false,
//             proposableSoum: false
//         }
//     }
//     Fetch.requete({ url: `/typeproduits/create`, method: 'POST', data }, result => {
//         const { types } = this.state;
//         types.push(result.typeproduit);
//         this.setState({ types });
//     })
// }
//
// const supprimerTypeProduit = (identifiantASupp: number) => {
//     this.setState({ identifiantASupp, openDialog: true });
// }
//
// const handleCloseSupprimer = () => {
//     this.setState({ openDialog: false });
// }
//
// const confirmerSuppression = () => {
//     const identifiant = this.state.identifiantASupp;
//
//     Fetch.requete({ url: `/typeproduits/${identifiant}`, method: 'DELETE' }, result => {
//         let { types } = this.state;
//         types = types.filter(item => item._id !== identifiant);
//         this.setState({ types, openDialog: false });
//     });
// }
//
// const changementBN = (e: any) => {
//     let valeurBN = e.target.value;
//     if (valeurBN < 0) {
//         valeurBN = 0;
//     }
//
//     Fetch.requete({
//         url: '/parametre/valeurBN', method: 'POST', data: {
//             valeur: valeurBN
//         }
//     }, () => {
//         this.setState(state => ({ valeurBN }));
//     })
// }
//
// const changementPointOffert = (e: any) => {
//     let nbPointOffert = e.target.value;
//     if (nbPointOffert < 0) {
//         nbPointOffert = 0;
//     }
//     this.setState({ nbPointOffert });
// }
//
// const changementUtilisateur = (e: any) => {
//
//     this.setState(state => ({
//         userSelect: state.users.find(item => item._id === e.target.value)
//     }));
// }
//
// const offrirBN = (e: any) => {
//     let errornbPointOffert = false;
//     let errorSelectClient = false;
//
//     if (this.state.userSelect._id === 'noSelect') {
//         errorSelectClient = true;
//     }
//
//     if (this.state.nbPointOffert === 0) {
//         errornbPointOffert = true;
//     }
//
//     if (errornbPointOffert || errorSelectClient) {
//         this.setState(state => ({
//             errornbPointOffert, errorSelectClient
//         }))
//     } else {
//         Fetch.requete({
//                 url: `/users/offrir/${this.state.userSelect._id}`,
//                 method: 'POST',
//                 data: { pointOffert: this.state.nbPointOffert, commentaires: 'Ajout exceptionnel' }
//             },
//             reussite => {
//                 this.setState(state => ({
//                     errornbPointOffert, errorSelectClient,
//                     nbPointOffert: 0,
//                     userSelect: { _id: 'noSelect' },
//                 }))
//             }
//         );
//     }
// }
//
// const ticketJour = () => {
//     Fetch.requete({ url: '/soum/ticketjour', method: 'POST' }, result => {
//         window.open(`${Constantes.url}v1/pdf/ticketJour?token=${result.ticket}`, '_blanck');
//     });
// }
//
//
// const consoSoum = () => {
//     if (this.state.dateDebutConsoSoum && this.state.dateFinConsoSoum) {
//         Fetch.requete({ url: '/parametre/consoSoum', method: 'POST', data: { debut: this.state.dateDebutConsoSoum.getTime(), fin: this.state.dateFinConsoSoum.getTime() } }, result => {
//             window.open(`${Constantes.url}v1/pdf/consoSoum?token=${result.ticket}`, '_blanck');
//         });
//     }
// }
//
// const consoSoumHandleDateFinChange = (date: Date) => {
//
//     this.setState(state => {
//         state.dateFinConsoSoum = date;
//         return { dateFinConsoSoum: state.dateFinConsoSoum }
//     });
// };
//
// const consoSoumHandleDateDebutChange = (date: Date) => {
//
//     this.setState(state => {
//         state.dateDebutConsoSoum = date;
//         return { dateDebutConsoSoum: state.dateDebutConsoSoum }
//     });
// };


const getCategorys = () => {
    Fetch.requete(Fetch.requete({ url: '/typeproduits' }, (resultat: Array<Category>) => {
        categorys.value = resultat;
    }))
}
const getBnState = () => {
    Fetch.requete(Fetch.requete({ url: '/parametre/valeurBN', method: 'GET' }, (resultat:  [Category]) => {
        categorys.value = resultat;
    }))
}


onMounted(()=>{
    getCategorys();
})
</script>

<style scoped>

</style>