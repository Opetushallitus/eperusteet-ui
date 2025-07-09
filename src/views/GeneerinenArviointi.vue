<template>
  <div class="geneerinen" v-if="inner">
    <div class="otsikko" role="button" @click="toggleOpen()">
      <div class="d-flex">
        <div class="flex-grow-1">
          {{ $kaanna(inner.nimi) }}
        </div>
        <div class="flex-shrink-1">
          <EpMaterialIcon v-if="isOpen">expand_less</EpMaterialIcon>
          <EpMaterialIcon v-else>expand_more</EpMaterialIcon>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="sisalto mt-4">
      <div v-if="isEditing && !inner.julkaistu">
        <div class="kohde-otsikko">{{ $t('arvioinnin-nimi') }}</div>
        <ep-input v-model="inner.nimi" :is-editing="true" />
      </div>
      <div class="mt-4">
        <div class="kohde-otsikko">{{ $t('arvioinnin-kohde') }}</div>
        <ep-input v-model="inner.kohde" :is-editing="isEditing" />
      </div>
      <div class="mt-4" v-if="inner.julkaistu">
        <div class="kohde-otsikko">{{ $t('oletusvalinta') }}</div>
        <b-form-checkbox v-model="inner.oletusvalinta" v-if="isEditing" switch></b-form-checkbox>
        <div v-else>{{ $t('' + inner.oletusvalinta) }}</div>
      </div>
      <div class="mt-4">

        <div v-if="!isEditing && kriteeriton" class="mb-3">
          <div> {{ $kaanna(osaamistaso) }} </div>
        </div>

        <b-table
          v-else
          striped
          hover
          responsive
          show-empty
          :empty-text="$t('ei-sisaltoa')"
          :items="osaamistasot"
          :fields="fields">

          <template v-slot:table-colgroup="scope">
            <col v-for="field in scope.fields" :key="field.key" :style="{ width: field.key === 'osaamistaso' && '160px' }" />
          </template>

          <template v-slot:cell(osaamistaso)="data">
            <div class="osaamistaso">{{ $kaanna(data.item.otsikko) }}</div>
          </template>

          <template v-slot:cell(kriteerit)="data">
            <EpBulletEditor kohde="" :model-value="data.item.kriteerit" :is-editable="isEditing" :allowStructureChange="!inner.julkaistu">
              <template #add>{{ $t('lisaa-kriteeri') }}</template>
            </EpBulletEditor>
          </template>
        </b-table>
      </div>
      <EpSpinner v-if="isLoading" />
      <div v-else>
        <div v-if="!isEditing">
          <ep-button variant="primary" @click="onCopy()" v-if="inner.julkaistu">{{ $t('kopioi') }}</ep-button>
          <ep-button variant="primary ml-2" @click="onEdit()" v-if="!inner.julkaistu || kayttajaIsAdmin">{{ $t('muokkaa') }}</ep-button>
        </div>
        <div class="d-flex justify-content-between" v-else>
          <div>
            <ep-button variant="link" @click="onRemove()" v-if="!inner.julkaistu">{{ $t('poista') }}</ep-button>
            <ep-button class="ml-2" variant="primary" @click="onSave()">{{ $t('tallenna') }}</ep-button>
            <ep-button class="ml-2" variant="primary" @click="onPublish()" v-if="!inner.julkaistu">{{ $t('julkaise') }}</ep-button>
            <ep-button class="ml-2" variant="primary" @click="onUnPublish()" v-if="inner.julkaistu && kayttajaIsAdmin">{{ $t('palauta-keskeneraiseksi') }}</ep-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpBulletEditor from '@/components/EpBulletEditor/EpBulletEditor.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet';
import EpInput from '@shared/components/forms/EpInput.vue';
import * as _ from 'lodash';
import { KayttajaStore } from '@/stores/kayttaja';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  value: GeneerinenArviointiasteikkoDto;
  arviointiStore: ArviointiStore;
  kayttajaStore: KayttajaStore;
  editing?: boolean;
}>();

const isEditing = ref(false);
const inner = ref<GeneerinenArviointiasteikkoDto | null>(null);
const isLoading = ref(false);

watch(() => props.editing, (value) => {
  isEditing.value = value ?? false;
}, { immediate: true });

watch(() => props.value, (value) => {
  inner.value = value;
}, { immediate: true });

const asteikot = computed(() => {
  return props.arviointiStore.arviointiasteikot.value;
});

