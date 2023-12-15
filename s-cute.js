var jsonarr=[],slider=false;
var metroColors=["#f39700","#e60012","#9caeb7","#00a7db","#009944","#d7c447","#9b7cb6","#00ada9","#bb641d"];
const elem=(id)=>document.getElementById(id);
function loadFile(){
    const file=elem("file").files[0];
    let reader=new FileReader();
    reader.onload=(event)=>{
        if(file.type==="application/json"){
            jsonarr=JSON.parse(event.target.result);
        }else if(event.target.result.includes("\n")&&event.target.result.includes(",")){
            jsonarr=[];
            let num=0,girl="aaa";
            const arr=event.target.result.split("\n");
            arr.forEach((valstr)=>{
                if(valstr.length>0){
                    const valarr=valstr.split(",");
                    const identify=(site)=>{
                        if(["Unidentified","Apparently Not Hotel",""].includes(site)) return false;
                        else return true;
                    }
                    /*
                    const short=(genre)=>{
                        if(genre.includes("Short")) return true;
                        else return false;
                    }
                    */
                    const site=(site)=>{
                        if(site==="") return "Unidentified";
                        else return site;
                    }
                    const hotel=(site)=>{
                        if(["Apparently Not Hotel","グランアクス代々木上原","ラトゥール新宿？"].includes(site)) return false;
                        else return true;
                    }
                    if(valarr[0]!==""){
                        num=valarr[0];
                        girl=valarr[1];
                    }
                    jsonarr.push({
                        num:String(Number(num)),
                        girl:girl,
                        genre:valarr[2],
                        //short:short(valarr[2]),
                        title:valarr[3],
                        url:valarr[4],
                        date:valarr[5],
                        identified:identify(valarr[6]),
                        hotel:hotel(valarr[6]),
                        site:site(valarr[6]),
                        //room:valarr[7],
                    });
                }
            });
            if(jsonarr){
                let downloadLink=elem("downloadLink");
                const blob=new Blob([JSON.stringify(jsonarr)],{type:"application/json"});
                downloadLink.href=URL.createObjectURL(blob);
                downloadLink.download="s-cute.json";
                downloadLink.click();
            }
        }
        json2setting();
        //setting2summary();
    }
    reader.readAsText(file,"utf-8");
}
var se={
    date_range:["1900/01/01","2100/12/31"],
    s_d_g:"Scatter",
    s_g:"site",
    genre_check:[],
    site_check:[],
    date_tick:4,
    genre:[],
    site:[],
    json_range:["1900/01/01","2100/12/31"],
};
function json2setting(){
    const sorted=jsonarr.map(val=>val).sort((a,b)=>new Date(a.date)-new Date(b.date));
    se.date_range=[sorted[0].date,sorted[sorted.length-1].date];
    se.json_range=[sorted[0].date,sorted[sorted.length-1].date];
    se.genre_check=Array.from(new Set(jsonarr.map(val=>val.genre)));
    se.site_check=Array.from(new Set(jsonarr.map(val=>val.site)));
    let dict={genre:{},site:{}};
    jsonarr.forEach(val=>{
        if(!dict.genre[val.genre]) dict.genre[val.genre]=[];
        else dict.genre[val.genre].push(val);
        if(!dict.site[val.site]) dict.site[val.site]=[];
        else dict.site[val.site].push(val);
    });
    ["num","girl","title","genre","site","date"].forEach(key=>{
        elem(key).setAttribute("placeholder",jsonarr[jsonarr.length-1][key]);
    });
    elem("url").setAttribute("placeholder",jsonarr[jsonarr.length-1].url.slice(31,));
    ["genre","site"].forEach((val)=>{
        se[val]=Object.keys(dict[val]).map(key=>{
            return {
                key:key,
                size:dict[val][key].length,
            };
        }).sort((a,b)=>b.size-a.size).map(val=>val.key);
    });
    elem("genre_select").innerHTML="<datalist id=genre_list>"+se.genre.map(val=>"<option value='"+val+"'>").join("")+"</datalist>";
    elem("hotel_select").innerHTML="<datalist id=hotel_list>"+se.site.map(val=>"<option value='"+val+"'>").join("")+"</datalist>";
    quiz.choices=se.site.filter(val=>!["Unidentified","Apparently Not Hotel"].includes(val.site));
    quiz.arr=jsonarr.filter(val=>val.hotel&&val.identified&&!quiz.exclude.includes(val)).map(val=>{return {x:val,y:Math.random()}}).sort((a,b)=>b.y-a.y).map(val=>val.x);
    elem("quiz_choices").innerHTML=quiz.choices.map((val,idx)=>"<button style='border:solid 5px "+borderColor(val)+"' class=choices id=btn"+idx+" onclick='quiz_answer(this);'>"+val+"</button>").join("");
    next_quiz();
    const rankArr={
        genre:Object.keys(dict.genre).map((val)=>{return {key:val,size:dict.genre[val].length}}).sort((a,b)=>b.size-a.size),
    };
    se.genre=rankArr.genre.map(v=>v.key);
    elem("genre_checklist").innerHTML=rankArr.genre.map((v,idx)=>"<label><input type=checkbox name="+"genre_check value='"+String(idx)+"' checked=checked>"+v.key+"</label>").join("");
    elem("genre_checklist").addEventListener("change",(event)=>{
        se.genre_check=se.genre.filter((v,idx)=> document.getElementsByName("genre_check")[idx].checked);
        setting2summary();
    });
    const sin=new Date(se.json_range[0]),unt=new Date(se.json_range[1]);
    if(slider) elem("range_slider").noUiSlider.destroy();
    noUiSlider.create(elem("range_slider"),{
        start:[0,100],
        step:1,
        margin:1,
        connect:true,
        direction:"ltr",
        orientation:"horizontal",
        behaviour:"tap-drag",
        range:{
            min:0,
            max:(unt.getYear()-sin.getYear())+1,
        },
    });
    slider=true;
    elem("range_slider").noUiSlider.on("update",(values)=>{
        if(plot.pie){
            const set2fig=(num)=>("0"+num).substr(-2,2);
            const date2str=(date)=>date.getFullYear()+"/"+set2fig(date.getMonth()+1)+"/"+set2fig(date.getDate());
            ["since","until"].forEach((val,idx)=>{
                let date=new Date(se.json_range[0]);
                date.setMonth(0);
                date.setYear(date.getFullYear()+Number(values[idx]));
                date.setDate(1-idx);
                se.date_range[idx]=date2str(date);
                if((se.date_range[idx]<se.json_range[idx])^idx) se.date_range[idx]=se.json_range[idx];
                elem("range_"+val).value=se.date_range[idx];
            });
            setting2summary();
        }
    });
    elem("range_since").value=se.json_range[0];
    elem("range_until").value=se.json_range[1];
    elem("quiz_counter").innerText="Your Score: "+quiz.exclude.length+"/"+quiz.counter;
    elem("summary").className="";
    /*
    elem("quiz_choices").addEventListener("touchstart",(event)=>{quiz.touchX[0]=event.touches[0].pageX});
    elem("quiz_choices").addEventListener("touchmove",(event)=>{quiz.touchX[1]=event.changedTouches[0].pageX});
    elem("quiz_choices").addEventListener("touchend",(event)=>{if((quiz.touchX[0]-quiz.touchX[1])>100) next_quiz();});
    */
    setting2summary();
}
var plot={
    pie:undefined,
    rank:undefined,
    date:undefined,
};
const borderColor=(key)=>{
    if(["Unidentified","Apparently Not Hotel"].includes(key)) return "#000000";
    else return metroColors[key.length%metroColors.length];
}
function setting2summary(){
    let dict={site:{},genre:{},unidentified:[],apparently:[]},arr=[];
    if(se.s_g==="site") arr=jsonarr.filter((val)=>(se.date_range[0]<=val.date&&val.date<=se.date_range[1]&&se.genre_check.includes(val.genre)));
    else if(se.s_g==="genre") arr=jsonarr.filter((val)=>(se.date_range[0]<=val.date&&val.date<=se.date_range[1]&&se.site_check.includes(val.site)));
    arr.forEach((val)=>{
        ["site","genre"].forEach((v)=>{
            if(!dict[v][val[v]]) dict[v][val[v]]=[val];
            else dict[v][val[v]].push(val);
        });
    });
    ["Unidentified","Apparently Not Hotel"].forEach((val)=>{
        if(dict.site[val]){
            dict[val]=dict.site[val].map(val=>val);
            dict.site[val]=[];
        }
    });
    const rankArr={
        genre:Object.keys(dict.genre).map((val)=>{return {key:val,size:dict.genre[val].length}}).sort((a,b)=>b.size-a.size),
        site:Object.keys(dict.site).map((val)=>{return {key:val,size:dict.site[val].length}}).sort((a,b)=>b.size-a.size),
    };
    let ranking={
        genre:rankArr.genre.map(val=>val),
        site:rankArr.site.map(val=>val),
    };
    const len=20;
    ["genre","site"].forEach((val)=>{
        if(ranking[val].length>len-1){
            ranking[val]=ranking[val].slice(0,len);
            ranking[val].push({key:"Others",size:rankArr[val].slice(len,).reduce((acc,val)=>acc+val.size,0)});
            dict[val]["Others"]=rankArr[val].slice(len,).reduce((acc,cur)=>{
                return acc.concat(dict[val][cur.key]);
            },[]);
        }
    });
    ["Unidentified","Apparently Not Hotel"].forEach((val)=>{
        if(dict.site[val]){
            ranking.site.push({key:val,size:dict[val].length});
            dict.site[val]=dict[val].map(val=>val);
        }
    });
    if(se.s_g==="site"){
        const ident=arr.filter(val=>val.identified).length;
        elem("summary_sentence").innerText=String(ident)+"("+(ident/arr.length*100).toFixed(1)+"%) contents was identified in "+String(arr.length)+" contents since "+se.date_range[0]+" until "+se.date_range[1]+".";
    }else if(se.s_g==="genre"){
        elem("summary_sentence").innerText=String(arr.length)+" contents have been released since "+se.date_range[0]+" until "+se.date_range[1]+".";
    }
    if(plot.pie) plot.pie.destroy();
    plot.pie=new Chart(elem("summary_pie"),{
        type:"doughnut",
        data:{
            datasets:[{
                data:ranking[se.s_g].map(val=>val.size),
                backgroundColor:ranking[se.s_g].map(val=>borderColor(val.key)),
                borderWidth:1,
            }],
            labels:ranking[se.s_g].map(val=>val.key),
        },
        options:{
            animation:false,
            legend:{display:false},
        },
    });
    if(plot.rank) plot.rank.destroy();
    plot.rank=new Chart(elem("summary_bar"),{
        type:"bar",
        data:{
            labels:ranking[se.s_g].map(val=>val.key),
            datasets:[{
                data:ranking[se.s_g].map(val=>val.size),
                fontColor:"#000000",
                backgroundColor:ranking[se.s_g].map(val=>borderColor(val.key)),
            }],
        },
        options:{
            animation:false,
            legend:{display:false},
            scales:{
                xAxes:[{
                    gridLines:{color:"#9baec8"},
                    ticks:{fontColor:"#000000"},
                }],
                yAxes:[{
                    gridLines:{color:"#9baec8"},
                    ticks:{
                        fontColor:"#9baec8",
                        min:0,
                    },
                }],
            },
        },
    });
    if(plot.date) plot.date.destroy();

    if(se.s_d_g==="Scatter"){
        plot.date=new Chart(elem("date_plot"),{
            type:"scatter",
            data:{
                datasets:ranking[se.s_g].map((key)=>{
                    return {
                        label:"",//key.key,
                        borderColor:borderColor(key.key),
                        pointRadius:1.5,
                        data:dict[se.s_g][key.key].map((val)=>{
                            return {
                                x:new Date(val.date),
                                y:val.num,
                            };
                        }),
                    };
                }),
            },
            options:{
                animation:false,
                scales:{
                    xAxes:[{
                        ticks:{
                            fontColor:"#9baec8",
                            min:new Date(se.date_range[0]),
                            max:new Date(se.date_range[1]),
                        },
                        type:"time",
                        gridLines:{color:"#9baec8"},
                    }],
                    yAxes:[{
                        gridLines:{color:"#9baec8"},
                        ticks:{
                            fontColor:"#9baec8",
                            min:Math.min(...arr.map(val=>val.num))-1,
                            max:Math.max(...arr.map(val=>val.num))+1,
                        },
                    }],
                },
            }
        });
    }else if(se.s_d_g==="Date"){
        plot.date=new Chart(elem("date_plot"),{
            type:"bar",
            data:{
                datasets:ranking[se.s_g].map((key)=>{
                    let date_dict={};
                    const date2key=(date,tick)=>{
                        return date.slice(0,tick)+"2001/01/01".slice(tick,);
                    }
                    arr.forEach((val)=>{
                        date_dict[date2key(val.date,se.date_tick)]=0;
                    });
                    dict[se.s_g][key.key].forEach((val)=>{
                        if(!date_dict[date2key(val.date,se.date_tick)]) date_dict[date2key(val.date,se.date_tick)]=1;
                        else date_dict[date2key(val.date,se.date_tick)]++;
                    });
                    return {
                        label:key.key,
                        fontColor:"#ffffff",
                        backgroundColor:borderColor(key.key),
                        data:Object.keys(date_dict).map((k,i)=>{
                            return {
                                x:new Date(k),
                                y:date_dict[k],
                            };
                        }),
                    };
                }),
            },
            options:{
                animation:false,
                scales:{
                    xAxes:[{
                        ticks:{fontColor:"#9baec8"},
                        stacked:true,
                        type:"time",
                        time:{
                            unit:"year",
                            unitStepSize:1,
                        },
                        gridLines:{color:"#9baec8"},
                    }],
                    yAxes:[{
                        stacked:true,
                        gridLines:{color:"#9baec8"},
                        ticks:{
                            fontColor:"#9baec8",
                            min:0,
                        },
                    }],
                },
            },
        });
    }else if(se.s_d_g==="Girl"){
        let sorted=Array.from(new Set(arr.map(val=>Number(val.num)))).sort((a,b)=>a-b).filter((num)=>(arr.filter(val=>(val.num===String(num))).length===jsonarr.filter(val=>(val.num===String(num))).length));
        const labels=Array.from(new Array(sorted[sorted.length-1]-sorted[0]+1)).map((v,idx)=>String(sorted[0]+idx));
        plot.date=new Chart(elem("date_plot"),{
            type:"bar",
            data:{
                labels:labels,
                datasets:ranking[se.s_g].map((key)=>{
                    let girl_dict={};
                    labels.forEach((val)=>{
                        girl_dict[val]=0;
                    });
                    dict[se.s_g][key.key].forEach((val)=>{
                        if(!girl_dict[val.num]) girl_dict[val.num]=1;
                        else girl_dict[val.num]++;
                    });
                    return {
                        label:key.key,
                        fontColor:"#ffffff",
                        backgroundColor:borderColor(key.key),
                        data:labels.map((val)=>{
                            let y=0;
                            if(girl_dict[val]) y=girl_dict[val];
                            return y;
                        }),
                    };
                }),
            },
            options:{
                animation:false,
                scales:{
                    xAxes:[{
                        ticks:{
                            fontColor:"#9baec8",
                            max:labels[labels.length-1],
                            min:labels[0],
                            autoSkip:false,
                            callback:(val)=>{
                                if(Number(val)%20===0) return val;
                            }
                        },
                        stacked:true,
                        gridLines:{
                            color:"#9baec8",
                        },
                    }],
                    yAxes:[{
                        stacked:true,
                        gridLines:{color:"#9baec8"},
                        ticks:{
                            fontColor:"#9baec8",
                            min:0,
                        },
                    }],
                },
            },
        });
    }
}
function search(input){
    const id=input.getAttribute("id");
    const value=elem(id).value;
    let arr=[];
    if(id==="num") arr=jsonarr.filter(val=>String(val.num)===value);
    else arr=jsonarr.filter(val=>val[id].includes(value));
    if(arr.length===0) elem("request").innerText="There is no result for "+value+" for "+id;
    else elem("request").innerText="There are "+arr.length+" results for "+value+" for "+id;
    const str1="<table><tr><th>#</th><th>Girl</th><th>Date</th><th>Genre</th><th>Title</th><th>URL</th><th>Site</th></tr>";
    let numarr=[];
    const str2=arr.sort((a,b)=>b.num-a.num).map(val=>{
        let num="",girl="";
        if(!numarr.includes(val.num)){
            numarr.push(val.num);
            num=val.num;
            girl=val.girl;
        }
        return ["<tr><td><a onclick='res_search(this); return false;' value='num,",num,"'>",num,
                "</a></td><td><a onclick='res_search(this); return false;' value='girl,",girl,"'>",girl,
                "</td><td>",val.date,
                "</td><td nowrap><a onclick='res_search(this); return false;' value='genre,",val.genre,"'>",val.genre,
                "</td><td class=break><a target='quiz_iframe' href='",val.url,"'>",val.title,
                "</a></td><td>",val.url.slice(31,),
                "</td><td class=break><a onclick='res_search(this); return false;' value='site,",val.site,"'>",val.site,
                "</td></tr>"].join("");
    }).join("");
    elem("result").innerHTML=str1+str2+"</table>";
    elem(id).value="";
}
const res_search=(input)=>{
    const strs=input.getAttribute("value").split(",");
    if(strs[0]=="num") strs[1]=Number(strs[1]);
    elem(strs[0]).value=strs[1];
    search(elem(strs[0]));
    return false;
};
var quiz={
    pointer:-1,
    arr:[],
    exclude:[],
    choices:[],
    id:0,
    blue:0,
    red:0,
    answered:false,
    counter:-1,
    touchX:[],
};
var downloadLink=elem("downloadLink");
function quiz_answer(btn){
    quiz.id=Number(btn.getAttribute("id").slice(3));
    if(!quiz.answered){
        quiz.answered=true;
        if(quiz.arr[quiz.pointer].site===quiz.choices[quiz.id]){
            quiz.blue=quiz.id;
            elem("quiz_answer").innerText="〇"+quiz.arr[quiz.pointer].site;
            elem("btn"+quiz.id).className="choices back_green";
            elem("quiz_answer").className="font_green";
            quiz.exclude.push(quiz.arr[quiz.pointer]);
            deleteSample();
            createSample();
        }else{
            elem("quiz_answer").innerText="✕"+quiz.arr[quiz.pointer].site;
            elem("btn"+quiz.id).className="choices back_red";
            quiz.blue=quiz.choices.indexOf(quiz.arr[quiz.pointer].site);
            quiz.red=quiz.id;
            elem("btn"+quiz.blue).className="choices back_blue"
            elem("quiz_answer").className="font_red";
        }
        elem("quiz_counter").innerText="Your Score: "+quiz.exclude.length+"/"+quiz.counter;
    }else{
        if(quiz.id===quiz.blue) next_quiz();
    }
}
function next_quiz(){
    quiz.counter++;
    quiz.answered=false;
    elem("btn"+quiz.red).className="choices";
    elem("btn"+quiz.blue).className="choices";
    quiz.pointer++;
    let confirm=true;
    if(!quiz.arr[quiz.pointer]){
        quiz.pointer=0;
        quiz.arr=jsonarr.filter(val=>val.hotel&&val.identified&&!quiz.exclude.includes(val)).map(val=>{return {x:val,y:Math.random()}}).sort((a,b)=>b.y-a.y).map(val=>val.x);
        if(quiz.arr.length===0){
            confirm=window.confirm("Congratulations! You've made answers correctly for ALL quizes I prepared. Do you want to reset storage and play it again?");
            if(confirm) clear_storage(true);
        }
    }
    if(confirm){
        const val=quiz.arr[quiz.pointer];
        elem("quiz_name").innerText="#"+val.num+" "+val.girl+" "+val.genre;
        elem("quiz_answer").innerText="";
        elem("quiz_title").innerHTML="<a target='_blank' href='"+val.url+"'>"+val.title+"</a>";
        elem("quiz_iframe").setAttribute("src",val.url);
    }
    elem("quiz_counter").innerText="Your Score: "+quiz.exclude.length+"/"+quiz.counter;
    deleteSample();
    createSample();
}
function openclose(btn){
    const id=btn.getAttribute("href").slice(1);
    if(elem(id).className==="invisible") elem(id).className="";
    else elem(id).className="invisible";
    return false;
}
function button(str){
    if(["Scatter","Date","Girl"].includes(str)){
        se.s_d_g=str;
        if(str==="Date") elem("date_button").className="";
        else elem("date_button").className="hidden";
    }else if(["site","genre"].includes(str)){
        se.s_g=str;
        if(str==="site") elem("genre_checklist").className="";
        else elem("genre_checklist").className="hidden";
    }else if([7,4].includes(str)) se.date_tick=str;
    setting2summary();
}
const dateParser=()=>{
    se.date_range=[elem("range_since").value,elem("range_until").value];
    setting2summary();
}

