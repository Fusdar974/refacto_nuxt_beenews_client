<template>
  <v-container>
    <v-row justify="space-between" align="start">
      <v-col cols="auto">
        <v-sheet class="pa-2 ma-2">
          <h2 class="d-none d-md-flex">Catégories</h2>
          <h3 class="d-flex d-md-none">Catégories</h3>
        </v-sheet>
      </v-col>
      <v-col cols="auto">
        <v-sheet class="pa-2 ma-2">
          <v-btn color="pink" @click="ajouterType()"> + CRÉER </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Nom</th>
              <th class="text-left">Pot</th>
              <th class="text-left">Soum</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in types" :key="type._id">
              <td >
                <v-text-field
                  v-model="type.nom"
                  :rules="[(v) => !!v || 'Veuillez rentrer un nom']"
                  @change="modifierType(type)"
                ></v-text-field>
              </td>
              <td>
                <v-checkbox
                  v-model="type.proposablePot"
                  @change="modifierType(type)"
                  color="pink"
                ></v-checkbox>
              </td>
              <td>
                <v-checkbox
                  v-model="type.proposableSoum"
                  @change="modifierType(type)"
                  color="pink"
                ></v-checkbox>
              </td>
              <td v-if="type.nombreProduits >= 1">
                {{ type.nombreProduits }} produits en stock
              </td>
              <td v-if="type.nombreProduits < 1">
                <v-btn
                  color="pink"
                  icon="mdi:mdi-delete"
                  @click="supprimerType(type._id)"
                >
                </v-btn>
              </td>
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
    <v-row align="start">
      <v-col cols="auto">
        <v-btn color="primary" @click="ticketJour()">Ticket jour</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="consoSoum()">Conso Soum</v-btn>
      </v-col>
        <v-col cols="auto">
          <v-text-field
            type="date"
            v-model="dateDebutConsoSoum"
            label="Date de début"
          ></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-text-field
            type="date"
            v-model="dateFinConsoSoum"
            label="Date de fin"
          ></v-text-field>
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

    <v-row align="start">
      <v-col cols="auto">
        <v-text-field
          type="number"
          v-model.number="nombreBnOfferts"
          label="valeur"
          :rules="[
            (v) => (typeof v == 'number' && v >0) || 'Veuillez rentrer un nombre supèrieur a 0',
          ]"
        ></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-select
          v-model="selectedReciever"
          :items="users"
          :item-title="(user) => `${user.nom}  ${user.prenom}`"
          return-object
          label="Client"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="offrirBN()"
          >Offrir Exceptionnellement</v-btn
        >
      </v-col>
    </v-row>
    <v-row justify="space-between" align="start">
      <v-col cols="auto">
        <v-sheet class="pa-2 ma-2">
          <h2 class="d-none d-md-flex">Valeur BN</h2>
          <h3 class="d-flex d-md-none">Valeur BN</h3>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row align="start">
      <v-col cols="auto">
        <v-text-field
          type="number"
          min="0"
          step="0.01"
          :rules="[
              (v) => v !> 0 || 'Veuillez rentrer un nombre positif',
          ]"
          v-model.number="valeurBn"
          label="modifier"
          @change="setValeurBN"
        ></v-text-field>
      </v-col>
      <v-col cols="auto" align-self="center">
          <span v-if="typeof valeurBnActuelle && valeurBnActuelle > 0">
            Actuellement 1 Bn équivaut à {{ valeurBnActuelle }}€
          </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import Fetch from "~/services/FetchService";
import { Ref } from "vue";
import serverconfig from "~/serverconfig";
import UserInterface from "~/interfaces/UserInterface";
import TypeProduitInterface from "~/interfaces/TypeProduitInterface";
import ValeurBnInterface from "~/interfaces/ValeurBnInterface";
import {useSnackbarStore} from "~/stores/snackbarStore";

const types: Ref<Array<TypeProduitInterface>> = ref([]);
const dateDebutConsoSoum: Ref<Date> = ref(new Date());
const dateFinConsoSoum: Ref<Date> = ref(new Date());
const users: Ref<Array<UserInterface>> = ref([]);
const selectedReciever: Ref<UserInterface | undefined> = ref();
const nombreBnOfferts: Ref<number> = ref(1);
const valeurBnActuelle: Ref<number> = ref(0);
const valeurBn: Ref<number> = ref(valeurBnActuelle.value);
const {putSnackBarMessage} = useSnackbarStore()

