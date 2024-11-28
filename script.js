document.addEventListener("DOMContentLoaded", () => {
  const API_URLS = {
      en: "https://mocki.io/v1/bfb40168-1a2f-4324-aa8a-611ab475ab5a",
      it: "https://mocki.io/v1/79f87e5d-b34a-4dba-b64b-32ad4ce919f7"
  };

  const textContent = {
      en: {
          pageTitle: "Compose Your Taco",
          proteinsTitle: "Proteins",
          salsasTitle: "Salsas",
          toppingsTitle: "Toppings",
          buildTaco: "Build Taco",
          switchTo: "Switch to Italian",
          warning: "Please select a protein!",
          success: "Your Taco",
          preview: "Your Taco Ingredients Preview"
      },
      it: {
          pageTitle: "Crea il Tuo Taco",
          proteinsTitle: "Proteine",
          salsasTitle: "Salse",
          toppingsTitle: "Condimenti",
          buildTaco: "Crea Taco",
          switchTo: "Passa all'Inglese",
          warning: "Seleziona una proteina!",
          success: "Il Tuo Taco"
      }
  };

  const names = ["Pollo", "Manzo", "Pesce", "Ceci", "Formaggio", "Maionese Chipotle", "Salsa di Pomodoro", "Lattuga", "Panna Acida", "Insalata di Cavolo"];

  const chosenP = [];
  const chosenS = [];

  const nameMapping = {
    "Pollo": "Chicken",
    "Manzo": "Beef",
    "Pesce" : "Fish",
    "Ceci" : "Chickpeas",
    "Formaggio": "Cheese",
    "Maionese Chipotle" : "Chipotle Mayo",
    "Salsa di Pomodoro" : "Tomato Salsa",
    "Lattuga" : "Lettuce",
    "Panna Acida" : "Sour Cream",
    "Insalata di Cavolo" : "Cabbage Slaw"
};

const nameMappingEn = {
  "Chicken" : "Pollo",
  "Beef" : "Manzo",
  "Fish" : "Pesce",
  "Chickpeas" : "Ceci",
  "Cheese" : "Formaggio",
  "Chipotle Mayo" : "Maionese Chipotle",
  "Tomato Salsa" : "Salsa di pomodoro",
  "Lettuce": "Lattuga",
  "Sour Cream" : "Panna Acida",
  "Cabbage Slaw" : "Insalata di Cavolo"
};

  let currentLanguage = "en";
  const proteinsList = document.getElementById("proteins-list");
  const salsasList = document.getElementById("salsas-list");
  const toppingsList = document.getElementById("toppings-list");
  const tacoLayerStack = document.getElementById("taco-layer-stack");
  const resultDiv = document.getElementById("taco-result");

  let selectedProtein = null;
  let selectedSalsa = null;
  let selectedToppings = [];

  const languageToggleBtn = document.getElementById("language-toggle-btn");

  function setLanguage(lang) {
      currentLanguage = lang;
      document.getElementById("page-title").textContent = textContent[lang].pageTitle;
      document.getElementById("proteins-title").textContent = textContent[lang].proteinsTitle;
      document.getElementById("salsas-title").textContent = textContent[lang].salsasTitle;
      document.getElementById("toppings-title").textContent = textContent[lang].toppingsTitle;
      document.getElementById("build-taco-btn").textContent = textContent[lang].buildTaco;
      languageToggleBtn.textContent = textContent[lang].switchTo;

      // Svuota gli ingredienti selezionati
    selectedProtein = null;
    selectedSalsa = null;
    selectedToppings = [];

    // Svuota la preview e l'output
    tacoLayerStack.innerHTML = ""; // Svuota le immagini nella preview
    resultDiv.innerHTML = "";      // Svuota il riepilogo degli ingredienti

      fetchIngredients(API_URLS[lang]);
  }

  function fetchIngredients(apiUrl) {
      proteinsList.innerHTML = "";
      salsasList.innerHTML = "";
      toppingsList.innerHTML = "";

      fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
              populateList(data.proteins, proteinsList, "protein");
          })
          .catch(error => console.error("Error fetching data:", error));
  }

  function populateList(items, listElement, type) {
    let i = 0;
      items.forEach(item => {
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.innerHTML = `
              <img src="images/proteins/protein${i++}.png" alt="${item.name}">
              ${item.name} (${item.preparation})
          `;

          li.addEventListener("click", () => {
              if (type === "protein") {
                  selectedProtein = item;
                  selectedSalsa = null;
                  selectedToppings = [];
                  updateSelection(listElement, li);
                  updateSecondaryLists(item);
              }
          });

          listElement.appendChild(li);
      });
  }

  function updateSecondaryLists(protein) {
      salsasList.innerHTML = "";
      toppingsList.innerHTML = "";
      tacoLayerStack.innerHTML = ""; // Reset preview

      let name = protein.name;
      if(names.includes(protein.name)){
        name = nameMapping[protein.name];
      }
      if(!chosenP.includes(protein.name)){
        if(chosenP.length > 0){
          let t = chosenP.pop();
          removeLayerToPreview(protein.name);
        }
        addLayerToPreview(protein.name, "images/proteins/" + name + ".png", "protein");
      }

      let i = 0;
      protein.salsas.forEach(salsa => {
        if(!chosenS.includes(protein.salsas[i].name)){
          if(chosenS.length > 0){
            let t = chosenS.pop();
          removeLayerToPreview(protein.salsas[i].name);
          }
        let name = protein.salsas[i].name;
        if(names.includes(protein.salsas[i++].name)){
          name = nameMapping[protein.salsas[i - 1].name];
        }
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.innerHTML = `
              <img src="images/salsas/${name}.png" alt="${salsa.name}">
              ${salsa.name} (${currentLanguage === "en" ? "Spiciness" : "Piccantezza"}: ${salsa.spiciness})
          `;
          li.addEventListener("click", () => {
              selectedSalsa = salsa;
              updateSelection(salsasList, li);
              addLayerToPreview(salsa.name, "images/salsas/" + name + ".png", "salsa");
          });

          salsasList.appendChild(li);
      }});

      i = 0;
      protein.toppings.forEach(topping => {
        let name = protein.toppings[i].name;
        if(names.includes(protein.toppings[i++].name)){
          name = nameMapping[protein.toppings[i - 1].name];
        }
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.innerHTML = `
              <img src="images/toppings/${name}.png" alt="${topping.name}">
              ${topping.name} (${topping.quantity})
          `;
          li.addEventListener("click", () => {
              if (selectedToppings.includes(topping)) {
                  selectedToppings = selectedToppings.filter(t => t !== topping);
                  li.classList.remove("active");
                  
                  removeLayerFromPreview(name, "topping");
              } else {
                  selectedToppings.push(topping);
                  li.classList.add("active");
                  addLayerToPreview(topping.name, "images/toppings/" + name + ".png", "topping");
              }
          });

          toppingsList.appendChild(li);
      });
  }

  
