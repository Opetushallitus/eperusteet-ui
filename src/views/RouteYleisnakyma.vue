<template>
  <div class="yleisnakyma">
    <div v-if="tyyppi === 'peruste'">
      <div class="row">
        <div class="col">
          <ep-peruste-aikataulu class="info-box" :aikatauluStore="aikatauluStore" :peruste="peruste"/>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <ep-peruste-tiedotteet class="info-box" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/>
          <ep-peruste-perustiedot class="info-box" :peruste="peruste" :projekti="projekti" :tyoryhmaStore="tyoryhmaStore"/>
          <ep-peruste-tutkinnon-osat class="info-box" :peruste="peruste" :tutkinnonOsaStore="tutkinnonOsaStore" v-if="isAmmatillinen"/>
          <ep-peruste-rakenne class="info-box" :perusteStore="perusteStore"/>
        </div>
        <div class="col">
          <EpViimeaikainenToiminta class="info-box" :muokkaustietoStore="muokkaustietoStore" :tyyppi="perusteTyyppi"/>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="row">
        <div class="col">
          <ep-opas-perustiedot class="info-box" :peruste="peruste" :projekti="projekti" :tyoryhmaStore="tyoryhmaStore"/>
        </div>
        <div class="col">
          <EpViimeaikainenToiminta class="info-box" :muokkaustietoStore="muokkaustietoStore" :tyyppi="perusteTyyppi"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, watch, onMounted } from 'vue';
import EpPerusteAikataulu from '@/components/EpYleisnakyma/EpPerusteAikataulu.vue';
import EpPerustePerustiedot from '@/components/EpYleisnakyma/EpPerustePerustiedot.vue';
import EpOpasPerustiedot from '@/components/EpYleisnakyma/EpOpasPerustiedot.vue';
import EpPerusteTutkinnonOsat from '@/components/EpYleisnakyma/EpPerusteTutkinnonOsat.vue';
import EpPerusteTiedotteet from '@/components/EpYleisnakyma/EpPerusteTiedotteet.vue';
import EpPerusteRakenne from '@/components/EpYleisnakyma/EpPerusteRakenne.vue';
import EpViimeaikainenToiminta from '@shared/components/EpViimeaikainenToiminta/EpViimeaikainenToiminta.vue';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';

const props = withDefaults(defineProps<{
  tutkinnonOsaStore: TutkinnonOsaStore;
  tyyppi?: 'opas' | 'peruste';
  perusteStore: any;
  muokkaustietoStore: any;
  aikatauluStore: any;
  tiedotteetStore: any;
  tyoryhmaStore: any;
  isAmmatillinen?: boolean;
}>(), {
  tyyppi: 'peruste',
});

const projekti = computed(() => {
  return props.perusteStore.projekti.value;
});

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const perusteTyyppi = computed(() => {
  return _.get(peruste.value, 'tyyppi');
});

const onProjektiChange = async () => {
  if (peruste.value && peruste.value.id) {
    await Promise.all([
      props.muokkaustietoStore.init(peruste.value.id),
      props.aikatauluStore.init(peruste.value),
      props.tiedotteetStore.init({ perusteIds: [peruste.value.id] }),
      props.tyoryhmaStore.init(projekti.value?.ryhmaOid),
      ...(props.isAmmatillinen ? [props.tutkinnonOsaStore.fetch()] : []),
    ]);
  }
};

// Initialize component when mounted
onMounted(async () => {
  await onProjektiChange();
});

// Watch for changes in peruste
watch(peruste, async (newValue) => {
  if (newValue && newValue.id) {
    await onProjektiChange();
  }
}, { deep: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.yleisnakyma {

  height: 100%;
  background-color: $gray-lighten-5;
  padding: 10px;

  .row {
    margin: 0px;

    .col {
      padding: 0px;
      padding-left: 10px;
    }
  }

  .info-box {
    margin-bottom: 10px;
    padding:20px;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
    min-width: 370px;
  }

}

</style>
