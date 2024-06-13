const express = require('express');
const csv = require('csv-parser')
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Tämä mahdollistaa JSON-datan käsittelyn

const { port, host } = require('./config.json');

// Staattinen hakemisto HTML, JS ja CSS-tiedostoille
app.use('/includes', express.static('includes'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'templates/index.html')));

// Lue kurssiarvosanat.json tiedosto
let kurssiarvosanat = require('./kurssiarvosanat.json');

// Polku joka vastaanottaa CSV-tiedoston
app.post('/lataa', (req, res) => {
  const arvosanat = req.body.kurssiarvosanat;

  // Lisätään uudet arvosanat olemassaolevaan listaan
  const uudet = [];
  const rivit = arvosanat.split(/\r?\n/);
  for (let rivi of rivit) {
    if (rivi == '"kurssi","opiskelija","arvosana"' || rivi == '') {
      continue;
    }

    let arvosanaArray = rivi.split(',');

    let arvosanaOlio = {
      kurssi: arvosanaArray[0].replaceAll('"', ''),
      opiskelija: arvosanaArray[1].replaceAll('"', ''),
      arvosana: parseInt(arvosanaArray[2].replaceAll('"', '')),
    };
    uudet.push(arvosanaOlio);
  }

  kurssiarvosanat = kurssiarvosanat.concat(uudet);

  fs.writeFile(
    'kurssiarvosanat.json',
    JSON.stringify(kurssiarvosanat, null, 2),
    { encoding: 'utf8' },
    function(err) {
      if (err) {
        console.log('Virhe tiedostoon kirjoittamisessa.');
        res.status(500).json({ "message": "virhe" });
      } else {
        console.log('Kurssiarvosanat kirjoitettu tiedostoon.');
        res.json({ "message": "ok" });
      }
    }
  );
});

// Polku joka vastaanottaa ja vastaa hakuun
app.post('/hae', (req, res) => {
  const opiskelija = req.body.opiskelija;
  const kurssi = req.body.kurssi;

  const vastaus = kurssiarvosanat.filter(kurssiarvosana => {
    const opiskelijaMatch = !opiskelija || kurssiarvosana.opiskelija.includes(opiskelija);
    const kurssiMatch = !kurssi || kurssiarvosana.kurssi.includes(kurssi);
    return opiskelijaMatch && kurssiMatch;
  });

  res.json({ result: vastaus.length > 0 ? vastaus : "Ei hakutulosta" });
});

// Virheenkäsittely
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Jotain meni vikaan palvelimella!');
});

app.listen(port, host, () => { console.log(`Kurssiarvosana palvelin kuuntelee http://${host}:${port}`); });
