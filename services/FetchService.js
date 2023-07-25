import serverconfig from "~/serverconfig";


class Fetch {

    static setFonctionDeco(deco) {
        this.deco = deco;
    }

    static getFonctionDeco() {
        this.deco();
    }

    static requete(data, reussite, echec = ()=>{}) {
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

        if (token !== "Bearer ") {
            myInit.body = JSON.stringify(data.data || {});
        }

        fetch(`${serverconfig}${data.url}`, myInit)
            .then(response => {
                console.log(response)
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
