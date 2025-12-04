<template>
  <EpMainView>
    <EpPerusteprojektiListaus
      :provider="perusteOppaatStore"
      :edit-route="'opas'"
      :new-route="{ name: 'opasLuonti' }"
      :field-keys="['nimi','koulutustyyppi','tila','luotu', 'globalVersion.aikaleima']"
      :filters="['koulutustyyppi', 'peruste', 'tila']"
      :show-cards="!$isAdmin() && !$hasOphCrud()"
    >
      <template #upperheader>
        <h2>{{ $t('Oppaasi') }}</h2>
      </template>
      <template #published-header>
        <h2>{{ $t('julkaistut-oppaat') }}</h2>
      </template>
      <template #cardsEmpty>
        <h3>{{ $t('ei-oppaita') }}</h3>
      </template>
      <template #lowerheader>
        <h2 class="pt-2 flex-grow-1">
          {{ $t('oppaat') }}
        </h2>
        <router-link :to="{ name: 'opasLuonti' }">
          <ep-button
            class="m-0 p-0"
            variant="outline"
            icon="add"
          >
            {{ $t('lisaa-opas') }}
          </ep-button>
        </router-link>
      </template>
      <template #nimiotsikko>
        {{ $t('oppaan-nimi') }}
      </template>
      <template #koulutustyyppisarake="{ perusteProjekti }">
        <span
          v-if="ensimmainenKoulutustyyppi(perusteProjekti)"
          class="text-nowrap koulutustyypit"
        >
          <EpColorIndicator
            :size="10"
            :kind="ensimmainenKoulutustyyppi(perusteProjekti)"
          />
          <span class="ml-1">
            {{ $t(ensimmainenKoulutustyyppi(perusteProjekti)) }}
          </span>
          <span
            v-if="koulutustyypit(perusteProjekti) && koulutustyypit(perusteProjekti).length > 1"
            :id="'koulutustyypit'+perusteProjekti.id"
            class="lukumaara"
          >
            +{{ koulutustyypit(perusteProjekti).length -1 }}
            <b-popover
              triggers="hover click focus"
              :target="'koulutustyypit'+perusteProjekti.id"
              placement="bottomright"
            >
              <h3>{{ $t('koulutustyypit') }}</h3>
              <ep-julki-lista
                :tiedot="koulutustyypit(perusteProjekti)"
                listaus-tyyppi="sivutus"
                tieto-maara="5"
              >
                <template #otsikko="{ item }">
                  <EpColorIndicator
                    :size="10"
                    :kind="item.otsikko"
                  />
                  <span class="ml-1">
                    {{ $t(item.otsikko) }}
                  </span>
                </template>
              </ep-julki-lista>
            </b-popover>
          </span>
        </span>
      </template>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OmatPerusteetStore } from '@/stores/OmatPerusteetStore';
import * as _ from 'lodash';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import { koulutustyyppiRyhmaSort, themes } from '@shared/utils/perusteet';
import { $t, $isAdmin, $hasOphCrud } from '@shared/utils/globals';

const props = defineProps<{
  perusteOppaatStore: OmatPerusteetStore;
}>();

onMounted(() => {
  props.perusteOppaatStore.clear();
});

function ensimmainenKoulutustyyppi(perusteProjekti) {
  if (perusteProjekti.peruste.oppaanKoulutustyypit && perusteProjekti.peruste.oppaanKoulutustyypit.length > 0) {
    return _.head(perusteProjekti.peruste.oppaanKoulutustyypit);
  }
}

function koulutustyypit(perusteProjekti) {
  return _.chain(perusteProjekti.peruste.oppaanKoulutustyypit)
    .map(koulutustyyppi => {
      return {
        otsikko: koulutustyyppi,
      };
    })
    .sortBy(item => koulutustyyppiRyhmaSort[themes[item.otsikko]])
    .value();
}
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