function clear_storage(boolean){
    let t=boolean;
    if(!boolean) t=window.confirm("May I clear storage of your answer data?");
    if(t){
        deleteSample();
        quiz.exclude=[];
        quiz.counter=-1;
        createSample();
        quiz.arr=jsonarr.filter(val=>val.hotel&&val.identified&&!quiz.exclude.includes(val)).map(val=>{return {x:val,y:Math.random()}}).sort((a,b)=>b.y-a.y).map(val=>val.x);
        quiz.pointer=-1;
        next_quiz();
    }
}
/* Database */
var ver = 1, dbName="s-cute", storeName="exclude", key_id=1;
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction;
var db = null;

function createSample(){
    let openRequest = indexedDB.open(dbName, ver);
    openRequest.onupgradeneeded=(e)=>{
        console.log("create-upgradeneeded");
        db = openRequest.result;
        db.createObjectStore(storeName, { "keyPath": "id" });
        console.log(db.objectStoreNames);
    }
    openRequest.onsuccess=(e)=>{
        db = openRequest.result;
        let addRequest = db.transaction(storeName, "readwrite").objectStore(storeName).put({
            id:key_id,
            result:{
                exclude:quiz.exclude,
                counter:quiz.counter,
            },
        });
        addRequest.onsuccess=()=>console.log("Success");
        addRequest.onerror=(e)=>console.log(e.message);
    }
    openRequest.onerror=(e)=>console.log(e.message);
    openRequest.onblocked=(e)=>console.log("blocked",e.message);
}
const getSample=()=>{
    return new Promise((resolve,reject)=>{
        let openRequest=indexedDB.open(dbName,ver);
        db=null;
        openRequest.onsuccess=(e)=>{
            db=openRequest.result;
            if(db.objectStoreNames.length>0){
                const transaction = db.transaction([storeName], IDBTransaction.READ_ONLY);
                let getRequest = transaction.objectStore(storeName).get(key_id);
                getRequest.onsuccess=(e)=>{
                    quiz.exclude=getRequest.result.result.exclude;
                    quiz.counter=getRequest.result.result.counter;
                    if(quiz.exclude&&quiz.counter){
                        resolve();
                    }else{
                        console.log("Not Found");
                        reject();
                    }
                }
                getRequest.onerror=(e)=>{
                    console.log(e.message);
                    reject();
                };
            }else{
                console.log("db none");
                db.close();
                deleteSample();
                reject();
            }
        }
        openRequest.onerror=(e)=>{
            console.log(e.message);
            reject();
        };
    });
}
function deleteSample() {
    if(db) db.close();
    var deleteRequest = indexedDB.deleteDatabase(dbName);
    deleteRequest.onsuccess=(e)=>console.log("Deleted in Successful",e.message);
    deleteRequest.onerror=(e)=>console.log(e.message);
    deleteRequest.onblocked=(e)=>console.log("There is a severe error, I hope you don't get this message.",e.message);
}
const openFile=()=>{
    return new Promise((resolve,reject)=>{
        fetch("./s-cute.csv").then((response)=>response.text()).then((csvData)=>{
            jsonarr=[];
            let num=0,girl="aaa";
            const arr=csvData.split("\n");
            arr.forEach((valstr)=>{
                if(valstr.length>0){
                    const valarr=valstr.split(",");
                    const identify=(site)=>{
                        if(["Unidentified","Apparently Not Hotel",""].includes(site)) return false;
                        else return true;
                    }
                    /*
                    const short=(genre)=>{
                        if(genre.includes("Short")) return true;
                        else return false;
                    }
                    */
                    const site=(site)=>{
                        if(site==="") return "Unidentified";
                        else return site;
                    }
                    const hotel=(site)=>{
                        if(["Apparently Not Hotel","グランアクス代々木上原","ラトゥール新宿？"].includes(site)) return false;
                        else return true;
                    }
                    if(valarr[0]!==""){
                        num=valarr[0];
                        girl=valarr[1];
                    }
                    jsonarr.push({
                        num:String(Number(num)),
                        girl:girl,
                        genre:valarr[2],
                        //short:short(valarr[2]),
                        title:valarr[3],
                        url:valarr[4],
                        date:valarr[5],
                        identified:identify(valarr[6]),
                        hotel:hotel(valarr[6]),
                        site:site(valarr[6]),
                        //room:valarr[7],
                    });
                }
            });
            resolve();
        }).catch(()=>reject());
    });
};
const opener=()=>{
    const open_File=openFile();
    const get_Sample=getSample();
    Promise.all([open_File,get_Sample]).then(()=>{
        json2setting();
        //setting2summary();
    }).catch(()=>{
        open_File.then(()=>{
        json2setting();
        //setting2summary();
        });
        get_Sample.catch(()=>{
            createSample();
        });
    });
};
opener();
