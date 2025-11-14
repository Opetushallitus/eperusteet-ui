<template>
  <ep-spinner v-if="!store" />
  <EpEditointi
    v-else
    :store="store"
  >
    <template #header>
      <h2>{{ $t('muokkaa-jarjestysta') }}</h2>
    </template>
    <template #default="{ data, isEditing }">
      <b-tabs content-class="mt-3">
        <b-tab
          v-if="data.tutkinnonOsat"
          :title="$t('tutkinnon-osat')"
        >
          <EpJarjesta
            v-model="data.tutkinnonOsat"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing"
          >
            <template #default="{ node }">
              <span>
                {{ $kaanna(node.nimi) }}
              </span>
            </template>
          </EpJarjesta>
        </b-tab>
        <b-tab
          v-if="data.tekstit"
          :title="$t('tekstikappaleet')"
        >
          <EpJarjesta
            v-model="data.tekstit.lapset"
            child-field="lapset"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing"
          >
            <template #default="{ node }">
              <span>
                {{ $kaanna(node.perusteenOsa.nimi) }}
              </span>
              <EpMaterialIcon
                v-if="node.perusteenOsa.liite"
                v-b-popover="{content: $t('tekstikappale-naytetaan-liitteena'), trigger: 'hover'}"
                size="18px"
              >
                attach_file
              </EpMaterialIcon>
            </template>
          </EpJarjesta>
        </b-tab>
        <b-tab
          v-if="data.vaiheet"
          :title="$t('vaiheet')"
        >
          <EpJarjesta
            v-model="data.vaiheet.vaiheet"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing"
          >
            <template #default="{ node }">
              <span>
                {{ $kaanna(node.nimi) }}
              </span>
            </template>
          </EpJarjesta>
        </b-tab>
      </b-tabs>
    </template>
  </EpEditointi>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { JarjestysStore } from '@/stores/JarjestysStore';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';
import { Koulutustyyppi } from '@shared/tyypit';
import { AipeVaiheetStore } from '@/stores/AipeVaiheetStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t } from '@shared/utils/globals';
import { useRoute } from 'vue-router';

const props = defineProps<{
  perusteStore: any;
}>();

const store = ref<EditointiStore | null>(null);
const stores = ref<{ [key: string]: IEditoitava }>({});
const route = useRoute();

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const isAmmatillinen = computed(() => {
  return props.perusteStore.isAmmatillinen.value;
});

const perusteId = computed(() => {
  return props.perusteStore.perusteId.value;
});

const projektiId = computed(() => {
  return route.params.projektiId;
});

const onProjektiChange = async () => {
  if (perusteId.value) {
    stores.value = {
      tekstit: new TekstiRakenneStore(perusteId.value),
    };

    if (isAmmatillinen.value) {
      stores.value.tutkinnonOsat = new TutkinnonOsaStore(props.perusteStore);
    }

    if (peruste.value?.koulutustyyppi === Koulutustyyppi.aikuistenperusopetus) {
      stores.value.vaiheet = new AipeVaiheetStore(perusteId.value, props.perusteStore);
    }

    store.value = new EditointiStore(new JarjestysStore(stores.value));
  }
};

// Initialize component when mounted
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in perusteId or projektiId
watch([() => projektiId, () => perusteId], async () => {
  if (projektiId.value && perusteId.value) {
    await onProjektiChange();
  }
});
</script>
