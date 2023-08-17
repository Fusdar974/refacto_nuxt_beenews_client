import serverconfig from "@/serverconfig";


class Fetch {

    static setFonctionDeco(deco) {
        this.deco = deco;
    }

    static getFonctionDeco() {
        this.deco();
    }

    static requete(data, reussite, echec) {
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
        let filters = [];
        if (myInit.method === "GET" && data.data) {
            for (const key in data.data) {
                if (key !== "undefined"
                    && key !== undefined
                    && key !== ''
                    && data.data[key] !== "undefined"
                    && data.data[key] !== undefined
                    && data.data[key] !== '') {
                    filters.push(`${key}=${data.data[key]}`);
                }
            }
        }
        const filterString = filters.length > 0 ? `?${filters.join('&')}` : ''
        fetch(`${serverconfig}${data.url}${filterString}`, myInit)
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
