# Code Review & Improvement Plan — branch `EP-4926`

Review date: 2026-06-29
Reviewer: Code review (code-quality + code-reviewer skills)
Last updated: 2026-06-29 — §B, §D, §E, §G, §H addressed; **Part 2 (application repo) added**

This plan now covers two code areas:

- **Part 1 — `eperusteet-frontend-utils` submodule** (the `EP-4926` branch): sections §A–§H below + the `EpKoodistoSelect` appendix.
- **Part 2 — `eperusteet-ui` application repo** (`src/`): see the dedicated part before the appendix.

## Progress summary

| Section | Status | Notes |
| ------- | ------ | ----- |
| §A New shared/core components | **Open** | Highest priority — not yet started |
| §B Styling & design-system | **Mostly done** | 14 template files + SCSS hex in touched files; B.2/B.3 remain |
| §C Type safety (`any`) | **Open** | — |
| §D Dependency hygiene | **Done** | 5 Vue 2 deps removed; lockfile updated |
| §E Legacy references | **Done** | 1 dangling import fixed; `b-table-stub.ts` deleted |
| §F State & data flow | **Open** | Includes appendix `EpKoodistoSelect` bugs |
| §G Cleanup | **Done** | Console logs removed; TODO tagged; typo fixed |
| §H Tests | **Done** | 9 new tests; suite green (120 pass, 0 fail) |

---

## Context & scope

`EP-4926` is a very large branch in the `eperusteet-frontend-utils` submodule:

- **66 commits**, **234 files**, **~+12 062 / −6 367 lines** vs `origin/master` (merge-base `1ac27a8`).
- It is not a single feature but a **multi-track platform migration**:
  - Vue 2 → Vue 3 (Options/decorators → `<script setup>` Composition API).
  - Bootstrap-Vue → **PrimeVue 4 + Tailwind v4** (new `EpTable`, `EpModal`, `EpTabs`, `EpDropdown`, `EpPopover`, `EpValidPopover`, custom directives, removal of `bootstrap.scss`).
  - Design-system overhaul (`_variables.scss` +232, `app.scss` rewrite, accessibility passes).
  - Tooling/deps (ESLint flat config, Vite 7, Pinia, dependency churn in `package.json`/`yarn.lock`).

A change this broad cannot be reviewed line-by-line in one pass. This document is a **prioritized, phased review plan**, with concrete seed findings already collected from sampling the highest-risk areas.

---

## Review strategy (phases)


| Phase | Theme                                             | Why first                                                | Rough effort | Status |
| ----- | ------------------------------------------------- | -------------------------------------------------------- | ------------ | ------ |
| 1     | New shared/core components (§A)                   | Reused everywhere — a bug here multiplies across the app | High         | Open |
| 2     | Styling & design-system migration (§B)            | Workspace color rule + visual regressions                | High         | **Mostly done** |
| 3     | Removed/legacy code & dependency hygiene (§D, §E) | Risk of dangling references / dead deps shipping         | Medium       | **Done** |
| 4     | Type safety (§C)                                  | Migration introduced wide `any` usage                    | Medium       | Open |
| 5     | State & data flow (§F)                            | Editing/versioning correctness                           | Medium       | Open |
| 6     | Cleanup + tests (§G, §H)                          | Debug logs, coverage gaps                                | Low/Medium   | **Done** |


Recommended mechanics: review per **component folder** (not per commit — commit messages are mostly "fixes"), run `yarn lint` + `yarn test` per area, and visually smoke-test each migrated screen.

---

## A. New shared/core components (highest priority)

These are new building blocks consumed by many components. Sampled `EpTable.vue` (395 lines) and `EpModal.vue` (179 lines) and found concrete issues:

### A.1 `EpTable.vue` — hardcoded colors violate the design-system rule  **[Improvement / rule violation]**

The scoped SCSS hardcodes hex/rgba values instead of `_variables.scss` tokens:

