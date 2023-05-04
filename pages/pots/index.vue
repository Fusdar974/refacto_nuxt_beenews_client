<template>
<div>
    <div>
        <v-container class="justify-space-between align-center">
            <v-row>
                <v-col class="text-start">
                    <h3 class="hidden-md-and-up">Pots </h3>
                    <h1 class="hidden-sm-and-down">Pots </h1>
                </v-col>
                <v-col class="text-end">
                    <v-btn variant="flat"
                           color="secondary"
                           prepend-icon="mdi:mdi-plus"
                           @click="navigateTo('/pots/add')" >Créer</v-btn>
                </v-col>
            </v-row>
        </v-container>
        <div v-if="!loading" class="maxW800" >
            <v-table density="comfortable" hover>
                <thead>
                <tr>
                    <th class="align-center">Date</th>
                    <th class="align-center">Titre</th>
                    <th class="align-center">Etat</th>
                    <th class="align-center">Actions</th>
                </tr>
                </thead>
                <tbody v-if="pots !== null">
                <tr v-for="(pot, index) in pots as Array<PotInterface>"
                    :key="index"
                    :style="`background-color: ${pot.etat === 'Payé' ? 'rgb(237, 247, 237)' : 'rgb(255, 244, 229)'}`"
                    @click="navigateTo(`/pots/show/${pot._id}`)">
                    <td class="align-center">{{pot.date}}</td>
                    <td class="align-center">{{pot.titre}}</td>
                    <td class="align-center">{{pot.etat}}</td>
                    <td class="align-center">
                            <v-btn @click="modifier($event, pot._id as string)"><v-icon icon="mdi mdi_small mdi-pencil"></v-icon></v-btn>
                    </td>
                </tr>
                </tbody>
            </v-table>
            <v-pagination v-if="nombreParPage !== 'all'"
                          v-model="page"
                          :length="paginationSize as Number"
                          prev-icon="mdi:mdi-arrow-left"
                          next-icon="mdi:mdi-arrow-right"/>
            <v-select v-model="nombreParPage"
                      :items="[
                          {value:'10', title: '10'},
                          {value:'20', title: '20'},
                          {value:'30', title: '30'},
                          {value:'all', title: 'Tous'},
                          ]"
                      item-title="title"
                      item-value="value"/>

        </div>
    </div>
</div>

<!--    actionUtilisateur &&-->
<!--    <ActionsPots onClose={this.closeAction} params={this.state.action} />-->
<!--    }-->
<!--    <Snackbar-->
<!--        autoHideDuration={1000}-->
<!--        onClose={this.handleClose}-->
<!--        open={open}>-->
<!--        <Alert onClose={this.handleClose} severity="success">{message}</Alert>-->
<!--    </Snackbar>-->

<!--    <Dialog open={openDialog} onClose={handleCloseSupprimer}>-->
<!--        <DialogTitle id="max-width-dialog-title">Confirmation de suppression</DialogTitle>-->
<!--        <DialogContent>-->
<!--            <DialogContentText>-->
<!--                Voulez vous supprimer ce pot ?-->
<!--            </DialogContentText>-->
<!--        </DialogContent>-->
<!--        <DialogActions>-->
<!--            <Button variant="contained" onClick={confirmerSuppression} color="secondary">-->
<!--                Valider-->
<!--            </Button>-->
<!--            <Button variant="contained" onClick={handleCloseSupprimer} color="primary">-->
<!--                Annuler-->
<!--            </Button>-->
<!--        </DialogActions>-->
<!--    </Dialog>-->
<!--    </div >-->
</template>

<script setup lang="ts">
import ArticlePotInterface from "~/interfaces/ArticlePotInterface";
import Fetch from "~/services/FetchService";
import PotsResponseInterface from "~/interfaces/PotsResponseInterface";
import PotInterface from "~/interfaces/PotInterface";

const loading: Ref<boolean> = ref(false)
const pots: Ref<Array<PotInterface>> = ref([] as Array<PotInterface>)
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const paginationSize: Ref<number> = ref(1)
const vertical: Ref<string> = ref('top')
const horizontal: Ref<string> = ref('center')
const open: Ref<boolean> = ref(false)
const openDialog: Ref<boolean> = ref(false)

const actionUtilisateur: Ref<boolean> = ref(false)
const pot: Ref<ArticlePotInterface> = ref({} as ArticlePotInterface)

// const setpots = (potsP) => {
//     pots.value = potsP.documents
//     total.value = potsP.total
//     page.value = potsP.page
//     loading.value = false
//     actionUtilisateur.value = false
// }

// watch(() => articlesTest.value?.[1].quantite, nv => console.log(nv))

const recharger = () => {
    loading.value =  true
    Fetch.requete({
        url: '/pots',
        data: { page: page.value, nombre: nombreParPage.value } }, (reponse: PotsResponseInterface)=>{
        paginationSize.value = Math.ceil(reponse.total / nombreParPage.value)
        pots.value = reponse.documents
        total.value = reponse.total
        page.value = reponse.page
        loading.value = false
        actionUtilisateur.value = false
    });
}
onMounted(() =>{
    recharger()
})

watch(page, () => recharger())
watch(nombreParPage, () => recharger())

const modifier = (event: Event, id: string) => {
    event.stopPropagation()
    //message.value = "modification OK"
    if(id)
        navigateTo(`/pots/edit/${id}`)
}

</script>

<style scoped>


</style>