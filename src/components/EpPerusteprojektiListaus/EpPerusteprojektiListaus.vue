<template>
  <div>
    <div v-if="showCards">
      <div class="upper">
        <slot name="upperheader">
          <h1 class="bg-danger">
            slot: upperheader
          </h1>
        </slot>

        <EpSpinner v-if="!ownProjects" />
        <div
          v-else
          class="mt-5"
        >
          <slot name="unpublished-header" />
          <div class="d-flex flex-wrap pt-4">
            <div
              v-oikeustarkastelu="luontioikeus"
              class="card-wrapper"
            >
              <ProjektiCard
                :full-background="true"
                :link="newRoute"
              >
                <div class="d-flex align-items-center flex-column h-100">
                  <div class="h-50 text-center d-flex align-items-center pt-5">
                    <div class="ikoni">
                      <EpMaterialIcon size="50px">
                        add
                      </EpMaterialIcon>
                    </div>
                  </div>
                  <div class="h-50 text-center d-flex align-items-center pb-5">
                    <div class="teksti">
                      {{ $t('luo-uusi') }}
                    </div>
                  </div>
                </div>
              </ProjektiCard>
            </div>
            <EpSpinner
              v-if="!ownProjects"
              class="m-5"
            />
            <template v-else>
              <div
                v-for="project in ownProjects"
                :key="project.id"
                class="card-wrapper"
              >
                <ProjektiCard
                  :link="{ name: editRoute, params: { projektiId: project.id } }"
                  :koulutustyyppi="project.peruste.koulutustyyppi"
                  :ei-tuetut-koulutustyypit="eiTuetutKoulutustyypit"
                  :tile-image="project.tileImage"
                >
                  <template #lower>
                    <div class="small-text">
                      {{ $t('tila-' + project.tila) }}
                    </div>
                  </template>
                  <div class="h-100 w-100 d-flex align-items-center justify-content-center text-center p-4">
                    {{ project.nimi }}
                  </div>
                </ProjektiCard>
              </div>
            </template>
          </div>
        </div>

        <template v-if="ownProjects && naytaVainKortit && ownProjects.length === 0 && ownPublishedProjects && ownPublishedProjects.length === 0">
          <slot name="cardsEmpty">
            <h3>{{ $t('ei-perusteprojekteja') }}</h3>
          </slot>
        </template>

        <div
          v-if="ownPublishedProjects && naytaVainKortit && ownPublishedProjects.length > 0"
          class="mt-4"
        >
          <slot name="published-header">
            <h2>{{ $t('julkaistut-perusteet') }}</h2>
          </slot>
          <div class="d-flex flex-wrap pt-4">
            <div
              v-for="project in ownPublishedProjects"
              :key="project.id"
              class="card-wrapper"
            >
              <ProjektiCard
                :link="{ name: editRoute, params: { projektiId: project.id } }"
                :koulutustyyppi="project.peruste.koulutustyyppi"
                :ei-tuetut-koulutustyypit="eiTuetutKoulutustyypit"
                :tile-image="project.tileImage"
              >
                <template #lower>
                  <div class="small-text">
                    {{ $t('tila-' + project.tila) }}
                  </div>
                </template>
                <div class="h-100 w-100 d-flex align-items-center justify-content-center text-center p-4">
                  {{ project.nimi }}
                </div>
              </ProjektiCard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!naytaVainKortit"
      v-oikeustarkastelu="{oikeus:'hallinta'}"
    >
      <div
        class="lower"
        :class="{'mt-0': !showCards}"
      >
        <div class="d-flex">
          <slot name="lowerheader">
            <h1 class="bg-danger">
              slot: lowerheader
            </h1>
          </slot>
          <EpSpinner v-if="isLoading" />
        </div>
      </div>

      <div
        v-if="items"
        class="filters"
      >
        <div class="d-flex align-items-end">
          <div class="flex-fill mr-3">
            <label>&nbsp;</label>
            <EpSearch
              v-model="query.nimi"
              :placeholder="$t('etsi-perusteprojektia')"
            />
          </div>
          <div
            v-if="filtersInclude('koulutustyyppi')"
            class="flex-fill mr-3"
          >
            <label>{{ $t('koulutustyyppi') }}</label>
            <koulutustyyppi-select
              v-model="koulutustyyppi"
              :koulutustyypit="koulutustyyppiOptions as unknown[]"
              :is-editing="true"
            />
          </div>
          <div
            v-if="filtersInclude('peruste')"
            class="flex-fill mr-3"
          >
            <label>{{ $t('peruste') }}</label>
            <EpMultiSelect
              v-model="peruste"
              name="peruste"
              :allow-empty="true"
              placeholder="kaikki"
              :options="perusteet"
            >
              <template #singleLabel="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>
          <div
            v-if="filtersInclude('voimassaolo')"
            class="flex-fill"
          >
            <label>{{ $t('voimassaolo') }}</label>
            <EpMultiSelect
              v-model="voimassaolo"
              :allow-empty="true"
              placeholder="kaikki"
              :options="vaihtoehdotVoimassaolo"
            >
              <template #singleLabel="{ option }">
                {{ $t('ajoitus-' + option.toLowerCase()) }}
              </template>
              <template #option="{ option }">
                {{ $t('ajoitus-' + option.toLowerCase()) }}
              </template>
            </EpMultiSelect>
          </div>
        </div>

        <div class="d-flex my-3 justify-content-between">
          <div
            v-if="filtersInclude('tila')"
          >
            <EpToggleGroup
              v-model="tila"
              :items="vaihtoehdotTilat"
            >
              <template #default="{ item }">
                {{ $t('tila-' + (item as string).toLowerCase()) }}
              </template>
            </EpToggleGroup>
          </div>

          <div
            v-if="filtersInclude('amosaayhteinen')"
          >
            <EpToggle
              v-model="amosaaYhteinen"
              :label="$t('perustetyyppi-amosaa_yhteinen')"
            />
          </div>
        </div>

        <div v-if="items.data.length > 0">
          <b-table
            striped
            hover
            responsive
            :items="items.data"
            :fields="fields"
            no-local-sorting
            :sort-by="sort.sortBy"
            :sort-desc="sort.sortDesc"
            @sort-changed="sortingChanged"
          >
            <template
              v-if="hasNimiSlot"
              #head(nimi)
            >
              <slot name="nimiotsikko" />
            </template>
            <template #cell(nimi)="data">
              <router-link :to="{ name: editRoute, params: { projektiId: data.item.id } }">
                {{ data.value }}
              </router-link>
            </template>
            <template #cell(koulutustyyppi)="data">
              <slot
                name="koulutustyyppisarake"
                :peruste-projekti="data.item"
              >
                <span class="text-nowrap">
                  <EpColorIndicator
                    v-if="data.item.koulutustyyppi"
                    :size="10"
                    :kind="data.item.koulutustyyppi"
                  />
                  <span class="ml-1">
                    {{ $t(data.item.koulutustyyppi) }}
                  </span>
                </span>
              </slot>
            </template>
            <template #cell(tila)="data">
              <div class="d-flex">
                {{ $t(data.item.tila) }}
                <ep-button
                  v-if="data.item.tila === 'poistettu' && stateChangeAllowed(data.item.oikeudet.perusteprojekti)"
                  variant="link py-0"
                  icon="keyboard_return"
                  @click="restore(data.item)"
                >
                  {{ $t('palauta') }}
                </ep-button>
              </div>
            </template>
          </b-table>
          <ep-pagination
            v-model="sivu"
            :per-page="perPage"
            :total-rows="total"
          />
        </div>
        <div
          v-else
          class="m-2 alert alert-info"
        >
          {{ $t('ei-hakutuloksia') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteQuery, PerusteprojektiKevytDto, Perusteet, PerusteKevytDto, PerusteprojektiQuery } from '@shared/api/eperusteet';
import { EperusteetKoulutustyypit } from '@shared/utils/perusteet';
import { BvTableFieldArray } from 'bootstrap-vue';
import { IProjektiProvider } from './types';
import ProjektiCard from './ProjektiCard.vue';
import * as _ from 'lodash';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { vaihdaPerusteTilaConfirm } from '@/utils/varmistusmetodit';
import { perusteTile } from '@shared/utils/bannerIcons';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $sd, $kaanna, $hasOphCrud, $fail } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import { hasSlotContent } from '@shared/utils/vue-utils';
import { useSlots } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { reactive } from 'vue';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo' | 'amosaayhteinen';

