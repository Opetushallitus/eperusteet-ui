<template>
  <div>
    <b-modal ref="tutkinnonosaTuontiModal"
            id="tuotutkinnonosa"
            size="xl"
            centered
            @close="close">
      <template v-slot:modal-title>
        {{ $t('tuo-tutkinnon-osa') }}
      </template>

      <div class="d-flex">
        <b-form-group class="w-50" :label="$t('tutkinnon-osan-nimi')">
          <ep-search v-model="tutkinnonosaQuery.nimi" :placeholder="$t('etsi-tutkinnon-osaa')"/>
          <ep-toggle v-model="tutkinnonosaQuery.vanhentuneet" :isSWitch="false" class="mt-2">
            {{$t('nayta-myos-vanhentuneet')}}
          </ep-toggle>
        </b-form-group>

        <b-form-group class="ml-auto w-50">
          <template #label>
            <div class="d-flex">
              <div>{{$t('tutkinto')}}</div>
              <ep-spinner v-if="perusteetLoading" />
            </div>
          </template>
          <EpMultiSelect
            class="flex-grow-1"
            v-model="tutkinnonosaQuery.peruste"
            :placeholder="!perusteetLoading ? $t('kirjoita-tutkinnon-nimi') : $t('valitse')"
            :is-editing="true"
            :options="perusteet ? perusteet : []"
            @search="perusteSearch"
            :internalSearch="false"
            :clearOnSelect="false">
            <template #noResult><div v-if="perusteet && perusteet.length === 0">{{ $t('ei-hakutuloksia') }}</div><div v-else/></template>
            <template #noOptions><div></div></template>
            <template #singleLabel="{ option }">
              {{ $kaanna(option.nimi) }}
              <span v-if="option.voimassaoloAlkaa">
                ({{$t('voimassa')}} {{$sd(option.voimassaoloAlkaa)}} - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
              </span>
            </template>
            <template #option="{ option }">
              {{ $kaanna(option.nimi) }}
              <span v-if="option.voimassaoloAlkaa">
                ({{$t('voimassa')}} {{$sd(option.voimassaoloAlkaa)}} - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
              </span>
            </template>
          </EpMultiSelect>
        </b-form-group>
      </div>

      <ep-spinner v-if="!tutkinnonosat" />

      <div v-else-if="tutkinnonosat.length > 0">
        <b-table
          responsive
          striped
          :items="tutkinnonosatWithSelected"
          :fields="tutkinnonosatFields">
          <template v-slot:cell(nimi)="{ item }">
            <div class="selectable" @click="selectRow(item)">
              <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
              <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
              <span>{{$kaanna(item.nimi)}}</span>
              <span v-if="item.tutkinnonOsa.koodiArvo">({{item.tutkinnonOsa.koodiArvo}})</span>
            </div>
          </template>
          <template v-slot:cell(peruste)="{ item, value }">

            <b-button variant="link" :id="'peruste-popover-'+item.id">
              {{$t('kaytossa')}}
            </b-button>

            <b-popover :target="'peruste-popover-'+item.id" triggers="hover click">
              <template #title>{{$t('kaytossa-tutkinnossa')}}</template>
              {{value}}
            </b-popover>

          </template>
        </b-table>
        <b-pagination v-if="totalRows > sisaltoSivuKoko"
            v-model="page"
            :total-rows="totalRows"
            :per-page="sisaltoSivuKoko"
            align="center"
            aria-controls="tuo-tutkinnon-osa"></b-pagination>
      </div>
      <div v-else>
        {{$t('ei-hakutuloksia')}}
      </div>

      <div v-if="selectedTutkinnonosat.length > 0">
        <h3>{{$t('valittu')}} {{selectedTutkinnonosat.length}} {{$t('kpl')}}</h3>
        <b-table
          responsive
          striped
          :items="tutkinnonosatWithSalliMuokattavaksi"
          :fields="valittuFields">

          <template v-slot:cell(salli-muokkaus)="{ item }">
            <div class="selectable" @click="selectSalliMuokkausRow(item)">
              <EpMaterialIcon v-if="item.kopioiMuokattavaksi" class="checked mr-2">check_box</EpMaterialIcon>
              <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
              <span>{{$t('kylla')}}</span>
            </div>
          </template>

        </b-table>
      </div>

      <template #modal-footer>
        <div>
          <ep-button @click="close" variant="link">{{ $t('peruuta')}}</ep-button>
          <ep-button @click="save">{{ $t('tuo-valitut-tutkinnon-osat')}}</ep-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, useTemplateRef, getCurrentInstance } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { PerusteDto, TutkinnonOsaViiteKontekstiDto } from '@shared/generated/eperusteet';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna, $sd, $success, $fail, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  peruste: PerusteDto;
}>();

const emit = defineEmits(['refresh']);

const tutkinnonosaTuontiModal = useTemplateRef('tutkinnonosaTuontiModal');

const tutkinnonosatTuontiStore = ref<TutkinnonosatTuontiStore | null>(null);
const perusteQuery = ref('');
const tutkinnonosaQuery = ref({} as any);
const sivu = ref(-1);
const sisaltoSivuKoko = ref(10);
const selectedTutkinnonosat = ref<TutkinnonOsaViiteKontekstiDto[]>([]);
const valitutMuokattavaksiTutkinnonosat = ref<TutkinnonOsaViiteKontekstiDto[]>([]);

