class Database {

};
class Display_Data {
    date_range      = ["1900/01/01", "2100/12/31"];
    plot_type       = "scatter";
    plot_target     = "site";
    genre_checked   = [];
    site_checked    = [];
    date_tick       = 4;
    genre           = [];
    site            = [];
    json_range      = ["1900/01/01", "2100/12/31"];
    constructor (filename) {
        fetch(filename).then(file => file.text()).then(textdata => {
            this.data = textdata.split("\n").map(row=>{
                v = row.split(",");
                return {
                    num: Number(v[0]),
                    girl: v[1],
                    genre: v[2],
                    title: v[3],
                    url: v[4],
                    date: new Date(v[5]),
                    site: v[6],
                    identified: !(["除外", ""].includes(v[6])),
                }
            }).sort((a, b) => a.date - b.date);
            const latest_data = this.data[this.data.length - 1]
            this.date_range = [this.data[0].date, latest_data.data];
            this.date_range = [this.data[0].date, latest.date];
            this.genre_checked = Array.from(new Set(this.data.map(val=>val.genre)));
            this.site_checked = Array.from(new Set(this.data.map(val=>val.site)));
            ["num", "girl", "title", "genre", "site", "date"].forEach(key=>{
                elem(key).setAttribute("placeholder", latest_data[key]);
            });
            elem("url").setAttribute("placeholder", latest_data.url.slice(31,));
        });
    };
    search=(input)=>{
        const id = input.getAttribute("id");
        const value = elem(id).value;
        const found = this.data.filter(val=>id==="num"?String(val.num) === value:val[id].includes(value));
        elem("request").innerText =
            found.length == 0
                ? `There is no result for ${value} of ${id}.`
                : `${found.length} results are found for ${value} of ${id}.`
        const table_head = "<tr><th>#</th><th>Girl</th><th>Date</th><th>Genre</th><th>Title</th><th>URL</th><th>Hotel</th></tr>";
        const table_body = found.sort((a, b) => b.num - a.num).map((val, idx, arr)=>{
            const display = (val.num != arr[idx - 1].num)
            return `
            <tr>
                <td>${display?val.num:""}</td>
                <td>${display?val.girl:""}</td>
                <td>${val.date}</td>
                <td>${val.genre}</td>
                <td><a target='quiz_iframe' href=${val.url}>${val.title}</a></td>
                <td>${val.url.slice(31,)}</td>
                <td>${val.site}</td>
            </tr>
            `
        }).join("");
        elem("result").innerHTML = `
        <table>
            <thead>${table_head}</thead>
            <tbody>${table_body}</tbody>
        </table>
        `
        elem(id).value = "";
    };
};
