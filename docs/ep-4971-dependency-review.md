# EP-4971 dependency review

The highest-priority browser checks are saving and reopening existing rich text and tables, authenticated saves, and uploads. The dependency update initially removed transitive Node types from four projects. The follow-up commits declare Node 24 types explicitly in all five projects.

## Branches compared

The comparison uses local `master` and the reviewed `EP-4971-dependency-update` commits. It covers each frontend project's `package.json`, `yarn.lock`, and Yarn configuration, including the frontend-utils commit pinned by each app.

| Repository | `master` | Reviewed update commit | frontend-utils pin on `master` |
| --- | --- | --- | --- |
| eperusteet-frontend-utils | `3ad3434` | `4869ab9` | Library itself |
| eperusteet-ui | `24769c5` | `6f3957f` | `3ad3434` |
| eperusteet-amosaa-ui | `56abfa2` | `f2aaae5` | `f4a7b7b` |
| eperusteet-ylops-ui | `813cdf3` | `48b0889` | `295f67e` |
| eperusteet-opintopolku | `8d219e42` | `19a94220` | `57f8116` |

All four app update commits pin frontend-utils at `4869ab9`, the Node type fix on top of `eeca4d4`. The standalone checkout’s branch ref still pointed at `eeca4d4` when reviewed. The comparison uses the fix from the pinned submodule. AMOSAA and YLOPS also pick up intervening changes to shared editing components. AMOSAA, YLOPS and Opintopolku pick up a shared dropdown change. YLOPS also picks up Finnish translation changes. Compare these shared source changes before attributing a behavioral difference to a dependency. The local frontend-utils `origin/master` snapshot, `cab59d6`, adds a separate `EpContent.vue` change (EP-5184). That commit falls outside the local `master` comparison and the update branch.

## Installed versions

These are Yarn lockfile versions. Where the manifest range differs materially from the installed version, the difference is noted below.

| Dependency | `master` | Update branch | Scope |
| --- | --- | --- | --- |
| Vue | Direct `3.5.41`, with `3.5.42` also in the lockfiles | `3.5.46` throughout | All five |
| `@vue/compiler-dom`, `@vue/compiler-sfc` | `3.5.22`, `3.5.41`, `3.5.42` | `3.5.46` throughout | All five |
| Tiptap core, Vue integration, StarterKit, tables and `@tiptap/pm` | `3.31.3` in frontend-utils, UI and YLOPS, `3.30.5` in AMOSAA, `3.30.6` in Opintopolku | `3.35.0` | All five |
| ProseMirror view, model, input rules and history | `1.42.3`, `1.25.11`, `1.5.1`, `1.5.0`, respectively | `1.44.0`, `1.25.13`, `1.7.0`, `1.5.2` | All five |
| Axios, `qs` | `1.20.0`, `6.16.0` | `1.21.1`, `6.17.1` | All five |
| Vue I18n, Vue Router, `@unhead/vue` | `11.4.10`, `4.6.4`, `2.1.17` | `11.4.24`, `4.6.5`, `2.1.19` | All five |
| Moment, `tslib`, UUID | `2.30.1`, `2.8.1`, `14.0.2` | `2.31.0`, `2.9.1`, `14.0.3` | All five |
| Vite, Vue Vite plugin, Rollup | `7.3.6`, `6.0.8`, `4.63.1` | `7.3.8`, `6.0.11`, `4.68.8` | All five |
| Sass | `1.103.1` in AMOSAA and Opintopolku, `1.104.0` elsewhere | `1.108.2` | All five |
| PostCSS, Autoprefixer | PostCSS `8.5.26` in AMOSAA and Opintopolku, `8.5.28` elsewhere. Autoprefixer `10.5.4`. | `8.5.33`, `10.7.0` | All five |
| Tailwind Vite plugin, Tailwind, Lightning CSS | `4.3.3`, `4.3.3`, `1.32.0` | `4.3.5`, `4.3.5`, `1.33.0` | Four apps. The standalone library drops these packages. |
| Vue Test Utils | `2.4.6` | `2.6.0` | All five |
| ESLint, Vue ESLint plugin, Vue ESLint parser | `9.37.0` at the root, `10.10.0`, `10.4.1` | `9.39.5`, `10.12.1`, `10.4.2` | All five |
| `typescript-eslint`, `@types/lodash` | `8.68.0` in AMOSAA and `8.69.0` elsewhere, `4.14.202` | `8.74.0`, `4.17.27` | All five |
| `vue-tsc` | `3.3.11` | `3.3.14` | UI, AMOSAA and YLOPS |
| `@types/node` | Transitive `14.18.63` via ExcelJS | Direct dev dependency `^24` resolves to `24.19.4`. UI also retains transitive `14.18.63`. | All five |
| `vue3-apexcharts` | `1.11.1` | `1.11.3` | UI and AMOSAA |
| `mime` | `4.1.0` | `4.1.2` | Opintopolku retains it. The other four manifests drop it. |