const defaults = () => {
  tutkinnonosatTuontiStore.value = new TutkinnonosatTuontiStore(props.peruste);
  tutkinnonosaQuery.value = {
    sivukoko: sisaltoSivuKoko.value,
    nimi: '',
    peruste: null,
    vanhentuneet: false,
  } as any;

  page.value = 1;
  selectedTutkinnonosat.value = [];
  valitutMuokattavaksiTutkinnonosat.value = [];
};

const perusteet = computed(() => {
  return tutkinnonosatTuontiStore.value?.perusteet.value?.data || null;
});

const perusteetLoading = computed(() => {
  return !perusteet.value;
});

const tutkinnonosat = computed(() => {
  return tutkinnonosatTuontiStore.value?.tutkinnonosat?.value?.data || null;
});

const tutkinnonosatWithSelected = computed(() => {
  return _.map(tutkinnonosat.value, tutkinnonosa => {
    return {
      ...tutkinnonosa,
      selected: _.includes(_.map(selectedTutkinnonosat.value, 'id'), _.get(tutkinnonosa, 'id')),
    };
  });
});

const tutkinnonosatWithSalliMuokattavaksi = computed(() => {
  return _.map(selectedTutkinnonosat.value, tutkinnonosa => {
    return {
      ...tutkinnonosa,
      kopioiMuokattavaksi: _.includes(_.map(valitutMuokattavaksiTutkinnonosat.value, 'id'), _.get(tutkinnonosa, 'id')),
      alkuperainenPeruste: tutkinnonosa.peruste,
    };
  });
});

const tutkinnonosatPage = computed(() => {
  return tutkinnonosatTuontiStore.value?.tutkinnonosat.value || null;
});

const totalRows = computed(() => {
  return tutkinnonosatPage.value!.kokonaismäärä;
});

const page = computed({
  get() {
    return tutkinnonosatPage.value!.sivu + 1;
  },
  set(value: number) {
    sivu.value = value - 1;
  },
});

const tutkinnonosatFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: false,
    thStyle: { width: '40%' },
  }, {
    key: 'voimaantulo',
    label: $t('voimaantulo'),
    sortable: false,
    formatter: (value: any, key: string, item: any) => {
      return item.peruste.voimassaoloAlkaa ? $sd(item.peruste.voimassaoloAlkaa) : '';
    },
  }, {
    key: 'laajuus',
    label: $t('laajuus'),
    sortable: false,
  }, {
    key: 'peruste',
    label: $t('kaytossa'),
    sortable: false,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(item.peruste.nimi);
    },
  }];
});

const valittuFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: false,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'salli-muokkaus',
    label: $t('salli-muokkaus') + '?',
    sortable: false,
    thStyle: { width: '30%' },
  }];
});

const show = async () => {
  (tutkinnonosaTuontiModal.value as any).show();
  defaults();
};

const queryFetch = async () => {
  await tutkinnonosatTuontiStore.value!.fetchTutkinnonosat({ ...tutkinnonosaQuery.value, sivu: sivu.value, kieli: Kielet.getSisaltoKieli.value });
};

const save = async () => {
  try {
    await tutkinnonosatTuontiStore.value!.tuoSisaltoa(
      _.map(tutkinnonosatWithSalliMuokattavaksi.value, tutkinnonosa =>
        _.pick(tutkinnonosa, ['laajuus', 'nimi', 'suoritustapakoodi', 'tyyppi', '_tutkinnonOsa', 'kopioiMuokattavaksi', 'alkuperainenPeruste']) as any));

    $success($t('tutkinnon-osat-tuotu-onnistuneesti') as string);
    close();
    emit('refresh');
  }
  catch (e) {
    $fail($t('tutkinnon-osien-tuonti-epaonnistui') as string);
  }
};

const close = () => {
  $bvModal.hide('tuotutkinnonosa');
};

const selectRow = (item: any) => {
  if (_.includes(_.map(selectedTutkinnonosat.value, 'id'), item.id)) {
    selectedTutkinnonosat.value = _.filter(selectedTutkinnonosat.value, tutkinnonosa => tutkinnonosa.id !== item.id);
  }
  else {
    selectedTutkinnonosat.value = [
      ...selectedTutkinnonosat.value,
      item,
    ];
  }
};

const selectSalliMuokkausRow = (item: any) => {
  if (_.includes(_.map(valitutMuokattavaksiTutkinnonosat.value, 'id'), item.id)) {
    valitutMuokattavaksiTutkinnonosat.value = _.filter(valitutMuokattavaksiTutkinnonosat.value, tutkinnonosa => tutkinnonosa.id !== item.id);
  }
  else {
    valitutMuokattavaksiTutkinnonosat.value = [
      ...valitutMuokattavaksiTutkinnonosat.value,
      item,
    ];
  }
};

const perusteSearch = async (search: string) => {
  if (_.size(search) > 2) {
    await tutkinnonosatTuontiStore.value!.fetchPerusteet(search);
  }
};

watch(tutkinnonosaQuery, async () => {
  sivu.value = 0;
  await queryFetch();
}, { deep: true });

watch(sivu, async () => {
  await queryFetch();
});

defineExpose({ show });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.filter) {
    max-width: 100%;
  }

  .selectable {
    cursor: pointer;

    .checked {
      color: $paletti-blue;
    }
  }

</style>
