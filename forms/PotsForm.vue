<template>
    <h2>{{ title }}</h2>
    <v-container>
        <v-row>
            <v-col sm="12" md="8">
                <v-container>
                    <v-row>
                        <v-col sm="12" md="8">
                            <v-text-field label="Titre"
                                          :disabled="mode === SHOW"
                                          name="titre"
                                          v-model="titre"
                                          type="text"/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
    </v-container>
    <div v-if="produitToScreen.length === 0" class="imageFondChargement"/>
    <div v-else>
        <produits-list v-model="articlesPots"
                       :produits-dispo-list="produitToScreen"/>
    </div>


<!--                        {/* Selection de la date du pot */}-->
<!--                        <Grid item xs={12} md={4}>-->

<!--                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>-->
<!--                                <KeyboardDatePicker-->
<!--                                    fullWidth={true}-->
<!--                                    disableToolbar-->
<!--                                    disabled={mode === this.SHOW}-->
<!--                                variant="inline"-->
<!--                                format="dd/MM/yyyy"-->
<!--                                id="date-picker-inline"-->
<!--                                label="Jour événement"-->
<!--                                value={pot.date}-->
<!--                                onChange={handleDateChange}-->
<!--                                KeyboardButtonProps={{-->
<!--                                    'aria-label': 'change date',-->
<!--                                }}-->
<!--                                />-->
<!--                            </MuiPickersUtilsProvider>-->

<!--                        </Grid>-->

<!--                        {/* Selection des participants aux pots */}-->
<!--                        {-->
<!--                        (pot.etat === 'Créé') &&-->
<!--                        <Grid item xs={12}>-->
<!--                            <FormControl className={classes.formControl}>-->
<!--                                <InputLabel id="demo-mutiple-chip-label">Clients</InputLabel>-->
<!--                                <Select-->
<!--                                    labelId="demo-mutiple-chip-label"-->
<!--                                    disabled={mode === this.SHOW}-->
<!--                                id="demo-mutiple-chip"-->
<!--                                multiple-->
<!--                                value={this.state.selected}-->
<!--                                onChange={this.handleChangeSelect}-->
<!--                                input={<Input id="select-multiple-chip" />}-->
<!--                                renderValue={selected => (-->
<!--                                <div className={classes.chips}>-->
<!--                                    {-->
<!--                                    dessinerChip(pot.participants)-->
<!--                                    }-->
<!--                                </div>-->
<!--                                )}-->
<!--                                >-->
<!--                                {clients.map(item => (-->
<!--                                <MenuItem key={item._id} value={item._id} /* style={getStyles(name, personName, theme)}*/>-->
<!--                                <Checkbox checked={this.state.selected.indexOf(item._id) > -1} />-->
<!--                                    <ListItemText primary={item.nom + " " + item.prenom} />-->
<!--                                    </MenuItem>-->
<!--                                    ))}-->
<!--                                    </Select>-->
<!--                            </FormControl>-->
<!--                        </Grid>-->
<!--                        }-->
<!--                    </Grid>-->


