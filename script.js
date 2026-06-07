let statsChart;
let typeChart;

let forms = [];
let current = 0;

let shiny = false;
let scan = true;

const ALL_TYPES = [
"normal",
"fire",
"water",
"electric",
"grass",
"ice",
"fighting",
"poison",
"ground",
"flying",
"psychic",
"bug",
"rock",
"ghost",
"dragon",
"dark",
"steel",
"fairy"
];

document
.getElementById("input")
.addEventListener(
"keydown",
e=>{
if(e.key==="Enter"){
search();
}
}
);

function show(){
document
.querySelectorAll(".reveal")
.forEach(
x=>x.classList.add("show")
);
}

function toggleScan(){

scan=!scan;

scanBtn.innerText=
scan
?
"SCAN ON"
:
"SCAN OFF";

}

function toggleShiny(){

shiny=!shiny;

shinyBtn.innerText=
shiny
?
"SHINY ON"
:
"SHINY OFF";

render();

}

async function animate(){

if(!scan)return;

const s=
document
.getElementById(
"scan"
);

s.classList.remove(
"scanActive"
);

void s.offsetWidth;

s.classList.add(
"scanActive"
);

await new Promise(
r=>
setTimeout(
r,
1200
)
);

}

async function search(){

const value=
input
.value
.trim()
.toLowerCase();

if(!value)return;

await animate();

try{

const pokemon=

await(
await fetch(
`https://pokeapi.co/api/v2/pokemon/${value}`
)
).json();

const species=

await(
await fetch(
pokemon.species.url
)
).json();

forms=[];

formsSelect.innerHTML="";

for(const v of species.varieties){

const f=
await(
await fetch(
v.pokemon.url
)
).json();

forms.push(f);

formsSelect.innerHTML+=
`
<option>
${f.name.toUpperCase()}
</option>
`;

}

current=0;

const evo=

await(
await fetch(
species.evolution_chain.url
)
).json();

let chain=[];

let c=evo.chain;

while(c){

chain.push(
c.species.name.toUpperCase()
);

c=
c.evolves_to[0];

}

evolution.innerText=
chain.join(
" → "
);

show();

render();

}
catch{

alert(
"POKEMON NOT FOUND"
);

}

}

function changeForm(){

current=
formsSelect.selectedIndex;

render();

}

function render(){

if(!forms.length)
return;

const p=
forms[current];

name.innerText=
p.name.toUpperCase();

sprite.src=

shiny

?

(
p.sprites.other["official-artwork"].front_shiny
||
p.sprites.front_shiny
)

:

(
p.sprites.other["official-artwork"].front_default
||
p.sprites.front_default
);

types.innerText=

"TYPES: "+

p.types

.map(
x=>
x.type.name.toUpperCase()
)

.join(
" / "
);

drawStats(
p.stats
);

drawTypeEffectiveness(
p.types
);

}

function drawStats(stats){

if(statsChart)
statsChart.destroy();

statsChart=
new Chart(
document.getElementById(
"statsChart"
),
{
type:"radar",

data:{

labels:[
"HP",
"ATK",
"DEF",
"SPA",
"SPD",
"SPE"
],

datasets:[
{
data:
stats.map(
s=>
s.base_stat
)
}
]

},

options:{

plugins:{
legend:{
display:false
}
}

}

}

);

}

async function drawTypeEffectiveness(types){

let result={};

ALL_TYPES.forEach(
t=>
result[t]=1
);

for(const t of types){

const data=
await(
await fetch(
t.type.url
)
).json();

data.damage_relations.double_damage_from.forEach(
x=>
result[x.name]*=2
);

data.damage_relations.half_damage_from.forEach(
x=>
result[x.name]*=0.5
);

data.damage_relations.no_damage_from.forEach(
x=>
result[x.name]*=0
);

}

if(typeChart)
typeChart.destroy();

typeChart=
new Chart(

document.getElementById(
"typeChart"
),

{

type:"bar",

data:{

labels:
ALL_TYPES.map(
x=>
x.toUpperCase()
),

datasets:[{

label:"Damage",

data:
ALL_TYPES.map(
t=>
result[t]
)

}]

},

options:{

responsive:true,

scales:{

y:{

min:0,

max:4

}

},

plugins:{

legend:{

display:false

}

}

}

}

);

}
