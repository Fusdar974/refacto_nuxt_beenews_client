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
                    <v-btn  color="pink" @click="ajouter()">
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
                            @change="updateCategory(category)"
                            ></v-text-field>
                        </td>
                        <td>
                            <v-checkbox v-model="category.proposablePot" @change="updateCategory(category)" color="pink"></v-checkbox>
                        </td>
                        <td>
                            <v-checkbox v-model="category.proposableSoum" @change="updateCategory(category)" color="pink"></v-checkbox>
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
        <v-row  align="start">
            <v-col cols="auto">
                <v-btn color="primary"  @click="ticketJour()">Ticket jour</v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn color="primary"  @click="consoSoum()">Conso Soum</v-btn>
            </v-col>
            <v-col >
                <v-text-field type="date" v-model="dateDebutConsoSoum" label="Date de début"></v-text-field>
            </v-col>
            <v-col >
                <v-text-field type="date" v-model="dateFinConsoSoum" label="Date de fin"></v-text-field>
            </v-col>
        </v-row>
        <v-row justify="space-between" align="start">
            <v-col cols="auto">
                <v-sheet class="pa-2 ma-2">
                    <h2 class="d-none d-md-flex">Points BN offerts</h2>
                    <h3 class="d-flex d-md-none">Points BN offerts</h3>
                </v-sheet>
            </v-col>
        </v-row>

        <v-row  align="start">
            <v-col>
                <v-text-field type="number" v-model="nombreBnOfferts" label="valeur" :rules="[v => !!v || 'Veuillez rentrer un nombre']"></v-text-field>
            </v-col>
            <v-col>
                <v-select  :items="users" item-title="nom"
                           item-value="_id" v-model="selectedReciever" label="Client"></v-select>
            </v-col>
            <v-col cols="auto">
                <v-btn color="primary"  @click="consoSoum()">Conso Soum</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import Fetch from "~/services/FetchService";
import Category from "~/interfaces/Category";
import {Ref} from "vue";
import serverconfig from "~/serverconfig";

const categorys: Ref<Array<Category>> = ref([])
const dateDebutConsoSoum: Ref<Date> = ref(new Date())
const dateFinConsoSoum: Ref<Date> = ref(new  Date())
const users: Ref<Array<any>> = ref([])
const selectedReciever: Ref<any> = ref({ _id: "", nom: "", prenom: "" })
const nombreBnOfferts: Ref<number> = ref(0)

async function updateCategory(category: Category) {
    if (category.nom !=='') {
        await Fetch.requete({ url: `/typeproduits/${category._id}`, method: 'PUT', data: { typeproduit: category } });
    }
}
function ajouter() {
    const emptyCategory: Category = {
        nom: "",
        proposablePot: false,
        proposableSoum: false
    }
    Fetch.requete({ url: `/typeproduits/create`, method: 'POST', data: { typeproduit: emptyCategory }}, (res: { typeproduit: Category; }) => {
        categorys.value.push(res.typeproduit);
    });
}
function ticketJour() {
    Fetch.requete({ url: '/soum/ticketjour', method: 'POST' }, (res: { ticket: any; }) => {
        window.open(`${serverconfig}v1/pdf/ticketJour?token=${res.ticket}`, '_blanck');
    });
}
function consoSoum() {
    if (dateDebutConsoSoum && dateFinConsoSoum) {
        Fetch.requete({ url: '/parametre/consoSoum', method: 'POST', data: { debut: new Date(dateDebutConsoSoum.value).getTime(), fin: new Date(dateFinConsoSoum.value).getTime() } }, (res: { ticket: any; }) => {
            window.open(`${serverconfig}v1/pdf/consoSoum?token=${res.ticket}`, '_blanck');
        });
    }
}

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


const getCategorys = async ()  =>  {
    await Fetch.requete(Fetch.requete({ url: '/typeproduits'}, (resultat: Array<Category>) => {
        categorys.value = resultat;
    }))
}
const getUsers = ()  =>  {
    Fetch.requete(Fetch.requete({ url: '/users',data: { page: 1, nombre: 1000 }}, (resultat: { documents: any; }) => {
        users.value = resultat.documents;
    }))
}
const getBnState = () => {
    Fetch.requete(Fetch.requete({ url: '/parametre/valeurBN', method: 'GET' }, (resultat:  [Category]) => {
        categorys.value = resultat;
    }))
}


onBeforeMount(async () => {
    await getCategorys();
})
onMounted(()=>{
    getUsers();
})

</script>

<style scoped>

</style>