const osaamistasot = computed(() => {
  if (!asteikot.value) {
    return null;
  }
  const asteikko = _.find(asteikot.value, asteikko => asteikko.id === _.parseInt((props.value as any)._arviointiAsteikko));
  if (asteikko) {
    return _.map(asteikko.osaamistasot, ot => ({
      ...ot,
      kriteerit: _.find(props.value.osaamistasonKriteerit,
        k => '' + (k as any)._osaamistaso === '' + ot.id)?.kriteerit || [],
    }));
  }
  return null;
});

const fields = computed(() => {
  return [{
    key: 'osaamistaso',
    label: $t('osaamistaso') as string,
    sortable: false,
  }, {
    key: 'kriteerit',
    label: $t('kriteerit') as string,
    sortable: false,
  }];
});

const isOpen = computed(() => {
  return !props.value.id || props.arviointiStore.closed.value[props.value.id] !== true;
});

const kayttajaIsAdmin = computed(() => {
  return props.kayttajaStore.isAdmin.value;
});

const kriteeriton = computed(() => {
  return osaamistasot.value?.length === 1
    && _.chain(osaamistasot.value)
      .map('kriteerit')
      .flatten()
      .isEmpty()
      .value();
});

const osaamistaso = computed(() => {
  return _.get(_.first(osaamistasot.value), 'otsikko');
});

const toggleOpen = () => {
  props.arviointiStore.toggleOpen(props.value);
};

const onEdit = () => {
  isEditing.value = true;
};

const onSave = async () => {
  try {
    inner.value!.osaamistasonKriteerit = _.map(inner.value!.osaamistasonKriteerit, osaamiskriteeri => {
      return {
        ...osaamiskriteeri,
        kriteerit: _.reject(osaamiskriteeri.kriteerit, _.isEmpty),
      };
    });

    isLoading.value = true;
    await props.arviointiStore.save(inner.value!);
  }
  finally {
    await props.arviointiStore.fetchGeneeriset();
    isEditing.value = false;
    isLoading.value = false;
  }
};

const onPublish = async () => {
  await $bvModal?.msgBoxConfirm(
    $t('julkaistaanko-geneerinen-arviointi-kuvaus') as any, {
      title: $t('julkaistaanko-geneerinen-arviointi') as any,
      okTitle: $t('julkaise') as any,
      cancelTitle: $t('peruuta') as any,
      size: 'lg',
    });
  isEditing.value = false;
  try {
    isLoading.value = true;
    await props.arviointiStore.publish(inner.value!, true);
  }
  finally {
    await props.arviointiStore.fetchGeneeriset();
    isEditing.value = false;
    isLoading.value = false;
  }
};

const onUnPublish = async () => {
  await $bvModal?.msgBoxConfirm(
    $t('palautetaanko-geneerinen-arviointi-keskeneraiseksi-kuvaus') as any, {
      title: $t('palautetaanko-geneerinen-arviointi-keskeneraiseksi') as any,
      okTitle: $t('palauta-keskeneraiseksi') as any,
      cancelTitle: $t('peruuta') as any,
      size: 'lg',
    });
  isEditing.value = false;
  try {
    isLoading.value = true;
    await props.arviointiStore.publish(inner.value!, false);
  }
  finally {
    await props.arviointiStore.fetchGeneeriset();
    isEditing.value = false;
    isLoading.value = false;
  }
};

const onCopy = async () => {
  try {
    isLoading.value = true;
    await props.arviointiStore.copy(inner.value!);
  }
  finally {
    await props.arviointiStore.fetchGeneeriset();
    isLoading.value = false;
  }
};

const onRemove = async () => {
  if (!inner.value?.id) {
    return;
  }

  await $bvModal?.msgBoxConfirm(
    $t('poistetaanko-geneerinen-arviointi-kuvaus') as any, {
      title: $t('poistetaanko-geneerinen-arviointi') as any,
      okTitle: $t('poista') as any,
      cancelTitle: $t('peruuta') as any,
      size: 'lg',
    });
  isEditing.value = false;
  try {
    isLoading.value = true;
    await props.arviointiStore.remove(inner.value);
  }
  finally {
    await props.arviointiStore.fetchGeneeriset();
    isEditing.value = false;
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.geneerinen {
  border: 1px solid #C4C4C4;
  margin-top: 20px;
  border-radius: 5px;

  .otsikko {
    padding: 20px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
  }

  .sisalto {
    padding: 0 20px 20px 20px;
  }

  .kohde-otsikko {
    font-weight: 500;
  }

  .osaamistaso {
    font-weight: 500;
  }
}
</style>
