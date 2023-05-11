<template>
  <div>
    <h2> {{ titre }} </h2>
    <v-form v-if="selectedProduit" :disabled="mode === SHOW">
      <v-text-field v-model="selectedProduit.nom" type="text" label="nom"
                    :error-messages="v$.nom.$errors.map(e => e.$message)"
                    required
                    sm="12"
                    @input="v$.nom.$touch"
                    @blur="v$.nom.$touch"/>
      <v-text-field v-model.number="selectedProduit.prix" type="number" label="prix en BN"
                    :error-messages="v$.prix.$errors.map(e => e.$message)"
                    suffix="BN"
                    min="0"
                    sm="4"
                    required
                    @blur="v$.prix.$touch"/>
      <v-text-field v-model="selectedProduit.prixEuros"
                    :error-messages="v$.prixEuros.$errors.map(e => e.$message)"
                    sm="4"
                    step="0.25"
                    suffix="€"
                    min="0"
                    @blur="v$.prix.$touch"
                    type="number"
                    label="prix en euros" />
      <v-text-field v-model="selectedProduit.credit"
                    type="number"
                    step="0.25"
                    suffix="€"
                    min="0"
                    label="credit" sm="4"/>
        <v-text-field v-model="selectedProduit.nombre" type="number" min="0" label="stock" sm="6"
                      :error-messages="v$.nombre.$errors.map(e => e.$message)"
                      required
                      @blur="v$.nombre.$touch"/>
        <v-select v-model="selectedProduit.type"
                  @change="handleChangeSelect"
                  :items="types"
                  item-title="nom"
                  item-value="_id"/>
        <v-img
                v-if="selectedProduit.image && selectedProduit.image.length > 0"
                style="max-height: 200px; max-width: 200px"
                :src="selectedProduit.image"
        />
        <v-file-input
                v-model="images"
                accept="image/png, image/jpeg, image/bmp"
                placeholder="Pick an image"
                prepend-icon="mdi:mdi-camera"
                label="Image"
        ></v-file-input>
        <v-checkbox label="Archivé"
                    v-model="selectedProduit.archive"
                    color="red"
      ></v-checkbox>
      <div>
        <v-btn v-if="mode === SHOW" color="primary" class="ma-1" variant="outlined" key="edit" @click="mode = EDIT">
          Modifier
        </v-btn>
        <v-btn v-if="mode === EDIT" color="primary" class="ma-1" variant="outlined" key="edit" @click="modifier">Valider
        </v-btn>
        <v-btn v-if="mode === CREATE" color="primary" class="ma-1" variant="outlined" key="create" @click="creer">Créer
        </v-btn>
        <v-btn color="primary" class="ma-1" variant="outlined" key="create" @click="fermer(null)">Fermer</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService"
import {storeToRefs} from "pinia"
import {useSnackbarStore} from "~/stores/snackbarStore"
import {useVuelidate} from '@vuelidate/core'
import {required} from '@vuelidate/validators'
import {SymbolKind} from "vscode-languageserver-types"
import ProduitResponseInterface from "~/interfaces/ProduitResponseInterface"
import ProduitInterface from "~/interfaces/ProduitInterface"
import TypeProduitInterface from "~/interfaces/TypeProduitInterface"
import TypeInterface from "~/interfaces/TypeProduitInterface"
import Array = SymbolKind.Array;


/**
 * userId : l'id de l'utilisateur à consulter/modifier
 * action : string qui détermine le mode du UserForm
 */
const props = defineProps({
  produitId: {type: String},
  action: {type: String, required: true},
})

const fileInput: Ref<any> = ref()
const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'add'
const selectedProduit: Ref<ProduitInterface> = ref({} as ProduitInterface)
const mode: Ref<string> = ref(props.action)
const titre: Ref<string> = ref("Aucun titre")
const images: Ref<Array<File>> = ref([])
const types: Ref<Array<TypeProduitInterface>> = ref([] as Array<TypeProduitInterface>)
const {open: snackbarStoreOpen, message: snackbarStoreMessage} = storeToRefs(useSnackbarStore())
const rules = {
  nom: {required}, // Matches state.firstName
  prix: {required},
  prixEuros: {required},
  nombre: {required},
  type: {required},
}

