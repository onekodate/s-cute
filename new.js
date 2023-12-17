const elem=(id)=>document.getElementById(id);
class Database {
    version = 1;
    store_name = "exclude";
    key_id = 1;
    indexedDB = window.indexedDB || window.webkitIndexedDB || window.mosIndexedDB;
    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mosIDBTransaction;
    db = null;
    constructor (filename) {
        this.db_name = filename;
    };
    create=(data)=>{
        const request = this.indexedDB.open(this.db_name, this.version);
        request.onupgradeneeded=(e)=>{
            this.db = request.result;
            this.db.createObjectStore(this.store_name, {"keyPath": "id"});
        };
        request.onsuccess=(e)=>{
            this.db = request.result;
            const add_request = this.db
                .transaction(this.store_name, "readwrite")
                .objectstore(this.store_name)
                .put({
                    id: this.key_id,
                    data: data,
                });
            add_request.onerror=(e)=>console.log(e.message);
        };
        request.onerror=(e)=>console.log(e.message);
        request.onblocked=(e)=>console.log(e.message);
    };
    get=()=>new Promise((resolve, reject)=>{
        const open_request = this.indexedDB.open(this.db_name, this.version);
        this.db = null;
        open_request.onsuccess=(e)=>{
            if(this.db.objectStoreNames.length > 0){
                const transaction = db.transaction([this.store_name], this.IDBTransaction.READ_ONLY);
                const get_request = transaction.objectStore(this.store_name).get(this.key_id);
                get_request.onsuccess = (e) => {
                    this.data = get_request.result.data;
                    if(this.data) resolve();
                    else reject();
                };
                get_request.onerror=(e)=>{
                    reject();
                };
            } else {
                this.db.close();
                this.delete();
                reject();
            }
        };
        open_request.onerror=(e)=>{
            console.log(e.message);
            reject();
        };
    });
    delete=()=>{
        if(this.db) this.db.close();
        const delete_request = this.indexedDB.deleteDatabase(this.db_name);
        delete_request.onsuccess = (e) => console.log(e.message);
        delete_request.onerror = (e) => console.log(e.message);
        delete_request.onblocked = (e) => console.log(e.message);
    };
};
class Display_Data {
    constructor (filename) {
        this.database = new Database(filename);
        const hotel = {};
        const genre = {};
        this.filename = filename;
        fetch(filename).then(file => {
            this.data = file.text()
                .split("\n").map(row=>{
                v = row.split(",");
                if(!genre[val.genre]) genre[val.genre]=0;
                else genre[val.genre]++;
                if(!hotel[val.hotel]) hotel[val.hotel]=0;
                else hotel[val.hotel]++;
                return {
                    num: Number(v[0]),
                    girl: v[1],
                    genre: v[2],
                    title: v[3],
                    url: v[4],
                    date: new Date(v[5]),
                    hotel: v[6]===""?"Unknown":v[6],
                    identified: !(["除外", ""].includes(v[6])),
                };
            }).sort((a, b) => a.date - b.date);
        });
        elem("genre_list").innerHTML=Object.keys(genre).sort((a, b) => genre[a] - genre[b]).map(val=>`<option value="${val}">`).join("");
        elem("hotel_list").innerHTML=Object.keys(hotel).sort((a, b) => hotel[a] - hotel[b]).map(val=>`<option value="${val}">`).join("");
    };
    search=(input)=>{
        const id = input.getAttribute("id");
        const value = elem(id).value;
        this.found = this.data.filter(val=>id==="#"?String(val.num) === value:val[id].includes(value));
        ["#", "Girl", "Date", "Genre", "Title", "URL", "Hotel"].forEach(key=>{
            elem(key).setAttribute("placeholder", id===key?value:key);
        });
        elem("request").innerText =
            this.found.length == 0
                ? `There is no result for ${value}.`
                : `${this.found.length} results are found for ${value}.`
        elem("tbody").innerHTML = found.sort((a, b) => b.num - a.num).map((val, idx, arr)=>{
            const display = (val.num != arr[idx - 1].num)
            return `
            <tr>
                <td>${display?val.num:""}</td>
                <td>${display?val.girl:""}</td>
                <td>${val.date}</td>
                <td>${val.genre}</td>
                <td><a target='iframe' href=${val.url}>${val.title}</a></td>
                <td>${val.url.slice(31,)}</td>
                <td>${val.hotel}</td>
            </tr>
            `
        }).join("");
    };
    move=(step)=>{
        const old_url = elem("iframe").getAttribute("href");
        const old_idx = this.found.map(val=>val.url).indexOf(old_url);
        const new_idx = (old_idx + step) % this.found.length
        const new_url = this.found[new_idx].url;
        elem("iframe").setAttribute("href", new_url);
        elem("answer").setAttribute("placeholder", this.found[new_idx].hotel);
    };
    answer=(input)=>{
        const value = input.value;
        const url = elem("iframe").getAttribute("href");
        const filtered = this.data.filter(val=>val.url===url);
        if(filtered.length == 1) filtered[0].hotel = value;
        this.database.save();
    };
    download=()=>{
        let download_link = elem("download_link");
        const string = this.data.map(val=>[val.num, val.girl, val.genre, val.title, val.url, val.date, val.hotel].join(",")).join("\n");
        const brob = new Blob([string], {type:"text/csv"});
        download_link.href = URL.createObjectURL(blob);
        download_link.download = this.filename;
        download_link.click();
    };
};
engine = Display_Data("s-cute.csv")
