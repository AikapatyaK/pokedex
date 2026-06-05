let chart;
let typeChart;

let currentForms = [];
let currentIndex = 0;

let scanEnabled = true;
let shinyMode = false;

/* 18 TYPE SYSTEM */
const typeEffect = {
    normal: { rock:0.5, ghost:0, steel:0.5 },
    fire: { grass:2, ice:2, bug:2, steel:2, water:0.5, rock:0.5, dragon:0.5 },
    water: { fire:2, rock:2, ground:2, water:0.5, grass:0.5, dragon:0.5 },
    electric: { water:2, flying:2, electric:0.5, ground:0 },
    grass: { water:2, ground:2, rock:2, fire:0.5, grass:0.5, flying:0.5, bug:0.5, poison:0.5, dragon:0.5, steel:0.5 },
    ice: { grass:2, ground:2, flying:2, dragon:2, fire:0.5, water:0.5, ice:0.5, steel:0.5 },
    fighting: { normal:2, rock:2, steel:2, ice:2, dark:2, ghost:0, flying:0.5, poison:0.5, psychic:0.5, bug:0.5, fairy:0.5 },
    poison: { grass:2, fairy:2, poison:0.5, ground:0.5, rock:0.5, ghost:0.5, steel:0 },
    ground: { fire:2, electric:2, poison:2, rock:2, steel:2, grass:0.5, bug:0.5, flying:0 },
    flying: { grass:2, fighting:2, bug:2, electric:0.5, rock:0.5, steel:0.5 },
    psychic: { fighting:2, poison:2, psychic:0.5, dark:0, steel:0.5 },
    bug: { grass:2, psychic:2, dark:2, fire:0.5, fighting:0.5, flying:0.5, poison:0.5, ghost:0.5, steel:0.5, fairy:0.5 },
    rock: { fire:2, ice:2, flying:2, bug:2, fighting:0.5, ground:0.5, steel:0.5 },
    ghost: { psychic:2, ghost:2, normal:0, dark:0.5 },
    dragon: { dragon:2, steel:0.5, fairy:0 },
    dark: { psychic:2, ghost:2, fighting:0.5, dark:0.5, fairy:0.5 },
    steel: { ice:2, rock:2, fairy:2, fire:0.5, water:0.5, electric:0.5, steel:0.5 },
    fairy: { fighting:2, dragon:2, dark:2, fire:0.5, poison:0.5, steel:0.5 }
};

/* SCAN */
function toggleScan() {
    scanEnabled = !scanEnabled;
    document.getElementById("scanBtn").innerText =
        scanEnabled ? "SCAN: ON" : "SCAN: OFF";
}

function playScan() {

    if (!scanEnabled) return;

    const scan = document.getElementById("scan");

    scan.classList.remove("active");
    void scan.offsetWidth;
    scan.classList.add("active");
}

/* SHINY */
function toggleShiny() {
    shinyMode = !shinyMode;
    document.getElementById("shinyBtn").innerText =
        shinyMode ? "SHINY: ON" : "SHINY: OFF";
    updateUI();
}

/* SEARCH */
async function search() {

    const id = document.getElementById("input").value;
    if (!id) return;

    playScan();

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    const speciesRes = await fetch(data.species.url);
    const species = await speciesRes.json();

    const formEntries = species.varieties;

    currentForms = [];

    const select = document.getElementById("formsSelect");
    select.innerHTML = "";

    for (let i = 0; i < formEntries.length; i++) {

        const formRes = await fetch(formEntries[i].pokemon.url);
        const formData = await formRes.json();

        currentForms.push(formData);

        const option = document.createElement("option");
        option.value = i;
        option.innerText = formData.name.toUpperCase();
        select.appendChild(option);
    }

    select.style.display = "inline-block";

    currentIndex = 0;

    setTimeout(() => {
        updateUI();
        document.getElementById("pokedex").classList.add("active");
    }, 900);
}

/* FORM */
function changeForm() {
    currentIndex = document.getElementById("formsSelect").value;
    updateUI();
}

/* UI */
function updateUI() {

    const p = currentForms[currentIndex];

    document.getElementById("name").innerText =
        p.name.toUpperCase();

    const sprite = document.getElementById("sprite");

    sprite.src = shinyMode
        ? p.sprites.other["official-artwork"].front_shiny
        : p.sprites.other["official-artwork"].front_default;

    const types = p.types.map(t => t.type.name);

    document.getElementById("types").innerText =
        "TYPES: " + types.map(t => t.toUpperCase()).join(" / ");

    drawStats(p.stats);
    drawTypeChart(types);
}

/* STATS */
function drawStats(stats) {

    const ctx = document.getElementById("statsChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["HP","ATK","DEF","SP.ATK","SP.DEF","SPD"],
            datasets: [{
                data: stats.map(s => s.base_stat),
                backgroundColor: "rgba(0,200,255,0.2)",
                borderColor: "blue"
            }]
        }
    });
}

/* TYPE */
function calc(types) {

    const result = {};

    for (let atk in typeEffect) {

        let mult = 1;

        for (let def of types) {
            if (typeEffect[atk][def] !== undefined) {
                mult *= typeEffect[atk][def];
            }
        }

        result[atk] = mult;
    }

    return result;
}

function drawTypeChart(types) {

    const match = calc(types);

    const ctx = document.getElementById("typeChart");

    if (typeChart) typeChart.destroy();

    typeChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(match),
            datasets: [{
                data: Object.values(match),
                backgroundColor: Object.values(match).map(v =>
                    v >= 2 ? "red" :
                    v <= 0.5 ? "blue" :
                    "gray"
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}