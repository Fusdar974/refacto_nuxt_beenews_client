import serverconfig from "@/serverconfig";


class Fetch {

    static setFonctionDeco(deco) {
        this.deco = deco;
    }

    static getFonctionDeco() {
        this.deco();
    }

    static requete(data, reussite, echec = ()=>{}) {

        const myHeaders = new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json",
            'Authorization': `BEARER ${localStorage.getItem('token') || ''}`
        });

        const myInit = {
            method: data.method || "POST",
            headers: myHeaders
        };

        if (myInit.method !== 'GET') {
            myInit.body = JSON.stringify(data.data || {});
        }


        fetch(`${serverconfig}v1${data.url}`, myInit)
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    console.error(`${serverconfig}v1${data.url}`, response);
                    throw (response);
                }
            })
            .then(dataJSON => {
                if (reussite) {
                    reussite(dataJSON);
                }
            })
            .catch(function (err) {
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