The Tiptap manifests move from `^3.20.4` in AMOSAA and YLOPS and `^3.30.4` in the other three repositories to `^3.35.0`. The lockfiles show the smaller installed jumps above. PrimeVue and its icons are already at `4.5.5` on both sides. The new Yarn package extensions supply a `vue: ^3.5.0` peer for each. PrimeVue themes, Floating UI DOM (`1.8.0`), both Fontsource fonts (`5.3.0`), Material Icons (`1.13.14`), Lodash (`4.18.1`), Pinia (`2.3.1`), Vue Multiselect (`3.5.0`), Vue Scrollto (`2.20.0`), Vue Draggable Plus (`0.6.1`), and Vue notifications (`3.4.2`) retain their installed versions. Vitest and its UI stay at `3.2.7`, jsdom at `26.1.0`, and TypeScript at `5.9.3`.

The regenerated lockfiles change many transitive packages. Counting unique npm package names and comparing each package's set of locked versions gives the following totals. Changes limited to peer bindings, selectors or checksums are outside these counts.

| Repository | Added | Removed | Version set changed |
| --- | ---: | ---: | ---: |
| eperusteet-frontend-utils | 3 | 234 | 160 |
| eperusteet-ui | 77 | 108 | 204 |
| eperusteet-amosaa-ui | 8 | 179 | 202 |
| eperusteet-ylops-ui | 8 | 179 | 200 |
| eperusteet-opintopolku | 3 | 176 | 197 |

`source-map-js` resolves to `1.2.4` from `1.2.1` in all five lockfiles. All app roots force `qs@6.17.1`, including the copy used by the `url` package. UI also forces `uuid@14.0.3` for ExcelJS and `brace-expansion@2.1.8` for its Minimatch 5 dependency chain. UI already forced UUID 14 on `master`, so the branch changes that override by one patch. The shared project drops its overrides and locks `qs@6.17.1` and `uuid@14.0.3` independently.

## Where regressions could appear

### Rich-text editing and stored HTML — high priority

