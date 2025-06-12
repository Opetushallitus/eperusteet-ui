<template>
  <ep-main-view :container="true">
    <template #header>
      <h1>{{ $t('yllapito') }}</h1>
    </template>

    <EpSpinner v-if="!yllapitoTiedot" />
    <template v-else-if="yllapitoTiedot && yllapitoTiedot.length > 0">
      <div class="mt-4">
        <b-table
          striped
          hover
          responsive
          show-empty
          :empty-text="$t('ei-sisaltoa')"
          :items="yllapitoTiedot"
          :fields="fields">

          <template v-slot:cell(kuvaus)="data">
            <ep-input v-model="data.item.kuvaus"/>
          </template>

          <template v-slot:cell(key)="data">
            <ep-input v-model="data.item.key" :is-editing="false" />
          </template>

          <template v-slot:cell(value)="data">
            <ep-toggle v-model="data.item.value" :is-editing="isEditing" v-if="isBoolean(data.item.value)"/>
            <ep-input type="string" v-model="data.item.value" :is-editing="isEditing" v-else/>
          </template>

        </b-table>
      </div>
      <div v-if="!isEditing">
        <ep-button variant="primary ml-2" @click="onEdit()">{{ $t('muokkaa') }}</ep-button>
      </div>
      <div v-else class="d-flex justify-content-between">
        <div>
          <ep-button class="ml-2" variant="primary" @click="onSave()" :disabled="v$.$invalid">{{ $t('tallenna') }}</ep-button>
        </div>
      </div>
      <hr class="my-4"/>
    </template>

    <h2 class="mt-5">{{ $t('julkisivun-perusteiden-jarjestys') }}</h2>
    <EpButton @click="muokkaaPerusteidenJarjestysta" v-if="!isEditingPerusteJarjestys">{{ $t('muokkaa')}}</EpButton>
    <EpButton @click="peruuta" v-if="isEditingPerusteJarjestys" link>{{ $t('peruuta')}}</EpButton>
    <EpButton @click="tallenna" v-if="isEditingPerusteJarjestys">{{ $t('tallenna')}}</EpButton>
    <EpSpinner v-if="!julkisivunPerusteetRyhmiteltyna"/>
    <div v-for="perusteRyhma in julkisivunPerusteetRyhmiteltyna" :key="perusteRyhma.ryhma">
      <h3 class="mt-4">{{ $t(perusteRyhma.ryhma) }}</h3>
      <EpBalloonList v-model="perusteRyhma.perusteet" :isEditing="isEditingPerusteJarjestys" sortable>
        <template v-slot:default="{ item }">
          <div class="d-flex w-100 justify-content-between">
            <div>{{ $kaanna(item.nimi) }}</div>
            <EpToggle v-model="item.piilotaJulkisivulta" :isEditing="isEditingPerusteJarjestys"> {{ $t('piilota-julkisivulta') }}</EpToggle>
          </div>
        </template>
      </EpBalloonList>
    </div>

    <hr/>

    <h2 class="mb-5">{{ $t('muut-toimenpiteet') }}</h2>
    <EpButton @click="amosaaKoulutustoimijaPaivitys()" :showSpinner="amosaaKtPaivitysLoading">{{$t('paivita-amosaa-koulutustoimijat')}}</EpButton>
  </ep-main-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpBalloonList from '@shared/components/EpBalloonList/EpBalloonList.vue';
import { YllapitoStore } from '@/stores/YllapitoStore';
import { YllapitoDto } from '@shared/generated/eperusteet';
import { useVuelidate } from '@vuelidate/core';
import { notNull } from '@shared/validators/required';
import { Maintenance } from '@shared/api/eperusteet';
import _ from 'lodash';
import { EperusteetKoulutustyyppiRyhmaSort, julkisivuPerusteKoosteJarjestys, themes } from '@shared/utils/perusteet';
import { $t, $kaanna, $success } from '@shared/utils/globals';

const props = defineProps<{
  yllapitoStore: YllapitoStore;
}>();

