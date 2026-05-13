# eperusteet-ui

[![Build Status](https://github.com/Opetushallitus/eperusteet-ui/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-ui/actions/workflows/build.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/maintainability)](https://codeclimate.com/github/Opetushallitus/eperusteet-ui/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/eea9e59302df6e343d57/test_coverage)](https://codeclimate.com/github/Opetushallitus/eperusteet-ui/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/Opetushallitus/eperusteet-ui/badge.svg)](https://snyk.io/test/github/Opetushallitus/eperusteet-ui)


## 1. Palvelun tehtävä

Opetussuunnitelmien perusteiden laadintatyökalun käyttöliittymä.

## 2. Arkkitehtuuri

Single-page -sovellus **Vue 3**:lla ja **Vite**-buildilla; käytössä **@vue/compat** (Vue 2 -yhteensopivuustila migraation aikana). Tilaa hallitaan **Pinia**-storeilla, reititys **Vue Router 4**:llä. Jaetuissa komponenteissa (`eperusteet-frontend-utils`) käytetään **Bootstrap Vue**a ja **Bootstrap**-tyylejä; sovelluksen tyylit **SCSS**:llä. Palvelupyynnöt **axios**illa generoitujen TypeScript-rajapintatyypin kanssa (`eperusteet-frontend-utils`). Testit **Vitest**illä.

Aliasit `vite.config.js`:ssa: `@` → tämän projektin `src`, `@shared` ja `@assets` → `eperusteet-frontend-utils` -submoduulin alla.

## 3. Kehitysympäristö

### 3.1. Esivaatimukset

Asenna haluamallasi tavalla (esim [nvm](https://github.com/nvm-sh/nvm)) `Node.js 24`.

Pakettienhallintaan käytetään **Yarn 4** (määritelty `package.json`:n `packageManager`-kentässä). Käytä Corepackia:

```bash
corepack enable
```

Sen jälkeen `yarn install` projektin juuressa käyttää oikeaa Yarn-versiota.

### 3.2. Lyhyt käynnistyspolku

```bash
git clone <repo-url>
cd eperusteet-ui
git submodule update --init --recursive
yarn install
```

Jos tarvitset tuoreimmat API-tyypit paikalliseen työhön, tee ensin alla kohdan «Rajapintojen generointi» (kohta 3.3) vaiheet. Muuten jatka backendin käynnistyksen jälkeen:

```bash
yarn dev
```

### 3.3. Rajapintojen generointi

Projekti käyttää eperusteet-frontend-utilsia, joka otetaan käyttöön gitin submodulena (`git submodule update --init --recursive` projektin juuressa).

Generoi TypeScript-rajapinnat backendin OpenAPI-kuvauksesta:

```bash
cd eperusteet-frontend-utils/vue
yarn install
yarn gen:api
```

Poista tämän jälkeen `node_modules`-hakemisto polusta `eperusteet-frontend-utils/vue` ja aja `yarn install` koko projektin juuressa.

Oletuksena generointi käyttää ePerusteiden julkaistua API-kuvausta (URL tai polku annetaan skriptille `buildapi.sh`:n kautta). Voit ohittaa sen asettamalla ympäristömuuttujan **`EPERUSTEET_SPECFILE`** osoittamaan omaan OpenAPI JSON -tiedostoosi tai HTTPS-URL:iin (ks. `eperusteet-frontend-utils/vue/scripts/buildapi.sh`).

### 3.4. Testien ajaminen

Projekti käyttää Vitest-testauskirjastoa.

```bash

# Kaikki testit
yarn test

# Testit watch-tilassa
yarn test --watch

# Testit UI:lla
yarn test --ui

```


### 3.5. Ajaminen lokaalisti

#### Kehitysympäristön käynnistys

Käynnistä ensin [eperusteet backend](https://github.com/Opetushallitus/eperusteet) (oletuksena kuuntelee porttia **8080**).

Sen jälkeen:

```bash
yarn dev
```

Vite käynnistyy portissa **9001** ja välittää pyynnöt polusta `/eperusteet-service` backendille (`http://localhost:8080`). Tarvittaessa muuta `vite.config.js`:n `server.proxy`-asetuksia.

#### Lähdekoodin analysoiminen

```bash
yarn lint

# Korjaus automaattisesti
yarn lint --fix

```

#### Tuotantoversion buildaus

Projekti käyttää Vite-builderoa.

```bash
yarn build

# Preview tuotantobuildista
yarn preview
```

### 3.6. Kehitysvinkkejä

- Tuotantobuildin polku (`base`): `/eperusteet-service/ui` (`vite.config.js`).
- `yarn genspec` juuressa ajaa API-generoinnin ja käynnistää dev-palvelimen (`package.json` scripts).

### 3.7. Versiohallinta

Lähdekoodi GitHubissa Opetushallituksen alle. Muutokset tulevat tavanomaisella Git-työnkululla (haarat, pull requestit organisaation käytännön mukaan).

## 4. Ympäristöt

### 4.1. Testiympäristöt

Testiympäristöjen swaggerit löytyvät seuraavista osoitteista

- [untuva](https://virkailija.untuvaopintopolku.fi/eperusteet-app/#/fi)
- [hahtuva](https://virkailija.hahtuvaopintopolku.fi/eperusteet-app/#/fi)
- [QA eli pallero](https://virkailija.testiopintopolku.fi/eperusteet-app/#/fi)

### 4.2. Lokit

Sovelluslogien ja infrastruktuurilokien ajantasaiset ohjeet löytyvät organisaation sisäisestä dokumentaatiosta ja kunkin ympäristön hallinnasta.

### 4.3. Continuous integration

Build ja testit: [GitHub Actions](https://github.com/Opetushallitus/eperusteet-ui/actions) (`build.yml`).

## 5. Koodityyli

Projekti on migroitu Vue 3:een.

Suositeltavia resursseja:
 - [Vue 3 style guide](https://vuejs.org/style-guide/)
 - [Vue 3 documentation](https://vuejs.org/guide/introduction.html)
 - [BootstrapVue](https://bootstrap-vue.org/docs)

## ePerusteet-projektit

|Projekti | Build status |
|-----|-----|
|[ePerusteet](https://github.com/Opetushallitus/eperusteet)|[![Build Status](https://github.com/Opetushallitus/eperusteet/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet/actions)|
|[ePerusteet-amosaa](https://github.com/Opetushallitus/eperusteet-amosaa) | [![Build Status](https://github.com/Opetushallitus/eperusteet-amosaa/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-amosaa/actions)|
|[ePerusteet-ylops](https://github.com/Opetushallitus/eperusteet-ylops) | [![Build Status](https://github.com/Opetushallitus/eperusteet-ylops/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-ylops/actions)|
|[ePerusteet-ui](https://github.com/Opetushallitus/eperusteet-ui) | [![Build Status](https://github.com/Opetushallitus/eperusteet-ui/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-ui/actions)|
|[eperusteet-ylops-ui](https://github.com/Opetushallitus/eperusteet-ylops-ui) | [![Build Status](https://github.com/Opetushallitus/eperusteet-ylops-ui/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-ylops-ui/actions) |
|[ePerusteet-amosaa-ui](https://github.com/Opetushallitus/eperusteet-amosaa-ui) | [![Build Status](https://github.com/Opetushallitus/eperusteet-amosaa-ui/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-amosaa-ui/actions)|
|[ePerusteet-opintopolku](https://github.com/Opetushallitus/eperusteet-opintopolku) | [![Build Status](https://github.com/Opetushallitus/eperusteet-opintopolku/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-opintopolku/actions) |
|[ePerusteet-backend-utils](https://github.com/Opetushallitus/eperusteet-backend-utils) | [![Build Status](https://github.com/Opetushallitus/eperusteet-backend-utils/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-backend-utils/actions)|
|[ePerusteet-frontend-utils](https://github.com/Opetushallitus/eperusteet-frontend-utils) | [![Build Status](https://github.com/Opetushallitus/eperusteet-frontend-utils/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-frontend-utils/actions) |
|[ePerusteet-pdf](https://github.com/Opetushallitus/eperusteet-pdf) | [![Build Status](https://github.com/Opetushallitus/eperusteet-pdf/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-pdf/actions) |
|[eperusteet-e2e-smoke-test](https://github.com/Opetushallitus/eperusteet-e2e-smoke-test) | [![Build Status](https://github.com/Opetushallitus/eperusteet-e2e-smoke-test/actions/workflows/playwright.yml/badge.svg)](https://github.com/Opetushallitus/eperusteet-e2e-smoke-test/actions)|

