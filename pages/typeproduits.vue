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
              <td>
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
      <v-col>
        <v-text-field
          type="date"
          v-model="dateDebutConsoSoum"
          label="Date de début"
        ></v-text-field>
      </v-col>
      <v-col>
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
      <v-col>
        <v-text-field
          type="number"
          v-model="nombreBnOfferts"
          label="valeur"
          :rules="[
            (v) => typeof v !== 'number' || 'Veuillez rentrer un nombre',
          ]"
        ></v-text-field>
      </v-col>
      <v-col>
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
      <v-col>
        <v-text-field
          type="number"
          v-model="valeurBn"
          @change="setValeurBN"
        ></v-text-field>
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

const types: Ref<Array<TypeProduitInterface>> = ref([]);
const dateDebutConsoSoum: Ref<Date> = ref(new Date());
const dateFinConsoSoum: Ref<Date> = ref(new Date());
const users: Ref<Array<UserInterface>> = ref([]);
const selectedReciever: Ref<UserInterface | undefined> = ref();
const nombreBnOfferts: Ref<number> = ref(0);
const valeurBn: Ref<number> = ref(0);

async function modifierType(type: TypeProduitInterface) {
  if (type.nom !== "") {
    await Fetch.requete({
      url: `/typeproduits/${type._id}`,
      method: "PUT",
      data: { typeproduit: type },
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
    }
  );
}

function supprimerType(typeId: string | undefined) {
  if (typeId) {
    Fetch.requete({ url: `/typeproduits/${typeId}`, method: "DELETE" }, () => {
      const typeBeforeDelete = types.value;
      types.value = typeBeforeDelete.filter((type) => type._id !== typeId);
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
      (res: { ticket: any }) => {
        window.open(
          `${serverconfig}v1/pdf/consoSoum?token=${res.ticket}`,
          "_blanck"
        );
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
        nombreBnOfferts.value = 0;
      }
    );
  }
}

function setValeurBN() {
  let valeurBN = valeurBn.value;
  if (valeurBN < 0) {
    valeurBN = 0;
  }

  Fetch.requete({
    url: "/parametre/valeurBN",
    method: "POST",
    data: {
      valeur: valeurBN,
    },
  });
}

const getTypes = () => {
  Fetch.requete(
    { url: "/typeproduits" },
    (resultat: Array<TypeProduitInterface>) => {
      types.value = resultat;
    }
  );
};
const getUsers = () => {
  Fetch.requete(
    { url: "/users", data: { page: 1, nombre: 1000 } },
    (resultat: { documents: Array<UserInterface> }) => {
      users.value = resultat.documents;
      selectedReciever.value = resultat.documents[0];
    }
  );
};
const getValeurBn = () => {
  Fetch.requete(
    { url: "/parametre/valeurBN", method: "GET" },
    (resultat: ValeurBnInterface) => {
      valeurBn.value = resultat.valeur;
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