<!--                    {/* Affichage des produits en mode édition*/}-->
<!--                    {-->
<!--                    (mode !== this.SHOW && pot.etat === 'Créé') &&-->

<!--                    <Grid container>-->
<!--                        {/* Afficahge de la liste des types de produits disponibles*/}-->
<!--                        < Grid item xs={12}>-->
<!--                        {-->
<!--                        typeProduits.map((itemProduit, index) => (-->
<!--                        <Button style={{-->
<!--                                margin: '3px',-->
<!--                        color: this.state.idTab === index ? "black" : "white",-->
<!--                        backgroundColor: this.state.idTab === index ? "rgb(255,206,28) " : "rgb(63,81,181)"-->
<!--                        }} size="small" key={itemProduit._id}-->
<!--                        variant="contained"-->
<!--                        onClick={e => afficherTypeProduits(e, index)}-->
<!--                        >{itemProduit.nom}-->
<!--                        </Button>-->
<!--                        ))-->
<!--                        }-->
<!--                    </Grid>-->

<!--                    <Grid-->
<!--                        container-->
<!--                        direction="row"-->
<!--                        justify="flex-start"-->
<!--                        alignItems="center"-->
<!--                    >-->
<!--                        {-->
<!--                        produitsAffiche.map((item, index) => (-->
<!--                        <Grid item key={index} className={item.nombre - item.quantite === 0 ? 'gris' : ''}>-->
<!--                        <div-->
<!--                            onClick={e => ajouter(e, item)}-->
<!--                        style={{ backgroundColor: 'rgba(80, 80, 80, 0.1)', padding: 3, margin: 2, borderRadius: 3 }}>-->
<!--                        <div>-->
<!--                            <IconButton size="small" onClick={e => ajouter(e, item)}> <FaPlus /></IconButton>-->
<!--                            <IconButton size="small" onClick={e => retirer(e, item)}> <FaMinus /></IconButton>-->

<!--                            {item.quantite > 0 &&-->
<!--                            <div style={{-->
<!--                                 backgroundColor: "#F50055", color: "white", float: 'right', borderRadius: '3px', padding: '2px 2px 0px 2px'-->
<!--                            }}>{item.quantite}</div>-->
<!--                        }-->
<!--    </div>-->
<!--    <img alt={item.nom} src={Constantes.url + item.image} style={{ width: 100, height: 100 }} />-->
<!--    <div style={{ align: 'center', width: 100, height: 45, textAlign: 'center', overflow: 'hidden', fontSize: 'small', fontWeight: 'bold' }}>{item.nom} </div>-->
<!--    </div>-->
<!--    </Grid>-->
<!--    ))-->
<!--    }-->
<!--    </Grid >-->
<!--    </Grid>-->
<!--    }-->
<!--    {-->
<!--    (pot.etat === 'Paiement' || pot.etat === 'Payé') &&-->
<!--    <Grid item>-->
<!--        <TableContainer >-->
<!--            <Table size="small" style={{ padding: '0px' }}>-->

<!--            <TableHead>-->
<!--                <TableRow>-->
<!--                    <TableCell padding="none">Nom</TableCell>-->
<!--                    <TableCell padding="none">Espèce</TableCell>-->
<!--                    <TableCell padding="none">Chèque</TableCell>-->
<!--                    <TableCell padding="none">Virement</TableCell>-->

<!--                </TableRow>-->
<!--            </TableHead>-->
<!--            <TableBody>-->
<!--                {-->
<!--                pot.participants.map((item, index) => (-->
<!--                <TableRow key={"paiement" + item._id}>-->
<!--                    <TableCell padding="none">-->
<!--                        {item.nom} {item.prenom}-->
<!--                    </TableCell>-->
<!--                    <TableCell padding="none">-->
<!--                        <TextField disabled={item.paye || mode === this.SHOW} type="number" step="0.25" id={"paiementEspece_" + item._id} value={item.paiementEspece} onChange={this.modifierPaiement} />-->
<!--                    </TableCell>-->
<!--                    <TableCell padding="none">-->
<!--                        <TextField disabled={item.paye || mode === this.SHOW} type="number" step="0.25" id={"paiementCheque_" + item._id} value={item.paiementCheque} onChange={this.modifierPaiement} />-->
<!--                    </TableCell>-->
<!--                    <TableCell padding="none">-->
<!--                        <TextField disabled={item.paye || mode === this.SHOW} type="number" step="0.25" id={"paiementVirement_" + item._id} value={item.paiementVirement} onChange={this.modifierPaiement} />-->
<!--                    </TableCell>-->

<!--                    <TableCell padding="none">-->
<!--                        {-->
<!--                        !item.peutEtrePaye &&-->
<!--                        <Alert icon={false} severity="warning">Manque {(item.renduMonnaie * -1).toFixed(2)} €</Alert>-->
<!--                        }-->
<!--                        {-->
<!--                        item.peutEtrePaye && !item.paye &&-->

<!--                        <Alert icon={false} severity="error">Rendre {item.renduMonnaie.toFixed(2)} €-->
<!--                            <Button variant="contained" color="primary" onClick={() => this.payer(item._id)}> Payer</Button>-->
<!--                        </Alert>-->

<!--                        }-->
<!--                        {-->
<!--                        item.paye &&-->
<!--                        <Alert icon={false} severity="success">Payé - Rendue {item.renduMonnaie.toFixed(2)} €</Alert>-->

<!--                        }-->
<!--                    </TableCell>-->
<!--                </TableRow>-->
<!--                ))-->
<!--                }-->
<!--            </TableBody>-->
<!--            </Table>-->
<!--        </TableContainer>-->
<!--    </Grid>-->
<!--    }-->

