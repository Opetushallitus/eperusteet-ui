<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="perusteOppaatStore"
                              :edit-route="'opas'"
                              :new-route="{ name: 'opasLuonti' }"
                              :show-cards="false"
                              :fieldKeys="['nimi','koulutustyyppi','tila','luotu', 'globalVersion.aikaleima']"
                              :filters="['koulutustyyppi', 'peruste', 'tila']">
      <template v-slot:lowerheader>
        <div class="d-flex">
          <h2 class="pt-2 flex-grow-1">{{ $t('oppaat') }}</h2>
          <router-link :to="{ name: 'opasLuonti' }">
            <ep-button class="m-0 p-0" variant="outline" icon="plus">{{$t('lisaa-opas')}}</ep-button>
          </router-link>
        </div>
      </template>
      <template slot="nimiotsikko">
        {{$t('oppaan-nimi')}}
      </template>
      <template slot="koulutustyyppisarake" slot-scope="{ perusteProjekti }">
        <span class="text-nowrap koulutustyypit" v-if="ensimmainenKoulutustyyppi(perusteProjekti)">
          <EpColorIndicator :size="10" :kind="ensimmainenKoulutustyyppi(perusteProjekti)" />
          <span class="ml-1">
            {{ $t(ensimmainenKoulutustyyppi(perusteProjekti)) }}
          </span>
          <span :id="'koulutustyypit'+perusteProjekti.id" class="lukumaara" v-if="koulutustyypit(perusteProjekti) && koulutustyypit(perusteProjekti).length > 1">
            +{{koulutustyypit(perusteProjekti).length -1}}
            <b-popover
              triggers="hover click focus"
              :target="'koulutustyypit'+perusteProjekti.id"
              placement="bottomright">
              <h3>{{$t('koulutustyypit')}}</h3>
              <ep-julki-lista :tiedot="koulutustyypit(perusteProjekti)" listausTyyppi="sivutus" tietoMaara="5">
                <template slot="otsikko" slot-scope="{ item }">
                  <EpColorIndicator :size="10" :kind="item.otsikko" />
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

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import * as _ from 'lodash';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import { Kielet } from '@shared/stores/kieli';
import { koulutustyyppiRyhmaSort, themes } from '@shared/utils/perusteet';
import { Perusteet, PerusteHakuInternalDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpPerusteprojektiListaus,
    EpColorIndicator,
    EpJulkiLista,
    EpButton,
  },
})
export default class RouteOppaat extends Vue {
  @Prop({ required: true })
  perusteOppaatStore!: PerusteetStore;

  ensimmainenKoulutustyyppi(perusteProjekti) {
    if (perusteProjekti.peruste.oppaanKoulutustyypit && perusteProjekti.peruste.oppaanKoulutustyypit.length > 0) {
      return _.head(perusteProjekti.peruste.oppaanKoulutustyypit);
    }
  }

  koulutustyypit(perusteProjekti) {
    return _.chain(perusteProjekti.peruste.oppaanKoulutustyypit)
      .map(koulutustyyppi => {
        return {
          otsikko: koulutustyyppi,
        };
      })
      .sortBy(item => koulutustyyppiRyhmaSort[themes[item.otsikko]])
      .value();
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