```297:352:eperusteet-frontend-utils/vue/src/components/EpTable/EpTable.vue
      color: #495057;
      ...
      border-top: 1px solid #dee2e6;
      border-bottom: 2px solid #dee2e6;
      ...
      background-color: rgba(0, 0, 0, 0.05);
      ...
          &.p-highlight {
            background: #007bff;
```

Per the workspace rule, colors must come from `_variables.scss`. Replace with design tokens (`$border-color`, `$link`, etc.). This is a **central** offender; see §B for the branch-wide pattern.

### A.2 `EpTable.vue` — invalid prop type `null`  **[Critical-ish]**

```95:99:eperusteet-frontend-utils/vue/src/components/EpTable/EpTable.vue
  items: {
    type: [Array, null],
    required: false,
  },
```

`null` is not a valid Vue prop *type constructor* (it expects `Array`, `Object`, etc.). This silently does nothing / can warn. Use `type: Array, default: undefined` and allow `null` via usage, or drop the type entry.

### A.3 `EpTable.vue` — split selection model + pervasive `any`  **[Improvement]**

Single-select is handled in `onRowClick` while multi-select is handled in `onSelectionChange` (lines 226–242). Two code paths for one concept make it easy to break one without the other. Every event handler is typed `(event: any)`. Define a row/selection type and unify the selection flow. Also confirm `selectedVariant` (prop, line 128) is actually used — it appears dead.

### A.4 `EpModal.vue` — redundant/competing size API  **[Improvement]**

```58:82:eperusteet-frontend-utils/vue/src/components/EpModal/EpModal.vue
    size?: 'sm' | 'md' | 'lg' | 'xl';
    ...
    small?: boolean;
    medium?: boolean;
    large?: boolean;
    xlarge?: boolean;
```

There are **two ways** to set size (`size="lg"` vs `large`). The booleans take precedence over `size` (lines 124–138) and only `small` has a declared default. This is confusing API surface; pick one mechanism (prefer `size`) and deprecate the booleans.

### A.5 Remaining new components to review with the same lens

`EpTabs.vue` (180), `EpDropdown*` (4 files), `EpPopover.vue` (147), `EpValidPopover.vue` (374 — note it also has 4 hardcoded-color hits), `EpBreadcrumb.vue` (104), `EpFileUpload.vue` (124), `EpInputGroup.vue` (97), `EpFormGroup.vue` (64), and the new directives `vSticky.ts` (132), `vBToggle.ts` (25). Checklist per component: prop typing (no `any`), `defineExpose` surface, event naming (`update:modelValue`), color tokens, accessibility (aria, focus, keyboard).

---

## B. Styling & design-system migration — **mostly done**

### B.1 Tailwind color-literal classes in templates — **done**

Replaced direct Tailwind color utilities with design-system classes in **14 components**:

`EpKoodistoSelect.vue`, `EpKoulutuksenJarjestajaSelect.vue`, `EpValidPopover.vue`, `forms/EpInput.vue`, `forms/EpSelect.vue`, `forms/EpMultiSelect.vue`, `forms/EpMultiListSelect.vue`, `forms/EpListSelect.vue`, `EpTreeNavibar.vue`, `EpAmmattitaitovaatimukset.vue`, `VaatimusField.vue`, `EpEditointi.vue`, `forms/EpErrorWrapper.vue`, `EpTiedosto/EpKuvaLataus.vue`.

| Tailwind (removed) | Design-system class | Token |
| ------------------ | ------------------- | ----- |
| `text-red-600` | `text-danger` | `$red` / `$alias-error` |
| `text-gray-500` / `!text-gray-600` | `text-muted` / `order-handle` | `$grey500` / `$grey300` |
| `text-blue-600` | `link-style clickable` | `$paletti-blue` |
| `text-green-600` | `text-success` (new in `app.scss`) | `$green` |
| `text-yellow-600` | `text-warning` | `$yellow` |

Scoped SCSS hex in the above files was also mapped to `_variables.scss` tokens where touched.

**Remaining caveat:** `EpValidPopover.vue` script/template props (`popupStyle`, `EpSpinner` `color`) still use literal hex (`#006699`, `#FFFFFF`) because SCSS variables are not available in `<script>` without a shared TS color constants module. Values align with `$cyan1` / `$white`.

