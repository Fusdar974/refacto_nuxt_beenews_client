<template>

<!--    <div>-->
<!--        {!actionUtilisateur && <div>-->

<!--        <Grid style={{ maxWidth: '800px' }} container alignItems="center" justify="space-between">-->
<!--        <Grid item >-->
<!--            <Hidden mdUp>-->
<!--                <h3>Pots </h3>-->
<!--            </Hidden>-->
<!--            <Hidden smDown>-->
<!--                <h1>Pots </h1>-->
<!--            </Hidden>-->
<!--        </Grid>-->
<!--        <Grid item>-->
<!--            <Button-->
<!--                variant="contained"-->
<!--                size="small"-->
<!--                color="secondary"-->
<!--                startIcon={<div className={'mdi mdi_small mdi-plus'} />}-->
<!--            onClick={this.ajouter} >Créer</Button>-->
<!--        </Grid>-->
<!--        </Grid>-->
<!--        {!loading && pots.length > 0 &&-->
<!--        <div style={{ maxWidth: '800px' }}>-->

<!--        <Table size="small" aria-label="a dense table">-->
<!--            <TableHead>-->
<!--                <TableRow>-->
<!--                    <TableCell align="center">Date</TableCell>-->
<!--                    <TableCell align="center">Titre</TableCell>-->
<!--                    <TableCell align="center" className="disparaitre">Etat</TableCell>-->
<!--                    <TableCell align="center">Actions</TableCell>-->

<!--                </TableRow>-->
<!--            </TableHead>-->
<!--            <TableBody>-->
<!--                {pots.map((item) => (-->
<!--                <TableRow key={item._id} onClick={() => this.modifier(item._id)} style={{ backgroundColor: item.etat === 'Payé' ? 'rgb(237, 247, 237)' : 'rgb(255, 244, 229)' }}>-->
<!--                <TableCell align="center">{this.formater(item.date)}</TableCell>-->
<!--                <TableCell align="center">{item.titre}</TableCell>-->
<!--                <TableCell className="disparaitre" align="center">{item.etat}</TableCell>-->
<!--                <TableCell align="center"> <ButtonGroup size="small" variant="contained" color="primary" aria-label="contained primary button group">-->

<!--                    <Button onClick={e => this.modifier(item._id, e)}><div className={'mdi mdi_small mdi-pencil'} /></Button>-->
<!--                    {-->
<!--                    item.etat === 'Créé' &&-->
<!--                    <Button onClick={e => this.supprimer(item._id, e)}><div className={'mdi mdi_small mdi-delete'} /></Button>-->
<!--                    }-->
<!--                </ButtonGroup></TableCell>-->
<!--                </TableRow>-->
<!--                ))}-->
<!--            </TableBody>-->
<!--        </Table>-->

<!--        <br />-->
<!--        <FormControl>-->
<!--            <ButtonGroup>-->
<!--                {this.createLien()}-->
<!--            </ButtonGroup>-->
<!--        </FormControl>-->
<!--    </div>-->
<!--        }-->

<!--        {!loading && pots.length === 0 &&-->
<!--        <div style={{ maxWidth: '800px' }}>-->
<!--        Il n'y a aucun pot.-->
<!--    </div>-->
<!--    }-->
<!--    {-->
<!--    loading &&-->
<!--    <Grid container spacing={2} alignItems="center">-->
<!--        <Grid item>-->
<!--            <CircularProgress />-->
<!--        </Grid>-->
<!--        <Grid item xs>-->
<!--            Chargement ...-->
<!--        </Grid>-->
<!--    </Grid>-->
<!--    }-->
<!--    </div>-->
<!--    }-->
<!--    {-->
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
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import PotsForm from "~/forms/PotsForm.vue";
import PotsResponseInterface from "~/interfaces/PotsResponseInterface";
const date: Ref<string> = ref('')

const loading: Ref<boolean> = ref(false)
const pots: Ref<any> = ref([])
const nombreParPage: Ref<number> = ref(10)
const total: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
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
        data: { page: page.value } }, (reponse: PotsResponseInterface)=>{
        pots.value = reponse.documents
        total.value = reponse.total
        page.value = reponse.page
        loading.value = false
        actionUtilisateur.value = false
    });
}

</script>

<style scoped>


</style>