const isEditing = ref(false);
const isEditingPerusteJarjestys = ref(false);
const yllapitoTiedot = ref<YllapitoDto[] | null>(null);
const amosaaKtPaivitysLoading = ref(false);
const julkisivunPerusteetRyhmiteltyna = ref<any[] | null>(null);

const rules = {
  inner: {
    $each: {
      kuvaus: notNull(),
      key: notNull(),
      value: notNull(),
    },
  },
};

const v$ = useVuelidate(rules, { inner: yllapitoTiedot });

onMounted(async () => {
  yllapitoTiedot.value = await props.yllapitoStore.fetch();
  await fetchJulkisivunPerusteet();
});

const fetchJulkisivunPerusteet = async () => {
  julkisivunPerusteetRyhmiteltyna.value = null;
  await props.yllapitoStore.fetchJulkisivunPerusteet();
  julkisivunPerusteetRyhmiteltyna.value = ryhmittelePerusteet();
};

const julkisivunPerusteet = computed(() => {
  return props.yllapitoStore.julkisivunPerusteet.value;
});

const ryhmittelePerusteet = () => {
  const ryhmitetty = _.map(julkisivunPerusteet.value, (peruste) => {
    return {
      ...peruste,
      ryhma: themes[peruste.koulutustyyppi!],
    };
  });

  return _.chain(ryhmitetty)
    .groupBy('ryhma')
    .map((perusteet, ryhma) => {
      return {
        ryhma,
        perusteet: _.chain(perusteet)
          .map(peruste => {
            return {
              ...peruste,
              kaannettyNimi: $kaanna(peruste.nimi!),
            };
          })
          .orderBy(julkisivuPerusteKoosteJarjestys.keys, julkisivuPerusteKoosteJarjestys.sortby)
          .value(),
      };
    })
    .orderBy(perusteRyhma => EperusteetKoulutustyyppiRyhmaSort[perusteRyhma.ryhma])
    .value();
};

const onSave = async () => {
  await props.yllapitoStore.save(yllapitoTiedot.value!);
  $success($t('tallennus-onnistui') as string);
  isEditing.value = false;
};

const fields = computed(() => {
  return [{
    key: 'kuvaus',
    label: $t('kuvaus') as string,
    thStyle: { width: '33%' },
    sortable: false,
  }, {
    key: 'key',
    label: $t('avain') as string,
    thStyle: { width: '33%' },
    sortable: false,
  }, {
    key: 'value',
    label: $t('arvo') as string,
    thStyle: { width: '33%' },
    sortable: false,
  }];
});

const onEdit = () => {
  isEditing.value = true;
};

const isBoolean = (val) => {
  return val === false || val === true || val === 'false' || val === 'true';
};

const amosaaKoulutustoimijaPaivitys = async () => {
  amosaaKtPaivitysLoading.value = true;
  try {
    await Maintenance.paivitaAmosaaKoulutustoimijat();
    $success('Päivitys käynnistetty');
  }
  catch (e) {
    $success($t('virhe-palvelu-virhe') as string);
  }
  amosaaKtPaivitysLoading.value = false;
};

const muokkaaPerusteidenJarjestysta = () => {
  isEditingPerusteJarjestys.value = !isEditingPerusteJarjestys.value;
};

const peruuta = async () => {
  isEditingPerusteJarjestys.value = !isEditingPerusteJarjestys.value;
  await fetchJulkisivunPerusteet();
};

const tallenna = async () => {
  const perusteet = _.chain(julkisivunPerusteetRyhmiteltyna.value)
    .reduce((acc, ryhma) => {
      return acc.concat(ryhma.perusteet);
    }, [])
    .map((peruste, index) => ({
      ...peruste as any,
      julkisivuJarjestysNro: index,
    }))
    .value();

  await props.yllapitoStore.tallennaJulkisivunPerusteet(perusteet);
  isEditingPerusteJarjestys.value = !isEditingPerusteJarjestys.value;
  $success($t('tallennus-onnistui') as string);
  await fetchJulkisivunPerusteet();
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