### B.2 Hardcoded hex/rgba in SCSS — **partially done**

Done in the 14 files above plus `app.scss`. **Still open:**

- `EpTable.vue` — central offender (see §A.1).
- `EpEditointi/style.scss` — separate file with many hardcoded panel colors.
- Branch-wide audit of remaining migrated `*.vue` `<style>` blocks not yet swept.

Confirmed: nothing still imports the deleted `bootstrap.scss`.

### B.3 Visual regression risk — **open (manual)**

Bootstrap → Tailwind/PrimeVue swaps spacing, borders, and breakpoints. There are no visual tests; plan manual smoke tests of: tables, modals, tabs, dropdowns, forms, navbar/sidebar, and PDF/print views (`print:hidden` usage).

---

## C. Type safety (`any` proliferation)

`: any` / `as any` appears across **~47 `.vue` files**, concentrated in:
`EpTiedoteModal.vue` (15), `EpJulkaisuHistoria.vue` (5), `EpContent/LinkModal.vue` (5), `EpContent/ImageModal.vue` (5), `forms/EpMultiListSelect.vue` (5), `EpJulkaisuButton.vue` (4), `EpEditointi.vue` (4), `EpArvioinninKohdeAlueet.vue` (4), `EpPrefixList.vue` (4), `EpPdfKuvalataus.vue` (4), `forms/EpInput.vue` (4).

This matches the code-quality validation V-2 (`any` defeats type safety). Action: prioritize the high-count files; replace with generated API DTO types (`@/api/...`), `unknown` + narrowing, or generics. `EpTiedoteModal.vue` at 15 is the worst offender and a good first target.

---

## D. Dependency hygiene (`package.json`) — **done**

Removed from `eperusteet-frontend-utils/vue/package.json` (grep confirmed no runtime usage in submodule `src`):

| Package | Version removed | Reason |
| ------- | --------------- | ------ |
| `@vue/test-utils` | `1.3.6` (`dependencies`) | Duplicate; v2.4.6 kept in `devDependencies` |
| `vue-template-compiler` | `^2.7.16` | Vue 2 compiler |
| `vue-meta` | `^2.3.2` | Replaced by `@unhead/vue` |
| `vue-sticky-directive` | `^0.0.10` | Replaced by custom `vSticky.ts` |
| `vue-observe-visibility` | `1.0.0` | Unused |

`yarn install` succeeded; lockfile updated.

**Out of scope (parent app):** `eperusteet-ui/src/router/index.ts` still references `vue-meta` — migrate to `@unhead/vue` separately.

---

## E. Removed / legacy code — **done**

Grep across the full workspace (`eperusteet-ui` + submodule) confirmed deletions are clean except one fix applied:

| Removed item | Status |
| ------------ | ------ |
| `mixins/EpRoot.ts`, `EpRoute.ts`, `EpValidation.ts` | No references |
| `utils/decorators.ts` | No references |
| `utils/notifications.ts` | **Fixed:** unused `import { fail, success }` removed from `src/stores/ArviointiStore.ts` |
| `EpTutorial/EpTutorial.vue` | No references |
| `EpConfirmDialog` → `EpConfirmService` | Migration complete (`src/App.vue`) |
| `styles/bootstrap.scss`, `config/bootstrap.ts` | No active imports |

**Production `src`:** clean of `vue-property-decorator`/`@Component` and Bootstrap-Vue `b-*` components. `EpBPagination` / `<ep-b-pagination>` are the PrimeVue-based replacement, not Bootstrap-Vue.

**Test stubs:**
- `b-table-stub.ts` — **deleted** (orphaned, zero imports).
- `stubs.ts` — **kept** (used by ~45 specs; already PrimeVue-aware).

**Low priority (skipped tests):** stale Bootstrap-era selectors in `VaatimusField.spec.ts` (`.b-form-input`) and `EpAikatauluListaus.spec.ts` (`b-form-checkbox`) — update when re-enabling those tests.

