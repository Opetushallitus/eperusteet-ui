<template>
  <div>
    <table class="table" v-if="modelValue && modelValue.length > 0">
      <thead>
        <tr>
          <th>{{ $t('nimi') }}</th>
          <th>{{ $t('tiedosto') }}</th>
          <th v-if="isEditing"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(muutos, idx) in modelValue" :key="'muutos' + idx">
          <td>
            <ep-input v-model="muutos.nimi" :is-editing="isEditing" :placeholder="(muutos.liitteet && muutos.liitteet[$slang]) ? muutos.liitteet[$slang].nimi : ''"/>
          </td>
          <td>
            <span v-if="!!muutos.liitteet && muutos.liitteet[$slang.value]">
              {{muutos.liitteet[$slang.value].nimi}}
            </span>
          </td>
          <td v-if="isEditing">
            <div class="text-center">
              <ep-button variant="link" icon="delete" @click="poista(idx)"></ep-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <ep-button class="mt-3" @click="lisaaMuutosmaarays()" v-if="isEditing">{{ $t('lisaa-muutosmaarays') }}</ep-button>

    <EpSpinner v-if="!muutosmaaraykset" />
    <b-table
      v-else-if="muutosmaaraykset.length > 0"
      class="w-90 mt-3"
      :items="muutosmaaryksetSorted"
      :fields="muutosmaarayksetFields"
      striped>

      <template v-slot:cell(nimi)="{ item }">
        <EpPdfLink v-if="item.url" :url="item.url">{{ $kaanna(item.nimi) }}</EpPdfLink>
        <div v-else>{{ $kaanna(item.nimi) }}</div>
      </template>

      <template v-slot:cell(toiminnot)="{item}">
        <div class="d-flex" v-if="isEditing">
          <EpButton icon="edit" variant="link" @click="muokkaaMuutosmaarausta(item)">{{$t('muokkaa')}}</EpButton>
          <EpButton icon="delete" variant="link" @click="poistaMuutosmaarays(item)" :showSpinner="item.poistossa">{{$t('poista')}}</EpButton>
        </div>
      </template>

    </b-table>

    <EpMuutosmaaraysModal ref="muutosmaaraysModal" :perusteStore="perusteStore" />
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { ref, computed, useTemplateRef, getCurrentInstance } from 'vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { MaarayksetParams, MaaraysLiiteDtoTyyppiEnum, baseURL } from '@shared/api/eperusteet';
import EpMuutosmaaraysModal from '@/components/EpPerusteenTiedot/EpMuutosmaaraysModal.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $success, $bvModal, $slang, $sd } from '@shared/utils/globals';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  perusteStore: {
    type: Object as () => PerusteStore,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);
const muutosmaaraysModal = useTemplateRef('muutosmaaraysModal');
const poistossa = ref<number[]>([]);

const poista = (idx) => {
  const temp = [...props.modelValue];
  temp.splice(idx, 1);
  emit('update:modelValue', temp);
};

const updateLiite = (idx, liite) => {
  const temp = props.modelValue;
  temp[idx].liitteet[$slang.value] = { ...liite };
  emit('update:modelValue', temp);
};

const muutosmaaraykset = computed(() => {
  if (props.perusteStore.muutosmaaraykset.value) {
    return _.map(props.perusteStore.muutosmaaraykset.value, muutosmaarays => {
      return {
        ...muutosmaarays,
        url: muutosmaaraysUrl(muutosmaarays),
        poistossa: _.includes(poistossa.value, muutosmaarays.id),
      };
    });
  }
  return [];
});

const muutosmaaryksetSorted = computed(() => {
  return muutosmaaraykset.value;
});

const muutosmaaraysUrl = (muutosmaarays) => {
  if (!_.find(muutosmaarays.liitteet![kieli.value].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI)) {
    return null;
  }

  return baseURL + MaarayksetParams.getMaaraysLiite(_.toString(_.get(_.find(muutosmaarays.liitteet![kieli.value].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI), 'id'))).url;
};

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const muutosmaarayksetFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    thStyle: { width: '60%' },
    thClass: 'border-bottom-1',
    tdClass: 'align-middle',
    sortable: false,
  }, {
    key: 'voimassaoloAlkaa',
    label: $t('voimassaolo-alkaa'),
    thClass: 'border-bottom-1',
    tdClass: 'align-middle',
    sortable: false,
    formatter: (value: any, key: any, item: any) => {
      return $sd(value);
    },
  }, {
    key: 'toiminnot',
    label: '',
    thStyle: { width: '10%', borderBottom: '0px' },
    sortable: false,
  }];
});

const lisaaMuutosmaarays = () => {
  muutosmaaraysModal.value.muokkaa();
};

const muokkaaMuutosmaarausta = async (muutosmaarays) => {
  muutosmaaraysModal.value.muokkaa(muutosmaarays);
};

const poistaMuutosmaarays = async (muutosmaarays) => {
  const poista = await $bvModal.msgBoxConfirm($t('poista-muutosmaarays-varmistus'), {
    title: $t('poista-muutosmaarays'),
    okVariant: 'primary',
    okTitle: $t('poista'),
    cancelVariant: 'link',
    cancelTitle: $t('peruuta'),
    centered: true,
  });

  if (poista) {
    poistossa.value.push(muutosmaarays.id);
    try {
      await props.perusteStore.poistaMuutosmaarays(muutosmaarays);
      poistossa.value = _.without(poistossa.value, muutosmaarays.id);
      $success($t('muutosmaarays-poistettu'));
    }
    catch (err) {
      poistossa.value = _.without(poistossa.value, muutosmaarays.id);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
