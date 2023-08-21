import serverconfig from "@/serverconfig";


class Fetch {

    static setFonctionDeco(deco) {
        this.deco = deco;
    }

    static getFonctionDeco() {
        this.deco();
    }

    static requete(data, reussite, echec ) {
        const token = localStorage.getItem('token');

        const myHeaders = new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token || ""}`
        });

        const myInit = {
            method: data.method || "POST",
            headers: myHeaders
        };
        if (myInit.method === "POST" || myInit.method === "PATCH") {
            myInit.body = JSON.stringify(data.data || {});
        }
        let filters = '';
        if (myInit.method === "GET" && data.data) {
            filters = `?`;
            data.data.forEach((value, key) => {
                filters += `${key}=${value}&`;
            })
            filters.substring(0, filters.length - 1);
        }

        fetch(`${serverconfig}${data.url}${filters}`, myInit)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    console.error(`${serverconfig}${data.url}`, response);
                    throw (response);
                }
            })
            .then(dataJSON => {
                if (reussite) {
                    reussite(dataJSON);
                }
            })
            .catch(function (err) {
                console.log("data : ", data, err);
                console.error(`Erreur ${data.url} ${err.status} ${err.statusText}`);

                if (err.status === 401) {
                    Fetch.getFonctionDeco();
                } else {
                    echec(err);
                }

            });
    }
}

export default Fetch;
