<template>
  <div>
    <v-form v-if="selectedProduit" :disabled="mode === SHOW" class="pa-5">
      <v-text-field v-model="selectedProduit.nom" type="text" label="nom"
                    :error-messages="v$.nom.$errors.map(e => e.$message) as string[]"
                    required
                    sm="12"
                    @input="v$.nom.$touch"
                    @blur="v$.nom.$touch"/>
      <v-text-field v-model.number="selectedProduit.prix" type="number" label="prix en BN"
                    :error-messages="v$.prix.$errors.map(e => e.$message) as string[]"
                    suffix="BN"
                    min="0"
                    sm="4"
                    required
                    @blur="v$.prix.$touch"/>
      <v-text-field v-model="selectedProduit.prixEuros"
                    :error-messages="v$.prixEuros.$errors.map(e => e.$message) as string[]"
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
                    :error-messages="v$.nombre.$errors.map(e => e.$message) as string[]"
                    required
                    @blur="v$.nombre.$touch"/>
      <v-select v-model="selectedProduit.type"
                @change="handleChangeSelect"
                :items="types as Array<TypeInterface>"
                item-title="nom"
                item-value="_id"/>
      <v-img v-if="selectedProduit.image && selectedProduit.image.length > 0 && !imgChanged"
             style="max-height: 200px; max-width: 200px"
             :src="serverconfig.concat(selectedProduit.image)"/>
      <v-img v-else-if="selectedProduit.image && selectedProduit.image.length > 0"
             style="max-height: 200px; max-width: 200px"
             :src="selectedProduit.image"
      />
      <v-file-input
          v-model="images"
          @change="imgChanged = true"
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
        <v-btn v-if="mode === EDIT" color="primary" class="ma-1" variant="outlined" key="edit" @click="modifier">Valider
        </v-btn>
        <v-btn v-else-if="mode === CREATE" color="primary" class="ma-1" variant="outlined" key="create" @click="creer">Créer
        </v-btn>
        <v-btn v-else color="primary" class="ma-1" variant="outlined" @click="mode = EDIT">
        Modifier
      </v-btn>
          <v-btn color="primary" class="ma-1" variant="outlined" key="create" @click="navigateTo('/produits')">Fermer
          </v-btn>
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
import ProduitResponseInterface from "~/interfaces/ProduitResponseInterface"
import ProduitInterface from "~/interfaces/ProduitInterface"
import TypeProduitInterface from "~/interfaces/TypeProduitInterface"
import TypeInterface from "~/interfaces/TypeProduitInterface"
import ImageResultInterface from "~/interfaces/ImageResultInterface";
import serverconfig from "~/serverconfig";
import {useMenuStore} from "~/stores/menuStore";

const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'add'

/**
 * userId : l'id de l'utilisateur à consulter/modifier
 * action : string qui détermine le mode du UserForm
 */
const props = defineProps({
    produitId: {type: String},
    action: {type: String, required: true},
})

const imgChanged: Ref<boolean> = ref(false)
const selectedProduit: Ref<ProduitInterface> = ref({} as ProduitInterface)
const mode: Ref<string> = ref(props.action)
const images: Ref<Array<File>> = ref([])
const types: Ref<Array<TypeProduitInterface>> = ref([] as Array<TypeProduitInterface>)

const {putSnackBarMessage} = useSnackbarStore()
const {titleAppBar} = storeToRefs(useMenuStore())

const rules = {
    nom: {required},
    prix: {required},
    prixEuros: {required},
    nombre: {required},
    type: {required},
}

watch(mode, () => majTitle())

const v$ = useVuelidate(rules, selectedProduit)//valide si les propriétées de selectedUser respectent les règles

const majTitle = () => {
  titleAppBar.value = mode.value === 'edit' && "Modification du produit"
      || mode.value === 'add' && "Ajout d'un produit"
      || "Informations du produit"
}


watch(images, newImages => {
    if (newImages[0]) {
        changementImage(newImages[0])
            .then((imageData) => {
                const imageProperties = imageData as ImageResultInterface
                selectedProduit.value = {
                    ...selectedProduit.value,
                    image: imageProperties.img,
                    imageBnr: imageProperties.bnr as string
                }
            })
            .catch(error => console.error(error))
  } else selectedProduit.value = {...selectedProduit.value, image: '', imageBnr:''}

})

watch(selectedProduit, newValue => console.log(newValue))

/**
 * avant que la page soit montée:
 * détermine en quel mode est le formulaire
 * si il n'est pas en mode création, charge le produit sélectionné
 * sinon, créé un produit vide
 */
onBeforeMount(() => {
  majTitle()
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
})

/**
 * ferme le formulaire et renvoie sur la page du stock, si un message est passé en paramètre
 * celui-ci est stocké dans le store ainsi qu'un booléen qui permet d'activer le snackbar de la page principale et afficher le message
 * @param messageAfficher message à afficher
 */
const fermer = (messageAfficher: string | undefined) => {
    if (messageAfficher) {
        putSnackBarMessage(messageAfficher)
    }
    navigateTo('/produits')
}

/**
 * Envoie une requete de création de produit dans le back et ferme le formulaire
 */
const creer = () => {
  v$.value.$validate()
      .then( result => {
        if (result && selectedProduit.value !== null) {
          console.log(selectedProduit)
          Fetch.requete({url: '/produits/create', method: 'POST', data: {produit: selectedProduit.value}}, () => {
            fermer('Création OK')
          })
        }}
      )
}

/**
 * Envoie une requete de modification de produit dans le back et ferme le formulaire
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

/**
 * Change le type du produit
 * @param e
 */
const handleChangeSelect = (e: any) => {
  const valeur = e.target
  selectedProduit.value.type = valeur.value
}

/**
 * Lorsque l'image est changée, créé un object temporaire dans le DOM pour vérifier sa taille et si l'image répond aux critères,
 * renvoie une promesse contenant le lien vers l'image et son fichier en binaire dans le back
 * @param file fichier de la nouvelle image
 */
const changementImage = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsBinaryString(file)

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
        const result: ImageResultInterface = {
          bnr: reader.result,
          img: window.URL.createObjectURL(file)
        }
        return resolve(result)
      } else {
        // it doesn't fit, unset the value
        images.value = []
        // post an error
        alert("Image maximum de 200x200")
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
