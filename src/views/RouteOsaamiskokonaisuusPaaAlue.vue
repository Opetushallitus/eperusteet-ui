<template>
  <EpEditointi :store="editointiStore" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 v-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else>{{ $t('nimeton-osaamiskokonaisuus_paa_alue') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('paa-alueen-nimi') + ' *'" required>
            <ep-input v-model="data.nimi" :is-editing="isEditing">
            </ep-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="8">
          <b-form-group>
            <template #label>
              <div v-if="isEditing">
                {{$t('paa-alueen-kuvaus')}}
              </div>
            </template>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <template v-if="isEditing">
        <h3 class="mt-4">{{$t('osa-alueet')}}</h3>
        <draggable
          v-bind="defaultDragOptions"
          tag="div"
          v-model="data.osaAlueet">

          <b-row v-for="(osaAlue, index) in data.osaAlueet" :key="'tavoite'+index" class="pb-2">
            <b-col md="8">
              <div class="d-flex">
                <div class="order-handle mr-3">
                  <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                </div>
                <EpOsaAlue v-model="data.osaAlueet[index]" :isEditing="isEditing" class="w-100">
                  <template #poisto>
                    <div>
                      <b-button variant="link" @click.stop="poistaOsaAlue(osaAlue)">
                        <EpMaterialIcon>delete</EpMaterialIcon>
                        {{ $t('poista-osa-alue') }}
                    </b-button>
                    </div>
                  </template>
                </EpOsaAlue>
              </div>
            </b-col>
          </b-row>
        </draggable>

        <ep-button @click="lisaaOsaalue()" variant="outline" icon="add" class="mt-2">
          {{ $t('lisaa-osa-alue') }}
        </ep-button>
      </template>

      <template v-else>
        <div v-for="(osaAlue, index) in data.osaAlueet" :key="'osa-alue' + index" class="mt-4">
          <EpOsaAlue v-model="data.osaAlueet[index]" :isEditing="isEditing"/>
          <hr v-if="index !== data.osaAlueet.length -1" />
        </div>

      </template>

    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import { KuvaStore } from '@/stores/KuvaStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpOsaAlue from '@shared/components/EpOsaamiskokonaisuus/EpOsaAlue.vue';
import { OsaamiskokonaisuusPaaAlueStore } from '@/stores/OsaamiskokonaisuusPaaAlueStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import draggable from 'vuedraggable';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  osaamiskokonaisuusPaaAlueId: number;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const kasiteHandler = inject('kasiteHandler');
const kuvaHandler = inject('kuvaHandler');

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const store = new OsaamiskokonaisuusPaaAlueStore(
    perusteId.value!,
    Number(props.osaamiskokonaisuusPaaAlueId),
    versionumero.value,
  );
  editointiStore.value = new EditointiStore(store);
};

// Watch for changes in osaamiskokonaisuusPaaAlueId
watch(() => props.osaamiskokonaisuusPaaAlueId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

// Watch for changes in versionumero
watch(versionumero, async () => {
  await fetch();
});

const lisaaOsaalue = async () => {
  if (!editointiStore.value?.data.value) return;

  const currentData = editointiStore.value.data.value;
  const currentOsaAlueet = currentData.osaAlueet || [];

  editointiStore.value.setData({
    ...currentData,
    osaAlueet: [
      ...currentOsaAlueet,
      {
        tasokuvaukset: [
          {
            taso: 'VARHAISKASVATUS',
            osaamiset: [],
          },
          {
            taso: 'ESIOPETUS',
            edelleenKehittyvatOsaamiset: [],
            osaamiset: [],
          },
          {
            taso: 'VUOSILUOKKA_12',
            edelleenKehittyvatOsaamiset: [],
            osaamiset: [],
            edistynytOsaaminenKuvaukset: [],
          },
          {
            taso: 'VUOSILUOKKA_3456',
            edelleenKehittyvatOsaamiset: [],
            osaamiset: [],
            edistynytOsaaminenKuvaukset: [],
          },
          {
            taso: 'VUOSILUOKKA_789',
            edelleenKehittyvatOsaamiset: [],
            osaamiset: [],
            edistynytOsaaminenKuvaukset: [],
          },
        ],
      },
    ],
  });
};

const poistaOsaAlue = async (poistettavaOsaAlue: any) => {
  if (!editointiStore.value?.data.value) return;

  const currentData = editointiStore.value.data.value;

  editointiStore.value.setData({
    ...currentData,
    osaAlueet: _.filter(currentData.osaAlueet || [], osaAlue => osaAlue !== poistettavaOsaAlue),
  });
};

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !editointiStore.value?.isEditing.value,
    ghostClass: 'dragged',
  };
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