---

## F. State management & data flow

`EditointiStore.ts` (+44) and `EpEditointi.vue` (+207) are core editing infrastructure and changed substantially (plus a new `epEditointiContext.ts` and `isEditing` semantics change). Review for: save/cancel correctness, `isEditing` propagation, version modal flow (`EpVersioModaali.vue`), and the `EpKoodistoSelect` integration bugs documented in the appendix. `stores/peruste.ts` and `TietoapalvelustaStore.ts` also changed — verify Pinia reactivity (no lost reactivity from destructuring).

---

## G. Cleanup — **done**

| Item | Resolution |
| ---- | ---------- |
| `console.*` in `EpEditointi.vue` (3) | Removed; user-facing `$fail` / error handling kept |
| `console.*` in `EpTiedostoLataus.vue` (1) | Removed; `handleFail()` kept |
| TODO in `plugins/aikaleima.ts` | Tagged `TODO(EP-4926)` — behavior change deferred |
| Stray `´` in `EpBPagination.vue` | Removed (see appendix) |

---

## H. Tests — **done**

### Trimmed specs — confirmed obsolete

Compared against `master`: only Vue 2 / BootstrapVue / unused i18n setup removed. Test cases intact in `EpButton.spec.ts`, `EpColorIndicator.spec.ts`, `EpHomeTile.spec.ts`, `EpExternalLink.spec.ts`, `EpPerustietoData.spec.ts`.

### New tests added

| File | Tests | Coverage |
| ---- | ----- | -------- |
| `EpTable.spec.ts` | 5 | Formatter, `#cell()` slot, single/multi selection, pagination |
| `EpModal.spec.ts` | 4 | `show()`/`hide()`, OK/cancel emits, dismiss → cancel |

**Still untested:** `EpTabs`, `EpDropdown`, `EpPopover` — add when those components are next reviewed (§A.5).

### Suite results (2026-06-29)

```
Test Files  54 passed | 10 skipped (64)
     Tests  120 passed | 41 skipped (163)
yarn lint   0 errors, 175 warnings (pre-existing)
```

---

## Suggested execution order

1. ~~**§D** dependency pruning + lockfile sanity~~ **done**
2. ~~**§B** color-rule cleanup (template files + SCSS hex)~~ **mostly done** — B.2 (`EpTable`, `EpEditointi/style.scss`) and B.3 (visual smoke) remain
3. ~~**§E** dangling-reference check across consumers~~ **done**
4. ~~**§G/§H** cleanup + core-component tests~~ **done**
5. **§A** new shared components (fix A.2 prop type, A.1/A.4 API+colors; sweep A.5) — **next**
6. **§C** `any` reduction, worst files first (`EpTiedoteModal`)
7. **§F** editing/state correctness + appendix `EpKoodistoSelect` bugs (Ap.1–Ap.4 critical)

---

# Part 2 — `eperusteet-ui` application repo (`src/`)

Review date: 2026-06-29. Scope: the application repo's own `src/` tree (not the submodule). Unlike the `EP-4926` branch, this is the committed state of `master` (latest commit `e308c53`), reviewed as a general code-quality pass.

## Good news (already clean)

Branch-wide greps over `src/` found **no** instances of:
- Vue 2 remnants — no `vue-property-decorator` / `vue-facing-decorator` / `@Component` / `@Prop` / `this.$emit` / `this.$refs`.
- Bootstrap-Vue — no `b-table` / `v-b-*` / `bootstrap-vue`.
- Tailwind color-literal classes in templates (the §B problem) — **0 matches**.
- `@ts-ignore` / `eslint-disable` in real source (only in a stale `.old` file, see P2.3).

So the application repo is **further along the migration** than the submodule and adheres to the color rule. `package.json` is also clean (no duplicate `@vue/test-utils`, no `vue-template-compiler`/`vue-meta`/`vue-sticky-directive`).

## P2.1 Debug `console.log` left in production code  **[Cleanup — V-1]**

Five production call sites (excluding the `.old` file):