const props = defineProps({
  provider: { type: Object as () => IProjektiProvider, required: true },
  newRoute: { type: Object as () => any, required: true },
  editRoute: { type: String, required: true },
  showCards: { type: Boolean, default: true },
  isPohja: { type: Boolean, default: false },
  vainKortit: { type: Boolean, default: false },
  fieldKeys: { type: Array as () => string[], default: () => [] },
  filters: { type: Array as () => ProjektiFilter[], default: () => ['koulutustyyppi', 'tila', 'voimassaolo'] },
  luontioikeus: { type: Object as () => any, default: () => ({ 'oikeus': 'hallinta', 'kohde': 'peruste' }) },
  eiTuetutKoulutustyypit: { type: Array as () => string[], default: () => [] },
});

const koulutustyyppi = ref<string | null>(null);
const peruste = ref<PerusteKevytDto | null>(null);
const tila = ref<string[]>(props.isPohja ? ['LAADINTA', 'VALMIS'] : ['LAADINTA', 'JULKAISTU']);
const voimassaolo = ref<string | null>(null);
const amosaaYhteinen = ref<boolean>(false);
const isLoading = ref(false);
const sort = ref<{ sortBy?: string; sortDesc?: boolean }>({});
const perusteet = ref<PerusteKevytDto[]>([]);
const slots = useSlots();
const route = useRoute();
const router = useRouter();