const v$ = useVuelidate(rules, selectedProduit)//valide si les propriétées de selectedUser respectent les règles

watch(images, newImages => {
    if (newImages[0]) {
        changementImage(newImages[0])
            .then((imageB64) => selectedProduit.value = {...selectedProduit.value, image: String(imageB64)})
            .catch(error => console.error(error))
    } else selectedProduit.value = {...selectedProduit.value, image: ''}

})

watch(selectedProduit, newValue => console.log(newValue))

/**
 * avant que la page soit créée:
 * détermine en quel mode est le formulaire
 * si il n'est pas en mode création, charge l'utilisateur sélectionné
 * sinon, créé un utilisateur vide
 */
onBeforeMount(() => {
    let title: string
    switch (props.action) {
    case 'show':
      title = "Informations produit"
      break
    case 'edit':
      title = "Modifier produit"
      break
    case 'add':
      title = "Ajouter produit"
      break
    default:
      title = "Informations produit"
      break
  }
  if (mode.value !== CREATE) {
    Fetch.requete({url: `/produits/${props.produitId}`, method: 'GET'}, (resultProduits: ProduitResponseInterface) => {
      selectedProduit.value = resultProduits.produit
    })
  } else {
    selectedProduit.value = {
      nom: "",
      image: "",
      prix: 0,
      prixEuros: 0,
      nombre: 0,
      credit: 0,
      effacable: false,
      archive: false,
      type: '',
    }
  }
  Fetch.requete({ url: `/typeproduits`, method: 'POST' }, (result: [TypeInterface]) => {
    types.value = result
  })
  titre.value = title
})

/**
 * ferme le formulaire et renvoie sur la page des clients, si un message est passé en paramètre
 * celui-ci est stocké dans le store ainsi qu'un booléen qui permet d'activer le snackbar de la page principale est afficher le message
 * @param messageAfficher message à afficher
 */
const fermer = (messageAfficher: string) => {
  if (messageAfficher) {
    snackbarStoreMessage.value = messageAfficher
    snackbarStoreOpen.value = true
  }
  navigateTo('/produits')
}

/**
 * Envoie une requete de création d'utilisateur dans le back et ferme le formulaire
 */
const creer = () => {
  v$.value.$validate()
      .then( result => {
        if (result && selectedProduit.value !== null) {
          //selectedProduit.value.image = selectedProduit.value.image
          Fetch.requete({url: '/produits/create', method: 'POST', data: {produit: selectedProduit.value}}, () => {
            fermer('Création OK')
          })
        }}
      )
}

/**
 * Envoie une requete de modification d'utilisateur dans le back et ferme le formulaire
 */
const modifier = () => {
  v$.value.$validate()
      .then( result => {
        if (result && selectedProduit.value !== null) {
          Fetch.requete({
            url: `/produits/${selectedProduit.value._id}`,
            data: { produit: selectedProduit.value },
            method: 'PUT'}, () => {
            fermer('Modification OK')
          })
        }
      })
}

const handleChangeSelect = (e: any) => {
  const valeur = e.target
  selectedProduit.value.type = valeur.value
  console.log(selectedProduit.value.type)
}

const changementImage = (file: File) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
        var img = new Image()
        img.src = window.URL.createObjectURL(file)
        img.onload = () => {
            const width = img.naturalWidth
            const height = img.naturalHeight

            // unload it
            window.URL.revokeObjectURL(img.src)

            // check its dimensions
            if (width <= 200 && height <= 200) {
                // it fits
                return resolve(reader.result)
            } else {
                // it doesn't fit, unset the value
                // post an error
                // alert("Image maximum de 200x200")
                // return undefined
                return reject(new Error("Image maximum de 200x200"))
            }
        }
        reader.onerror = (error) => {
            return reject(error)
        }
    }
})



</script>

<style scoped>

</style>