async function modifierType(type: TypeProduitInterface) {
  if (type.nom !== "") {
    await Fetch.requete({
      url: `/typeproduits/${type._id}`,
      method: "PUT",
      data: { typeproduit: type },
    },() => {
      putSnackBarMessage("type modifié","success")
    },() => {
        putSnackBarMessage("erreur serveur","error")
    });
  }
}

function ajouterType() {
  const emptyType: TypeProduitInterface = {
    nom: "",
    proposablePot: false,
    proposableSoum: false,
  };
  Fetch.requete(
    {
      url: `/typeproduits/create`,
      method: "POST",
      data: { typeproduit: emptyType },
    },
    (res: { typeproduit: TypeProduitInterface }) => {
      types.value.push(res.typeproduit);
    },() => {
          putSnackBarMessage("erreur serveur","error")
      }
  );
}

function supprimerType(typeId: string | undefined) {
  if (typeId) {
    Fetch.requete({ url: `/typeproduits/${typeId}`, method: "DELETE" }, () => {
      const typeBeforeDelete = types.value;
      types.value = typeBeforeDelete.filter((type) => type._id !== typeId);
    },() => {
        putSnackBarMessage("erreur serveur","error")
    });
  }
}

function ticketJour() {
  Fetch.requete(
    { url: "/soum/ticketjour", method: "POST" },
    (res: { ticket: string }) => {
      window.open(
        `${serverconfig}v1/pdf/ticketJour?token=${res.ticket}`,
        "_blanck"
      );
    },() => {
          putSnackBarMessage("erreur serveur","error")
      }
  );
}

function consoSoum() {
  if (dateDebutConsoSoum && dateFinConsoSoum) {
    Fetch.requete(
      {
        url: "/parametre/consoSoum",
        method: "POST",
        data: {
          debut: new Date(dateDebutConsoSoum.value).getTime(),
          fin: new Date(dateFinConsoSoum.value).getTime(),
        },
      },
      (res: { ticket: string }) => {
        window.open(
          `${serverconfig}v1/pdf/consoSoum?token=${res.ticket}`,
          "_blanck"
        );
      },() => {
            putSnackBarMessage("erreur serveur","error")
        }
    );
  }
}

function offrirBN() {
  if (selectedReciever.value && nombreBnOfferts.value > 0) {
    Fetch.requete(
      {
        url: `/users/offrir/${selectedReciever.value._id}`,
        method: "POST",
        data: {
          pointOffert: nombreBnOfferts.value,
          commentaires: "Ajout exceptionnel",
        },
      },
      () => {
          putSnackBarMessage("transaction efféctuée","success")
        nombreBnOfferts.value = 1;
      }, () => {
            putSnackBarMessage("erreur serveur","error")
      }
    );
  }
}

function setValeurBN() {
  if (isNaN(valeurBn.value)) {
      putSnackBarMessage("Veuillez rentrer un nombre supérieur à 0", "error");
      valeurBn.value = valeurBnActuelle.value;
  }
  if (isNaN(valeurBn.value)) {
      putSnackBarMessage("Veuillez rentrer un nombre", "error");
      valeurBn.value = valeurBnActuelle.value;
  }
  if(valeurBn.value > 0 || isNaN(valeurBn.value)){
      Fetch.requete({
          url: "/parametre/valeurBN",
          method: "POST",
          data: {
              valeur: valeurBn.value,
          },
      }, () => {
          putSnackBarMessage("valeur BN modifiée")
          valeurBnActuelle.value = valeurBn.value
      }, () => {
          putSnackBarMessage("erreur serveur","error")
      });
  }
}

const getTypes = () => {
  Fetch.requete(
    { url: "/typeproduits" },
    (resultat: Array<TypeProduitInterface>) => {
      types.value = resultat;
    }, () => {
          putSnackBarMessage("erreur serveur lors de la récupération des types produits","error")
      }
  );
};
const getUsers = () => {
  Fetch.requete(
    { url: "/users", data: { page: 1, nombre: 1000 } },
    (resultat: { documents: Array<UserInterface> }) => {
      users.value = resultat.documents;
      selectedReciever.value = resultat.documents[0];
    },() => {
          putSnackBarMessage("erreur serveur lors de la récupération des utilisateurs","error")
      }
  );
};
const getValeurBn = () => {
  Fetch.requete(
    { url: "/parametre/valeurBN", method: "GET" },
    (resultat: ValeurBnInterface) => {
      valeurBnActuelle.value = resultat.valeur;
    },() => {
          putSnackBarMessage("erreur serveur lors de la récupération de la valeur du BN","error")
      }
  );
};

onMounted(() => {
  getTypes();
  getUsers();
  getValeurBn();
});
</script>

<style scoped></style>