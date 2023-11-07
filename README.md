# eperusteet-ui

[![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ui)
[![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ui/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ui/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-ui/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-ui)


## 1. Palvelun tehtävä

Opetussuunnitelmien perusteiden laadintatyökalun käyttöliittymä.

## 2. Arkkitehtuuri



## 3. Kehitysympäristö

### 3.1. Esivaatimukset

Asenna haluamallasi tavalla (esim [nvm](https://github.com/nvm-sh/nvm)) `Node.js 14 LTS`

### Rajapintojen generointi

Projekti käyttää eperusteet-frontend-utilsia joka otetaan käyttöön gitin submodulena.
Tämä onnistuu ajamalla projektin juuressa `git submodule update --init --recursive`

Tämän jälkeen generoi typescript interfacet backendin rajapinnasta ajamalla seuraavat komennot:

```bash
cd eperusteet-frontend-utils/vue
yarn install
yarn gen:api
```

Tämän jälkeen poista node_modules-kansio `eperusteet-frontend-utils/vue` alta
ja aja vielä `yarn install` koko projektin juuressa.

Rajapintojen generointiin käytetään oletuksena eperusteisiin generoitua apikuvausta Tiedoston voi ylikirjoittaa
ympäristömuuttujalla EPERUSTEET\_SPECFILE osoittamaan hakemistoon.

### 3.2. Testien ajaminen

```bash

# Kaikki testit
yarn test

# Ainoastaan yksikkötestit
yarn test:unit

# Pitää testit käynnissä
yarn test:unit:dev

# e2e testit
yarn test:e2e

# Editoi e2e testejä
yarn dev:e2e
```


### 3.4. Ajaminen lokaalisti


#### Kehitysympäristön käynnistys

Käynnistä ensin [eperusteet backend](https://github.com/Opetushallitus/eperusteet)

Sen jälkeen komento:
```bash
yarn serve
```

#### Lähdekoodin analysoiminen

```bash
yarn lint

# Korjaus automaattisesti
yarn lint:fix

yarn test:unit:coverage
```

#### Tuotantoversion buildaus

```bash
yarn build
```

### 3.4.1. Kikkoja lokaaliin kehitykseen


### 3.6. Versiohallinta

## 4. Ympäristöt

### 4.1. Testiympäristöt

Testiympäristöjen swaggerit löytyvät seuraavista osoitteista

- [untuva](https://virkailija.untuvaopintopolku.fi/eperusteet-app/#/fi)
- [hahtuva](https://virkailija.hahtuvaopintopolku.fi/eperusteet-app/#/fi)
- [QA eli pallero](https://virkailija.testiopintopolku.fi/eperusteet-app/#/fi)

### 4.3. Lokit



### 4.4. Continuous integration

https://github.com/Opetushallitus/eperusteet-ui/actions

### 5. Koodityyli

Suositeltavia resursseja:
 - [Vue style guide](https://vuejs.org/v2/style-guide)
 - [BootstrapVue](https://bootstrap-vue.org/docs)

## ePerusteet-projektit

|Projekti|Build status|Maintainability|Test Coverage|Known Vulnerabilities|
|-----|-----|-----|-----|-----|
|[ePerusteet](https://github.com/Opetushallitus/eperusteet) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet)|     |     |     |
|[ePerusteet-amosaa](https://github.com/Opetushallitus/eperusteet-amosaa) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-amosaa)|     |     |     |
|[ePerusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops)|     |     |     |
|[ePerusteet-ui](https://github.com/Opetushallitus/eperusteet-ui) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ui)|     |     |     |
|[eperusteet-ylops-ui](https://github.com/Opetushallitus/eperusteet-ylops-ui) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-ylops-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-ylops-ui) | [![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-ui/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ylops-ui/test_coverage)|     |
|[ePerusteet-amosaa-ui](https://github.com/Opetushallitus/eperusteet-amosaa-ui) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-amosaa-ui.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-amosaa-ui)|     |     |     |
|[ePerusteet-opintopolku](https://github.com/Opetushallitus/eperusteet-opintopolku) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-opintopolku) | [![Maintainability](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/24fc0c3e2b968b432319/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-opintopolku/test_coverage)|     |
|[ePerusteet-backend-utils](https://github.com/Opetushallitus/eperusteet-backend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-backend-utils)|     |     |     |
|[ePerusteet-frontend-utils](https://github.com/Opetushallitus/eperusteet-frontend-utils) | [![Build Status](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils.svg?branch=master)](https://travis-ci.org/Opetushallitus/eperusteet-frontend-utils) | [![Maintainability](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/maintainability) | [![Test Coverage](https://api.codeclimate.com/v1/badges/f782a4a50622ae34a2bd/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-frontend-utils/test_coverage)|     |

