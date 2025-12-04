<template>
  <EpMainView container>
    <EpPerusteprojektiListaus
      :provider="kieliKaantajaTutkinnotStore"
      :edit-route="'perusteprojekti'"
      :new-route="{ name: 'kieliKaantajaTutkintoLuonti' }"
      :show-cards="true"
      :vain-kortit="true"
    >
      <template #upperheader>
        <div>
          <div class="d-flex justify-content-between">
            <h2>{{ $t('kieli-kaantaja-tutkinto') }}</h2>
            <div>
              <EpArkistoidutModal
                v-if="arkistoidut && arkistoidut.length > 0"
                :arkistoidut="arkistoidut"
                @restore="onRestore"
              >
                <template #title>
                  <span>{{ $t('arkistoidut-projektit') }}</span>
                </template>
                <template #palauta="{ data }">
                  <EpButton
                    v-if="palautusoikeus(data.item)"
                    variant="link"
                    icon="keyboard_return"
                    @click="onRestore(data.item)"
                  >
                    {{ $t('palauta') }}
                  </EpButton>
                </template>
              </EpArkistoidutModal>
            </div>
          </div>
          <div>{{ $t('kieli-kaantaja-tutkinto-listaus-selite') }}</div>
        </div>
      </template>
      <template #unpublished-header>
        <h2>{{ $t('keskeneraiset-projektit') }}</h2>
      </template>
      <template #published-header>
        <h2>{{ $t('julkaistut-projektit') }}</h2>
      </template>
      <template #cardsEmpty>
        <div />
      </template>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import _ from 'lodash';
import EpArkistoidutModal from '@shared/components/EpArkistoidutModal/EpArkistoidutModal.vue';
import { vaihdaPerusteTilaConfirm } from '@/utils/varmistusmetodit';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { $t } from '@shared/utils/globals';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const props = defineProps<{
  kieliKaantajaTutkinnotStore: PerusteetStore;
}>();

const route = useRoute();
const router = useRouter();

const haePoistetut = async () => {
  await props.kieliKaantajaTutkinnotStore.updateQuery({
    sivu: 0,
    sivukoko: 100,
    tila: ['POISTETTU'],
    jarjestysOrder: false,
    jarjestysTapa: 'nimi',
  });
};

const arkistoidut = computed(() => {
  if (props.kieliKaantajaTutkinnotStore.projects.value) {
    return _.map(props.kieliKaantajaTutkinnotStore.projects.value?.data, (perusteprojekti: any) => {
      return {
        ...perusteprojekti,
        muokattu: perusteprojekti.peruste.muokattu,
      };
    });
  }
  return [];
});

const palautusoikeus = (perusteprojekti: any) => {
  return _.includes(perusteprojekti.oikeudet.perusteprojekti, 'tilanvaihto');
};

const onRestore = async (perusteprojekti: any) => {
  await vaihdaPerusteTilaConfirm(
    {
      meta: {
        title: 'palauta-peruste',
        confirm: 'palauta-peruste-vahvistus',
        tila: 'laadinta',
        projektiId: perusteprojekti.id,
      },
      route,
      router,
    },
  );
  await haePoistetut();
  await props.kieliKaantajaTutkinnotStore.updateOwnProjects();
};

onMounted(async () => {
  props.kieliKaantajaTutkinnotStore.clear();
  await haePoistetut();
});
</script>

<style lang="scss">
@import "@shared/styles/_variables.scss";

.koulutustyypit {

  .lukumaara {
    font-size: 0.75rem;
    padding: 2px 5px;
    border: 1px solid $gray-lighten-11;
    color: $gray-lighten-12;
  }

}
</style>