<!--    </Grid>-->

<!--    {/* Affichage du ticket global */}-->
<!--    <Grid item xs={12} md={4}>-->
<!--        {-->
<!--        <Table size="small">-->
<!--            <TableBody>-->
<!--                {-->
<!--                produits.filter(item => item.quantite > 0).map((item, index) => (-->

<!--                <TableRow key={'row' + index}>-->
<!--                    <TableCell>-->
<!--                        {item.quantite}x {item.nom}-->
<!--                    </TableCell>-->
<!--                    <TableCell>-->
<!--                        {item.prixEuros * item.quantite + item.prix * item.quantite * valeurPoint}€-->
<!--                    </TableCell>-->
<!--                </TableRow>-->

<!--                ))-->
<!--                }-->
<!--                <TableRow>-->
<!--                    <TableCell align="right">Total</TableCell>-->
<!--                    <TableCell>{total} €</TableCell>-->
<!--                </TableRow>-->
<!--                <TableRow>-->
<!--                    <TableCell align="right">Total par personne</TableCell>-->
<!--                    <TableCell>{totalParParticipant} €</TableCell>-->
<!--                </TableRow>-->
<!--            </TableBody>-->
<!--        </Table>-->
<!--        }-->
<!--    </Grid>-->

<!--    {-->
<!--    this.getBouton()-->
<!--    }-->

<!--    </Grid>-->
<!--    </React.Fragment>-->

<!--    }-->

<!--    <ModalConfirmation-->
<!--        titre={'Encaisser le pôt'}-->
<!--    question={'Cette action est irreversible, souhaitez-vous encaisser le pôt ?'}-->
<!--    handleClose={handleClose}-->
<!--    confirmer={confirmerEncaisser}-->
<!--    open={openDialog} />-->

<!--    </div >-->

</template>

<script setup lang="ts">
import UserInterface from "~/interfaces/UserInterface";
import TypeProduitInterface from "~/interfaces/TypeProduitInterface";
import ProduitInterface from "~/interfaces/ProduitInterface";
import Fetch from "~/services/FetchService";
import ArticlePotInterface from "~/interfaces/ArticlePotInterface";

const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'create'

const articlesPots: Ref<Array<ArticlePotInterface>|[]> = ref([])
const produitToScreen: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)

onMounted(()=> {
    Fetch.requete({url: '/pots/produits', method: 'POST'}, (resultProduits: { produits: Array<ProduitInterface> }) => {
        produitToScreen.value = resultProduits.produits
    })
})

// const openDialog: Ref<boolean> = ref(false)
// const chargement: Ref<boolean> = ref(true)
// const title: Ref<string> = ref("Aucun titre")
// const clients: Ref<Array<UserInterface>> = ref([] as Array<UserInterface>)
// const typeProduits: Ref<Array<TypeProduitInterface>> = ref([] as Array<TypeProduitInterface>)
//
// const total: Ref<number> = ref(0)
// const totalParParticipant: Ref<number> = ref(0)
// const valeurPoint: Ref<number> = ref(0)
// const selected: Ref<Array<ProduitInterface>> = ref([] as Array<ProduitInterface>)

</script>

<style scoped>

</style>