```442:442:src/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue
  console.log('sortingChanged', newSort);
```
```1189:1190:src/views/RoutePerusteenTiedot.vue
const addKoulutuskoodi = (data: any, koodi: any) => {
  console.log('addKoulutuskoodi', data, koodi);
```
Also: `RoutePerusteenTiedot.vue:1165` (`console.log(err)`), `router/index.ts:659` (`console.log('Unknown route', to)`), `components/muodostuminen/EpRakenneModal.vue:585` (`console.log('tyyppi', newVal, oldVal)`). These look like leftover debugging (`'sortingChanged'`, `'tyyppi'`, `'addKoulutuskoodi'`). Remove or replace with a real logger.

## P2.2 Errors swallowed into `console.log`  **[Improvement — error handling]**

```1163:1166:src/views/RoutePerusteenTiedot.vue
  catch (err) {
    $fail($t('liitetiedoston-poisto-epaonnistui') as string);
    console.log(err);
  }
```
The user sees a toast but the error is only `console.log`-ed. Route caught errors through a shared logging/telemetry path (or at least `console.error`) so failures are diagnosable in production. Audit other `catch` blocks for the same pattern.

## P2.3 Stale committed file  **[Cleanup]**

`src/registerServiceWorker.ts.old` is a dead `.old` file checked into the repo (it also accounts for the only `eslint-disable` / extra `console.log` hits). Delete it — version history already preserves it.

## P2.4 Widespread `any`  **[Improvement — V-2]**

`: any` / `as any` is pervasive across `src/`, concentrated in:

| File | Hits |
|------|------|
| `components/tilastot/EpAmosaaTilastot.vue` | 24 |
| `utils/varmistusmetodit.ts` | 23 |
| `views/RoutePerusteenTiedot.vue` | 19 |
| `components/tilastot/EpYlopsTilastot.vue` | 18 |
| `views/RouteOsaamismerkit.vue` | 16 |
| `views/GeneerinenArviointi.vue` | 14 |
| `stores/TutkinnonOsaEditStore.ts` | 13 |
| `components/EpTutkinnonosaTuontiModal.vue` | 12 |
| `stores/MuodostuminenStore.ts` | 12 |

(plus many files at 3–9). This matches code-quality validation V-2. Prioritize the `utils/` and `stores/` files (shared logic, highest leverage) and the two `tilastot` chart components. Use the generated API DTO types and `unknown` + narrowing instead of `any`. Related smell: frequent non-null assertions like `store.value!.setData(...)` (e.g. `RoutePerusteenTiedot.vue:1171,1183`) — fragile; prefer explicit guards.

## P2.5 Oversized "god" files  **[Improvement — maintainability / SE-5]**

Files far above the ~400-line maintainability guideline:

| File | Lines |
|------|------:|
| `views/RoutePerusteenTiedot.vue` | 1175 |
| `views/RouteMuodostuminen.vue` | 1086 |
| `router/index.ts` | 767 |
| `views/RoutePerusteprojekti.vue` | 756 |
| `views/RoutePerusteprojektiLuonti.vue` | 692 |
| `components/EpSisallonLisays.vue` | 642 |
| `views/RouteOppaanTiedot.vue` | 616 |
| `views/RouteTutkinnonOsa.vue` | 610 |
| `components/muodostuminen/EpRakenneModal.vue` | 585 |

These route views mix data fetching, mapping, and large templates. Extract composables (`useXxx`) for data/save logic and split sub-sections into child components. `RoutePerusteenTiedot.vue` (1175 lines, 19 `any`, multiple `console.log`) is the worst offender and a good first refactor target. `router/index.ts` could be split per domain (perusopetus / lukio / aipe / tpo / opas) into route modules.

## P2.6 Untracked FIXME  **[Nitpick — V-4]**

```9:9:src/stores/kayttaja.ts
// FIXME: tyypitä backendiin
```
Add an issue reference (e.g. `// FIXME(EP-xxxx): ...`) or resolve. (This is the only stray TODO/FIXME in `src/`, which is otherwise clean.)