const query = reactive<PerusteprojektiQuery>({
  sivu: 0,
  sivukoko: 10,
  koulutustyyppi: undefined,
  voimassaolo: false,
  siirtyma: false,
  tuleva: false,
  poistunut: false,
  tila: props.isPohja ? ['LAADINTA', 'VALMIS'] : ['LAADINTA', 'JULKAISTU'],
  nimi: '',
  jarjestysOrder: false,
  jarjestysTapa: 'nimi',
  perusteet: [],
  tyyppi: ['NORMAALI'],
});

onMounted(async () => {
  props.provider.updateOwnProjects();
  await onQueryChange(query);

  if (filtersInclude('peruste')) {
    perusteet.value = (await Perusteet.getAllOppaidenPerusteet()).data;
  }
});

watch(query, async (newQuery: PerusteQuery) => {
  await onQueryChange(newQuery);
});

watch(
  () => props.provider.projects.value,
  () => {
    isLoading.value = false;
  },
);

const onQueryChange = async (newQuery: PerusteQuery) => {
  isLoading.value = true;

  try {
    if (!naytaVainKortit.value) {
      await props.provider.updateQuery({
        ...newQuery,
      });
    }
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
};

watch(() => tila.value, (newTila: string[]) => {
  query.tila = newTila.length > 0
    ? newTila
    : (props.isPohja ? ['LAADINTA', 'VALMIS', 'POISTETTU'] : ['LAADINTA', 'JULKAISTU', 'POISTETTU']);
});

watch(() => voimassaolo.value, (newTila: string | null) => {
  const defaults = {
    voimassaolo: false,
    siirtyma: false,
    tuleva: false,
    poistunut: false,
  };

  switch (newTila) {
  case 'tuleva':
    Object.assign(query, defaults, { tuleva: true });
    break;
  case 'voimassaolo':
    Object.assign(query, defaults, { voimassaolo: true });
    break;
  case 'siirtyma':
    Object.assign(query, defaults, { siirtyma: true });
    break;
  case 'poistunut':
    Object.assign(query, defaults, { poistunut: true });
    break;
  default:
    Object.assign(query, defaults);
    break;
  }
});

watch(() => koulutustyyppi.value, (newKt: string | null) => {
  query.koulutustyyppi = newKt ? [newKt] : undefined;
});

watch(() => amosaaYhteinen.value, () => {
  if (amosaaYhteinen.value) {
    query.tyyppi = ['AMOSAA_YHTEINEN'];
  }
  else {
    query.tyyppi = ['NORMAALI'];
  }
});

watch(() => peruste.value, (newPeruste: PerusteKevytDto | null) => {
  query.perusteet = newPeruste?.id ? [newPeruste.id] : [];
});

const sortingChanged = (newSort) => {
  sort.value = newSort;
  Object.assign(query, {
    sivu: 0,
    jarjestysOrder: newSort.sortDesc,
    jarjestysTapa: newSort.sortBy,
  });
};

const stateChangeAllowed = (rights: string[]): boolean => {
  return _.includes(rights, 'tilanvaihto');
};

const koulutustyyppiOptions = computed(() => {
  if (_.upperCase(props.editRoute) === 'OPAS') {
    return [...EperusteetKoulutustyypit, 'koulutustyyppi_muu'];
  }
  return EperusteetKoulutustyypit;
});

const vaihtoehdotTilat = computed(() => {
  return props.isPohja ? ['LAADINTA', 'VALMIS', 'POISTETTU'] : ['LAADINTA', 'VALMIS', 'JULKAISTU', 'POISTETTU'];
});

const vaihtoehdotVoimassaolo = computed(() => {
  return [
    'kaikki',
    'tuleva',
    'voimassaolo',
    'siirtyma',
    'poistunut',
  ];
});

const sivu = computed({
  get() {
    return (items.value?.sivu ?? 0) + 1;
  },
  set(value: number) {
    query.sivu = value - 1;
  },
});

const perPage = computed(() => {
  return items.value?.sivukoko || 10;
});

const total = computed(() => {
  return items.value?.kokonaismäärä || 0;
});

const ownProjects = computed(() => {
  if (props.provider.ownProjects.value) {
    return _.map(_.filter(props.provider.ownProjects.value, project => project.tila === 'laadinta'), projekti => setTileImage(projekti));
  }
  return undefined;
});

const ownPublishedProjects = computed(() => {
  if (props.provider.ownProjects.value) {
    return _.map(_.filter(props.provider.ownProjects.value, project => project.tila === 'julkaistu'), projekti => setTileImage(projekti));
  }
  return [];
});

const setTileImage = (projekti) => {
  return {
    ...projekti,
    tileImage: perusteTile(projekti.peruste),
  };
};

const items = computed(() => {
  return props.provider.projects.value;
});

const initialFields = computed((): BvTableFieldArray => {
  const dateFormatter = (value: Date | null | undefined) => {
    return value
      ? $sd(value)
      : '-';
  };

  return [{
    key: 'nimi',
    label: $t('projektin-nimi') as string,
    sortable: true,
    sortByFormatted: true,
    formatter(value: any, key: string, item: PerusteprojektiKevytDto) {
      return _.upperCase(item.peruste!.tyyppi) === 'OPAS' ? $kaanna(item.peruste!.nimi!) : item.nimi;
    },
  }, {
    key: 'koulutustyyppi',
    sortable: true,
    label: $t('koulutustyyppi') as string,
  }, {
    key: 'tila',
    sortable: true,
    label: $t('tila') as string,
    formatter: (value: any, key: string, item: PerusteprojektiKevytDto) => {
      return $t('tila-' + item!.tila);
    },
  }, {
    key: 'luotu',
    sortable: true,
    label: $t('luotu') as string,
    formatter: dateFormatter,
  }, {
    key: 'muokattu',
    sortable: true,
    label: $t('muokattu') as string,
    formatter: (value: any, key: string, item: PerusteprojektiKevytDto) => {
      return dateFormatter(item.globalVersion?.aikaleima ?? null);
    },
  }, {
    key: 'peruste.voimassaoloAlkaa',
    sortable: true,
    label: $t('voimassaolo-alkaa') as string,
    formatter: dateFormatter,
  }, {
    key: 'peruste.voimassaoloLoppuu',
    sortable: true,
    label: $t('voimassaolo-loppuu') as string,
    formatter: dateFormatter,
  }, {
    key: 'peruste.paatospvm',
    sortable: true,
    label: $t('paatospaivamaara') as string,
    formatter: dateFormatter,
  }];
});

const fields = computed(() => {
  return _.filter(initialFields.value, (field: any) => props.fieldKeys.length === 0 || _.includes(props.fieldKeys, field.key));
});

const filtersInclude = (filter) => {
  return !props.filters || _.includes(props.filters, filter);
};

const restore = async (item) => {
  await vaihdaPerusteTilaConfirm(
    {
      meta: {
        title: 'palauta-peruste',
        confirm: 'palauta-peruste-vahvistus',
        tila: 'laadinta',
        projektiId: item.id,
      },
      route,
      router,
    },
  );
  await onQueryChange(query);
  await props.provider.updateOwnProjects();
};

const naytaVainKortit = computed(() => {
  return props.vainKortit || !$hasOphCrud();
});

const hasNimiSlot = computed(() => {
  return hasSlotContent(slots.nimiotsikko);
});
</script>

<style lang="scss" scoped>

.upper {
  margin-bottom: 4rem;
}

.lower {
}

.teksti {
  font-size: 22px;
  font-weight: 400;
}

.ikoni {
  font-size: 38px;
  font-weight: 100;
}

.card-wrapper {
  margin: 0 20px 20px 0;
}

.small-text {
  color: #1d346b;
}

</style>
