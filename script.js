let chart;
let typeChart;

let current = [];
let index = 0;

let shiny = false;
let scanEnabled = true;

/* ELEMENT HELPERS */
const el = (id) => document.getElementById(id);

/* ENTER KEY SUPPORT */
document.addEventListener("keydown", (e) => {
if (e.key === "Enter") search();
});

/* BUTTONS */
function toggleScan() {
scanEnabled = !scanEnabled;
el("scanBtn").innerText = scanEnabled ? "SCAN ON" : "SCAN OFF";
}

function toggleShiny() {
shiny = !shiny;
el("shinyBtn").innerText = shiny ? "SHINY ON" : "SHINY OFF";
update();
}

/* SCAN ANIMATION */
async function animateScan() {
if (!scanEnabled) return;

const scan = el("scan");
scan.classList.remove("active");
void scan.offsetWidth;
scan.classList.add("active");

await new Promise(r => setTimeout(r, 1200));
}

/* SEARCH */
async function search() {
const input = el("input").value.trim().toLowerCase();
if (!input) return;

document.querySelectorAll(".reveal").forEach(x => x.classList.remove("show"));

await animateScan();

try {
const poke = await (await fetch(
`https://pokeapi.co/api/v2/pokemon/${input}`
)).json();

const species = await (await fetch(poke.species.url)).json();

current = [];
el("formsSelect").innerHTML = "";

for (const v of species.varieties) {
const form = await (await fetch(v.pokemon.url)).json();
current.push(form);

el("formsSelect").innerHTML += `
<option>${form.name.toUpperCase()}</option>
`;
}

index = 0;

/* EVOLUTION */
const evoData = await (await fetch(species.evolution_chain.url)).json();

let line = [];
let c = evoData.chain;

while (c) {
line.push(c.species.name.toUpperCase());
c = c.evolves_to[0];
}

el("evolution").innerText = line.join(" → ");

update();

document.querySelectorAll(".reveal").forEach(x => x.classList.add("show"));

} catch (err) {
alert("POKEMON NOT FOUND");
}
}

/* FORM SWITCH */
function changeForm() {
index = el("formsSelect").selectedIndex;
update();
}

/* UPDATE DISPLAY */
function update() {
if (!current.length) return;

const p = current[index];

el("name").innerText = p.name.toUpperCase();

el("sprite").src = shiny
? (p.sprites.other["official-artwork"].front_shiny || p.sprites.front_shiny)
: (p.sprites.other["official-artwork"].front_default || p.sprites.front_default);

el("types").innerText =
"TYPES: " +
p.types.map(t => t.type.name.toUpperCase()).join(" / ");

drawStats(p.stats);
drawTypeChart(p.types.map(t => t.type.name));
}

/* STATS CHART */
function drawStats(stats) {
if (chart) chart.destroy();

chart = new Chart(el("statsChart"), {
type: "radar",
data: {
labels: ["HP","ATK","DEF","SPA","SPD","SPE"],
datasets: [{
label: "",
data: stats.map(s => s.base_stat)
}]
},
options: {
plugins: { legend: { display: false } },
responsive: true
}
});
}

/* TYPE CHART (FIXED FULL 18 TYPES) */
const TYPES = [
"normal","fire","water","electric","grass","ice",
"fighting","poison","ground","flying","psychic",
"bug","rock","ghost","dragon","dark","steel","fairy"
];

const EFFECT = {
normal:{rock:.5,ghost:0,steel:.5},
fire:{grass:2,ice:2,bug:2,steel:2,fire:.5,water:.5,rock:.5,dragon:.5},
water:{fire:2,ground:2,rock:2,water:.5,grass:.5,dragon:.5},
electric:{water:2,flying:2,electric:.5,grass:.5,dragon:.5,ground:0},
grass:{water:2,ground:2,rock:2,fire:.5,grass:.5,flying:.5,bug:.5,poison:.5,steel:.5,dragon:.5},
ice:{grass:2,ground:2,flying:2,dragon:2,fire:.5,water:.5,ice:.5,steel:.5},
fighting:{normal:2,rock:2,steel:2,ice:2,dark:2,flying:.5,psychic:.5,fairy:.5},
poison:{grass:2,fairy:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0},
ground:{fire:2,electric:2,poison:2,rock:2,steel:2,grass:.5,bug:.5,flying:0},
flying:{grass:2,fighting:2,bug:2,electric:.5,rock:.5,steel:.5},
psychic:{fighting:2,poison:2,psychic:.5,steel:.5,dark:0},
bug:{grass:2,psychic:2,dark:2,fire:.5,fighting:.5,flying:.5,ghost:.5,steel:.5,fairy:.5},
rock:{fire:2,ice:2,flying:2,bug:2,fighting:.5,ground:.5,steel:.5},
ghost:{psychic:2,ghost:2,normal:0,dark:.5},
dragon:{dragon:2,steel:.5,fairy:0},
dark:{psychic:2,ghost:2,fighting:.5,dark:.5,fairy:.5},
steel:{ice:2,rock:2,fairy:2,fire:.5,water:.5,electric:.5,steel:.5},
fairy:{dragon:2,fighting:2,dark:2,fire:.5,poison:.5,steel:.5}
};

async function drawTypeChart(types) {
if (typeChart) typeChart.destroy();

let result = {};

TYPES.forEach(t => result[t] = 1);

for (const t of types) {
for (const def in EFFECT[t]) {
result[def] *= EFFECT[t][def];
}
}

typeChart = new Chart(el("typeChart"), {
type: "bar",
data: {
labels: TYPES.map(t => t.toUpperCase()),
datasets: [{
label: "",
data: TYPES.map(t => result[t])
}]
},
options: {
plugins: { legend: { display: false } },
responsive: true,
maintainAspectRatio: false,
scales: {
y: { min: 0, max: 4 }
}
}
});
}
