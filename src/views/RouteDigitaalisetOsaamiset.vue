<template>
  <EpMainView container>
    <EpPerusteprojektiListaus :provider="digitaalisetOsaamisetStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'digitaalinenOsaaminenLuonti' }"
                              :showCards="true"
                              :vain-kortit="true">
      <div slot="upperheader">
        <div class="d-flex justify-content-between">
          <h2>{{ $t('digitaalinen-osaaminen') }}</h2>
          <div>
            <EpArkistoidutModal v-if="arkistoidut && arkistoidut.length > 0"
              :arkistoidut="arkistoidut"
              @restore="onRestore">
              <span slot="title">{{ $t('arkistoidut-projektit') }}</span>
              <template v-slot:palauta="{ data }">
                <EpButton
                  slot="palauta"
                  variant="link"
                  icon="keyboard_return"
                  @click="onRestore(data.item)"
                  v-if="palautusoikeus(data.item)">
                  {{ $t('palauta') }}
                </EpButton>
              </template>
            </EpArkistoidutModal>

          </div>
        </div>
        <div>{{$t('digitaalinen-osaaminen-listaus-selite')}}</div>
      </div>
      <h2 slot="unpublished-header">{{ $t('keskeneraiset-projektit') }}</h2>
      <h2 slot="published-header">{{ $t('julkaistut-projektit') }}</h2>
      <div slot="cardsEmpty" />
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import EpArkistoidutModal from '@shared/components/EpArkistoidutModal/EpArkistoidutModal.vue';
import { vaihdaPerusteTilaConfirm } from '@/utils/arkistointi';
import { DigitaalisetOsaamisetStore } from '@/stores/DigitaalisetOsaamisetStore';

@Component({
  components: {
    EpMainView,
    EpPerusteprojektiListaus,
    EpColorIndicator,
    EpJulkiLista,
    EpButton,
    EpArkistoidutModal,
  },
})
export default class RouteDigitaalisetOsaamiset extends Vue {
  @Prop({ required: true })
  digitaalisetOsaamisetStore!: DigitaalisetOsaamisetStore;

  async mounted() {
    this.digitaalisetOsaamisetStore.clear();
    await this.haePoistetut();
  }

  async haePoistetut() {
    await this.digitaalisetOsaamisetStore.updateQuery({
      sivu: 0,
      sivukoko: 100,
      tila: ['POISTETTU'],
      jarjestysOrder: false,
      jarjestysTapa: 'nimi',
    });
  }

  get arkistoidut() {
    if (this.digitaalisetOsaamisetStore.projects.value) {
      return _.map(this.digitaalisetOsaamisetStore.projects.value?.data, (perusteprojekti: any) => {
        return {
          ...perusteprojekti,
          muokattu: perusteprojekti.peruste.muokattu,
        };
      });
    }
  }

  palautusoikeus(perusteprojekti) {
    return _.includes(perusteprojekti.oikeudet.perusteprojekti, 'tilanvaihto');
  }

  async onRestore(perusteprojekti) {
    await vaihdaPerusteTilaConfirm(
      this,
      {
        title: 'palauta-peruste',
        confirm: 'palauta-peruste-vahvistus',
        tila: 'laadinta',
        projektiId: perusteprojekti.id,
      },
    );
    await this.haePoistetut();
    await this.digitaalisetOsaamisetStore.updateOwnProjects();
  }
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