In frontend-utils, `vue/src/components/EpContent/EpContent.vue` loads stored HTML through `setContent()`, compares it to `getHTML()`, and emits editor HTML for saving. Tiptap 3.32 changes nested-list conversion and refreshes ProseMirror. The later releases adjust input-rule behavior and Backspace handling around formatted content. The local editor also registers custom image, link and comment handling and the Office paste extension. A change in parsing, selection or serialization can mark existing content as invalid or silently normalize it on save. The removed table-cell, table-header and table-row packages are standalone declarations. `TableKit` still supplies those node types through `@tiptap/extension-table`. The Office paste package stays at `0.1.2` and now runs against the updated editor. [Tiptap 3.32.0](https://github.com/ueberdosis/tiptap/releases/tag/v3.32.0) · [Tiptap 3.34.0](https://github.com/ueberdosis/tiptap/releases/tag/v3.34.0) · [Tiptap 3.35.0](https://github.com/ueberdosis/tiptap/releases/tag/v3.35.0)

Start with UI's `src/components/EpSisaltoTekstikappaleet.vue`, AMOSAA's `src/components/EpAmmatillinen/EpPaikallinenToteutus.vue` and a YLOPS curriculum text section. Open existing content containing nested lists, a merged-cell table, an internal link and an image. Paste from Word, edit, undo, save and reopen. Check for an invalid-HTML warning and verify that links, images, table structure and text survive. In Opintopolku, verify the published result in `EpContentViewer`, which renders saved HTML and handles links, terms and tables without using the editor.

### Authenticated requests and search filters — high priority

`vue/src/api/common.ts` sets `Caller-Id` and uses `CSRF` for both the Axios cookie and header. Its CAS redirect handling reads the XHR response URL. Axios 1.21 switches to an asynchronous Cookie Store lookup where supported, with a fallback to the previous cookie access mechanism. It also changes adapter behavior around parameter merging and multipart serialization. The change in how Axios recognizes header defaults is unlikely to affect the app's string-valued default headers. Check the actual request when saving, uploading an image via `ImageModal.vue` or uploading an attachment via UI's `RoutePerusteenTiedot.vue`. Verify that an expired session redirects as expected and that authorization or validation errors still display correctly. Opintopolku's public searches primarily exercise the read side of the client. [Axios 1.21.0](https://github.com/axios/axios/releases/tag/v1.21.0) · [Axios 1.21.1](https://github.com/axios/axios/releases/tag/v1.21.1)

The shared `eperusteet.ts`, `amosaa.ts` and `ylops.ts` API clients call `qs.stringify` with `arrayFormat: 'repeat'`. The `qs` update includes parser changes and an encoder change for malformed Unicode. Ordinary repeated filters should retain their shape. Compare requests and results for two selected filters, an empty selection and Finnish or Swedish text with spaces and accented characters. [qs 6.17.1 changelog](https://github.com/ljharb/qs/blob/v6.17.1/CHANGELOG.md#6171)

### Node type declarations after ExcelJS removal

On `master`, ExcelJS's `@fast-csv/format` and `@fast-csv/parse` dependencies supply `@types/node@14.18.63` in all five projects. The initial update removed that dependency path in frontend-utils, AMOSAA, YLOPS and Opintopolku. Type checks reproduced missing `node:http` and `setImmediate` declarations in Vite and Vitest in those four projects. Opintopolku also reported missing `Buffer` in Sass declarations. The frontend builds and Vitest suites still passed.

The follow-up adds `@types/node@^24` to `devDependencies` in `eperusteet-frontend-utils/vue` and each of the four application roots. Each root resolves `24.19.4`, with `undici-types@7.24.6`. The direct dependency matches the Node 24 runtime and makes the types available in each project's own install. UI retains the older transitive version through ExcelJS.

### Forms, navigation and styling — medium priority

- **Reactive forms and overlays.** Vue and its compiler now use one version in each lockfile. UI removes its explicit compiler-SFC declaration while `@vue/compiler-sfc@3.5.46` remains available through Vue. Vue and the Vue Vite plugin can change compiled templates and update timing across the shared components. PrimeVue's code stays at the same version while its peer binding and Vue runtime change. Exercise `EpSelect`, `EpDatepicker`, `EpModal`, `EpDropdown` and `EpTable` for dependent selections, keyboard focus, closing nested dialogs and preserving values on save. Account for the shared dropdown source change when diagnosing alignment.
- **Routing, labels and dates.** Vue Router 4.6.5 changes matching around hyphens in path tokens and parameter separators. Check shared or bookmarked links, especially hyphenated paths and links with route parameters, and browser back/forward. Vue I18n 11.4.24 changes missing nested-key handling. The shared language store and timestamp plugin also use Moment. Switch Finnish and Swedish and verify translated validation messages, date inputs and the change of day around midnight in `Europe/Helsinki`. Verify titles in routes that call Unhead's `useHead`. [Vue Router 4.6.5](https://github.com/vuejs/router/releases/tag/v4.6.5) · [Vue I18n 11.4.24](https://github.com/intlify/vue-i18n/releases/tag/v11.4.24) · [Unhead 2.1.19](https://github.com/unjs/unhead/releases/tag/v2.1.19)
- **Production CSS and build environment.** Vite, Rollup, Sass, Tailwind, Lightning CSS and PostCSS can change generated CSS, asset URLs and module resolution. Check the built app's fonts, icons, print layout, dialogs and responsive styles under the deployed base URL. The app Vite configs still import Tailwind and the CommonJS plugin from their roots. The update moves them and other build tooling to `devDependencies`, so any pipeline installing production dependencies before bundling would lose them. The checked-in build workflows install the full dependency set. The root install supplies the application build even though frontend-utils is compiled from source. An extra `vue/node_modules` in the submodule can mask missing declarations or resolve a different copy of a library. [Tailwind CSS 4.3.5](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.5)
- **Tests and type checking.** Vue Test Utils 2.6.0 makes the wrapper's props shallow reactive. Tests that mutate a nested plain prop in place can stop triggering updates. Pass a reactive input when the scenario requires it or replace the prop using `setProps()`. UI now resolves its Vitest setup file relative to the config. The `vue-tsc` and Lodash types updates can change diagnostics even with the same TypeScript version. [Vue Test Utils 2.6.0](https://github.com/vuejs/test-utils/releases/tag/v2.6.0)

### Application-specific changes

| Application | Finding and check |
| --- | --- |
| eperusteet-ui | `src/components/tilastot/tilastot.ts` still imports ExcelJS `4.4.0`. Export a real statistics workbook and open it to exercise the retained UUID and brace-expansion overrides. ApexCharts stays at `5.16.0`; its Vue wrapper changes. Verify rendering and filtering on the statistics charts, including `EpLukumaaraGraafit.vue`. `vue-tsc` and the transitive compiler resolution also change. |
| eperusteet-amosaa-ui | `src/main.ts` registers the updated ApexCharts wrapper. Check startup and editing of local implementation plans. The app drops ExcelJS and the old Vue 2 `vue-meta` and `vue-observe-visibility` packages. The source scan found no imports or directive uses of those three packages. |
| eperusteet-ylops-ui | `src/main.ts` retains `vue3-text-clamp@0.1.2`. Check clamped text and resizing with the newer Vue runtime. The manifest drops charts, ExcelJS, `vue-meta` and `vue-observe-visibility`. Check navigation and editing with the newer frontend-utils pin. |
| eperusteet-opintopolku | `OpetussuunnitelmaDataStore.ts` and `ToteutussuunnitelmaDataStore.ts` use `mime.getExtension()` to construct attachment and image filenames. Load an existing published curriculum with both common images and document attachments and check for wrong extensions or 404s. Matomo `4.2.0`, `vue-meta@2.4.0` and `register-service-worker@1.7.2` remain declared at their previous resolved versions. The app registers Matomo in `src/main.ts` and uses Unhead for current route titles. |

All five manifests drop the old Vue ESLint presets, `core-js`, `file-saver`, `husky`, `js-cookie`, `vue-axe`, `vue-upload-component`, the three standalone Tiptap table-node packages and `@tiptap/extension-text-style`. The source and config scan found no tracked application imports requiring those removals. The Husky configs already had disabled filenames. The three editor apps remove the disabled service-worker files and drop the package. Packages used by individual consumers remain declared at those app roots.

## Verification performed

The checks used temporary copies of committed files and their pinned submodules, Node `24.19.0`, and Yarn `4.13.0`. I used the same locally generated OpenAPI clients on both sides to hold the API inputs constant. Offline `yarn install --immutable --immutable-cache` succeeded using cached packages with install scripts disabled. Each app had one root installation. The build and test results below are for `master` and the initial update commits, before the Node type follow-up.

| Repository | Tests passed on each branch | Build verification |
| --- | --- | --- |
| eperusteet-frontend-utils | 120 passed, 41 skipped | Standalone library tests |
| eperusteet-ui | 27 passed, 4 skipped | Vite build passed |
| eperusteet-amosaa-ui | 3 passed | Vite build passed |
| eperusteet-ylops-ui | 34 passed, 2 skipped | Vite build passed |
| eperusteet-opintopolku | 49 passed | Vite build passed |

All four application lint commands passed on both branches. The API type-check wrapper could not spawn Node in the sandbox, so I invoked its underlying `vue-tsc` command directly in UI, AMOSAA and YLOPS. Both branches already report general diagnostics, including a missing generated `TiedoteKevytDto` export. None of those runs reported a missing API method matching the wrapper's filter. I also ran `tsc --noEmit` in frontend-utils and Opintopolku to check the Node declarations on both branches.

I repeated those type checks after a fresh offline install of all five follow-up commits. The missing Node declaration errors disappeared in all four affected projects. Each project still reports other TypeScript diagnostics.

Browser workflows, live API calls, regenerated OpenAPI clients and Trivy results remain unverified.