function addLayerToPreview(name, imageUrl, type) {

  // Se è una salsa, rimuove qualsiasi altra salsa dalla preview
  if (type === "salsa") {
      const existingSalsa = Array.from(tacoLayerStack.children).find(layer => layer.dataset.type === "salsa");
      if (existingSalsa) {
          tacoLayerStack.removeChild(existingSalsa);
      }
  }

  if (type == "topping"){
    removeLayerFromPreview(name, type);
  }

  // Crea il livello del taco
  const layer = document.createElement("div");
  layer.className = "taco-layer";
  layer.dataset.name = name; // Per identificare il livello
  layer.dataset.type = type; // Per distinguere il tipo
  layer.innerHTML = `<img src="${imageUrl}" alt="${name}" class="preview-image">`;

  // Aggiunge il livello alla preview
  tacoLayerStack.appendChild(layer);
}

function removeLayerFromPreview(name, type) {
  let t;
  if(currentLanguage === "it" && !(names.includes(name))){
    t = name;
    t = nameMappingEn[name];
  }

  if(t !== undefined){
    name = t;
  }
  const existingLayer = Array.from(tacoLayerStack.children).find(
      layer => layer.dataset.name === name && layer.dataset.type === type
  );
  if (existingLayer) {
      tacoLayerStack.removeChild(existingLayer);
  }
}

  function removeLayerToPreview(name){
    const layer = document.getElementById(name);
      tacoLayerStack.removeChild(layer);
  }

  function updateSelection(listElement, selectedLi) {
      Array.from(listElement.children).forEach(li => li.classList.remove("active"));
      selectedLi.classList.add("active");
  }

  document.getElementById("build-taco-btn").addEventListener("click", () => {
    if (!selectedProtein) {
        resultDiv.innerHTML = `<div class="alert alert-warning">${textContent[currentLanguage].warning}</div>`;
        resultDiv.scrollIntoView({behavior: "smooth"});
        return;
    }

    const toppingsNames = selectedToppings.map(t => t.name).join(", ");
    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <h5>${textContent[currentLanguage].success}:</h5>
            <p><strong>${textContent[currentLanguage].proteinsTitle}:</strong> ${selectedProtein.name} (${selectedProtein.preparation})</p>
            <p><strong>${textContent[currentLanguage].salsasTitle}:</strong> ${selectedSalsa ? selectedSalsa.name : "None"}</p>
            <p><strong>${textContent[currentLanguage].toppingsTitle}:</strong> ${toppingsNames || "None"}</p>
        </div>
    `;
});

  languageToggleBtn.addEventListener("click", () => {
      setLanguage(currentLanguage === "en" ? "it" : "en");
  });

  setLanguage("en");
});