## Part 2 — suggested order

1. **P2.1 + P2.3** — trivial cleanup (remove debug logs, delete `.old` file). Low effort, immediate.
2. **P2.2** — error-handling sweep on `catch` blocks.
3. **P2.4** — `any` reduction starting with `utils/varmistusmetodit.ts` and the `stores/`.
4. **P2.5** — incremental refactor of the god-views, beginning with `RoutePerusteenTiedot.vue`.
5. **P2.6** — tag the FIXME.

---

# Appendix — validated detailed findings: `EpKoodistoSelect`

These were verified line-by-line in the first review pass and remain actionable.

## EpKoodistoSelect.vue

### Critical

**Ap.1 `vanhentuneet` (show expired) toggle ignored during pagination** — the `sivu` setter omits `onlyValidKoodis` (defaults to `true`) and bypasses `fetchKoodisto`:

```283:285:eperusteet-frontend-utils/vue/src/components/EpKoodistoSelect/EpKoodistoSelect.vue
  set: (value: number) => {
    koodistoStore.value?.query(query.value, _.max([value - 1, 0]));
  },
```

**Ap.2 `vanhentuneet` toggle does nothing for the `koodisto`-prop path** — inline store drops the 4th valid-only arg:

```235:237:eperusteet-frontend-utils/vue/src/components/EpKoodistoSelect/EpKoodistoSelect.vue
      async query(query: string, sivu = 0, koodisto: string) {
        return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
      },
```

**Ap.3 Double fetch / race on search** — watcher sets `sivu.value = 1` (triggers an un-debounced query) *and* calls the debounced `initStoreQuery`:

```328:333:eperusteet-frontend-utils/vue/src/components/EpKoodistoSelect/EpKoodistoSelect.vue
watch(() => query.value, (newValue) => {
  if (newValue.length > 2 || newValue.length === 0) {
    sivu.value = 1;
    initStoreQuery(newValue, sivu.value - 1, vanhentuneet.value);
  }
});
```

**Ap.4 Checkbox icons keyed off `multiple` prop instead of `multiselect` computed** (line 85) — array-bound multiselect shows no checkboxes.

### Improvement

- **Ap.5** Dead `isLoading` ref (set in `fetchKoodisto`, never read; spinner uses `v-if="items"`).
- ~~**Ap.6** `text-blue-600` color literal (line 97) — use `$link` / design token.~~ **done** (§B.1)
- **Ap.7** Pervasive `any` (`innerModel`, `onRowSelected`, `as any`).
- **Ap.8** `initStore` is `async` but never awaited; `koodisto` silently overrides `store` when both are passed.

### Nitpick

- Magic inline `style="min-height: 860px;"` on `EpModal` (line 30) → scoped class.
- Magic number `newValue.length > 2` (line 329) → named constant.
- `aria-controls="koodistot"` (line 126) references a non-existent id.
- `KoodistoSelectStore.query` calls `clear()` first → table→spinner flicker on every page change.

## KoodistoSelectStore.ts

- **B.1** Unused imports `ref` (line 3) and `debounced` (line 5).
- **B.2** `public readonly data` computed (line 44) is redundant — consumers read `state.data` directly.
- **B.3** `as any` (line 57) and `params: any` (line 25) discard the `Page<KoodistoKoodiDto>` typing that would have caught Ap.2 at compile time.

## EpBPagination.vue

- ~~**Critical:** stray `´` character after `</template>` renders as literal text~~ **done** (§G)
- Nitpick: `total` prop really means total record count (`totalRecords`) — consider renaming.

## EpButton.vue

- Unknown `variant` values silently fall back to `primary` (lines 93–105) — add a prop validator for the supported set.
- `inherit` computed passes `''` (not `undefined`) to `:background`/`:color` — verify `EpMaterialIcon` treats `''` as "no override".
- `resolvedVariant` duplicates the link logic already in `isLink`.
- Per-size border radii differ (`rounded-2xl`/`rounded-full`/`rounded-3xl`, lines 118–121) — confirm intentional.

