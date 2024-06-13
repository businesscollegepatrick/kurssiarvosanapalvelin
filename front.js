async function sendData() {
  const formData = new URLSearchParams();
  const formArvosanat = document.querySelector("#kurssiarvosanat").value;
  formData.append("kurssiarvosanat", formArvosanat);

  try {
    const response = await fetch("http://localhost:3000/lataa", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    document.getElementById("lataustulos").innerHTML = data.message; // Oletetaan, että palvelin lähettää viestin nimellä "message"
    document.querySelector("#kurssiarvosanat").value = ""; // Tyhjentää lomakkeen kentän
  } catch (e) {
    document.getElementById("virhe").innerHTML = "Virhe lähetyksessä: " + e.message; // Näyttää virheilmoituksen
    console.error(e);
  }
}

async function search() {
  const formData = new URLSearchParams();
  const formKurssi = document.querySelector("#kurssi").value;
  const formOpiskelija = document.querySelector("#opiskelija").value;
  formData.append("kurssi", formKurssi);
  formData.append("opiskelija", formOpiskelija);

  try {
    const response = await fetch("http://localhost:3000/hae", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    const hakutulosElementti = document.getElementById("hakutulos");

    hakutulosElementti.innerHTML = ""; // Tyhjennetään aiemmat hakutulokset

    if (data.result && data.result !== "Ei hakutulosta") {
      data.result.forEach(tulos => {
        const tulosElementti = document.createElement("div");
        tulosElementti.className = "hakutulos-item";

        const kurssiElementti = document.createElement("p");
        kurssiElementti.textContent = `Kurssi: ${tulos.kurssi}`;

        const opiskelijaElementti = document.createElement("p");
        opiskelijaElementti.textContent = `Opiskelija: ${tulos.opiskelija}`;

        const arvosanaElementti = document.createElement("p");
        arvosanaElementti.textContent = `Arvosana: ${tulos.arvosana}`;

        tulosElementti.appendChild(kurssiElementti);
        tulosElementti.appendChild(opiskelijaElementti);
        tulosElementti.appendChild(arvosanaElementti);

        hakutulosElementti.appendChild(tulosElementti);
      });
    } else {
      hakutulosElementti.innerHTML = "Ei hakutulosta.";
    }
  } catch (e) {
    document.getElementById("hakuvirhe").innerHTML = "Hakuvirhe: " + e.message; // Näyttää virheilmoituksen
    console.error(e);
  }
}


document.querySelector("#lisaa").addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
});

document.querySelector('#haku').addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});
