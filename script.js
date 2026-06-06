let chart;
let typeChart;

let currentForms = [];
let currentIndex = 0;

let scanEnabled = true;
let shinyMode = false;

const typeEffect = {
normal:{rock:0.5,ghost:0,steel:0.5},
fire:{grass:2,ice:2,bug:2,steel:2,water:0.5,rock:0.5,dragon:0.5},
water:{fire:2,rock:2,ground:2,water:0.5,grass:0.5,dragon:0.5},
electric:{water:2,flying:2,electric:0.5,ground:0},
grass:{water:2,ground:2,rock:2,fire:0.5,grass:0.5,flying:0.5,bug:0.5,poison:0.5,dragon:0.5,steel:0.5},
ice:{grass:2,ground:2,flying:2,dragon:2,fire:0.5,water:0.5,ice:0.5,steel:0.5},
fighting:{normal:2,rock:2,steel:2,ice:2,dark:2,ghost:0},
poison:{grass:2,fairy:2,steel:0},
ground:{fire:2,electric:2,poison:2,rock:2,steel:2,flying:0},
flying:{grass:2,fighting:2,bug:2},
psychic:{fighting:2,poison:2,dark:0},
bug:{grass:2,psychic:2,dark:2},
rock:{fire:2,ice:2,flying:2,bug:2},
ghost:{psychic:2,ghost:2,normal:0},
dragon:{dragon:2,fairy:0},
dark:{psychic:2,ghost:2},
steel:{ice:2,rock:2,fairy:2},
fairy:{fighting:2,dragon:2,dark:2}
};

function toggleScan(){
scanEnabled=!scanEnabled;

document.getElementById("scanBtn").innerText=
scanEnabled?"SCAN: ON":"SCAN: OFF";
}

function playScan(){

if(!scanEnabled)return;

const scan=document.getElementById("scan");

scan.classList.remove("active");

void scan.offsetWidth;

scan.classList.add("active");

}

function toggleShiny(){

shinyMode=!shinyMode;

document.getElementById("shinyBtn").innerText=
shinyMode?"SHINY: ON":"SHINY: OFF";

updateUI();

}

async function search(){

let input=
document
.getElementById("input")
.value
.trim()
.toLowerCase();

if(!input)return;

playScan();

try{

const res=
await fetch(
`https://pokeapi.co/api/v2/pokemon/${input}`
);

if(!res.ok){

alert("POKEMON NOT FOUND");

return;

}

const data=
await res.json();

const species=
await(
await fetch(
data.species.url
)
).json();

currentForms=[];

const select=
document.getElementById(
"formsSelect"
);

select.innerHTML="";

for(const v of species.varieties){

const form=
await(
await fetch(
v.pokemon.url
)
).json();

currentForms.push(form);

const option=
document.createElement(
"option"
);

option.value=
currentForms.length-1;

option.text=
form.name
.toUpperCase();

select.appendChild(
option
);

}

select.style.display=
"inline-block";

currentIndex=0;

setTimeout(()=>{

updateUI();

document
.getElementById(
"pokedex"
)
.classList.add(
"active"
);

},900);

}catch{

alert(
"POKEMON NOT FOUND"
);

}

}

function changeForm(){

currentIndex=
Number(
document
.getElementById(
"formsSelect"
)
.value
);

updateUI();

}

function updateUI(){

if(
!currentForms.length
)return;

const p=
currentForms[
currentIndex
];

document
.getElementById(
"name"
)
.innerText=
p.name.toUpperCase();

const sprite=
document.getElementById(
"sprite"
);

sprite.src=
shinyMode
?
(
p.sprites.other[
"official-artwork"
].front_shiny
||
p.sprites.front_shiny
)
:
(
p.sprites.other[
"official-artwork"
].front_default
||
p.sprites.front_default
);

document
.getElementById(
"types"
)
.innerText=
"TYPES: "+
p.types
.map(
x=>
x.type.name
.toUpperCase()
)
.join(" / ");

drawStats(
p.stats
);

drawTypeChart(
p.types.map(
t=>t.type.name
)
);

}

function drawStats(stats){

const ctx=
document
.getElementById(
"statsChart"
);

if(chart)
chart.destroy();

chart=
new Chart(
ctx,
{
type:"radar",

data:{

labels:[
"HP",
"ATK",
"DEF",
"SPATK",
"SPDEF",
"SPD"
],

datasets:[{

data:
stats.map(
s=>
s.base_stat
),

backgroundColor:
"rgba(0,150,255,.3)",

borderColor:
"blue"

}]

}

}

);

}

function calc(types){

let result={};

for(let atk in typeEffect){

let mult=1;

for(let def of types){

if(
typeEffect[atk]
?.[def]
!==undefined
){

mult*=
typeEffect[
atk
][
def
];

}

}

result[atk]=mult;

}

return result;

}

function drawTypeChart(types){

const match=
calc(types);

const ctx=
document.getElementById(
"typeChart"
);

if(typeChart)
typeChart.destroy();

typeChart=
new Chart(
ctx,
{
type:"bar",

data:{

labels:
Object.keys(
match
),

datasets:[{

data:
Object.values(
match
)

}]

},

options:{

responsive:true,

maintainAspectRatio:false

}

}

);

}
