<template>

  <ep-sub-view :header="$t('kasitteet')">
    <ep-spinner v-if="!termit" />
    <div v-else>
      <div class="d-flex justify-content-between">
        <ep-search class="mb-3" v-model="query" :placeholder="$t('etsi')"></ep-search>
        <ep-button variant="outline" @click="avaaMuokkausModal()" icon="add" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">{{ $t('lisaa-kasite') }}</ep-button>
      </div>
      <div class="kasitelista m-3" v-if="termit.length > 0">
        <div class="row align-items-start" :class="{open: !termi.closed}" v-for="(termi, idx) in termitFiltered" :key="idx">
          <div class="col col-3 font-weight-bold pl-3" v-html="$kaanna(termi.termi)" />
          <div class="col col-6 pl-3">
            <ep-content :value="termi.selitys" layout="normal"></ep-content>
          </div>
          <div class="col col-3 text-right toiminnot">
            <button class="btn btn-link" @click="avaaPoistoModal(termi)">
              <EpMaterialIcon>delete</EpMaterialIcon>
            </button>
            <button class="btn btn-link" @click="avaaMuokkausModal(termi)">
              <EpMaterialIcon>edit</EpMaterialIcon>
            </button>
            <button class="btn btn-link" @click="toggleTermi(termi)">
              <EpMaterialIcon v-if="termi.closed">expand_more</EpMaterialIcon>
              <EpMaterialIcon v-else>expand_less</EpMaterialIcon>
            </button>
          </div>
        </div>
      </div>

      <div v-else>{{$t('ei-termeja')}}</div>
    </div>

    <b-modal class="backdrop" id="kasitteenPoistoModal" ref="kasitteenPoistoModal" @ok="poistaKasite" :lazy="true" size="lg">
      <span class="mr-2">{{ $t('haluatko-poistaa-kasitteen') }}</span>
      <template slot="modal-cancel">{{ $t('peruuta') }}</template>
      <template slot="modal-ok">{{ $t('poista') }}</template>
    </b-modal>

    <b-modal class="backdrop" id="kasitteenLuontiModal" ref="kasitteenLuontiModal" @ok="tallennaKasite" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="validation.$invalid" size="lg">
      <template slot="modal-header">
        <div class="row w-100">
          <div class="col">
            <span class="mr-2">{{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}</span>
          </div>
          <div class="col text-right">
            <ep-kielivalinta />
          </div>
        </div>
      </template>

      <ep-form-content name="kasite-termi">
        <ep-input v-model="kasite.termi" type="localized" help="kasite-termi-ohje" :validation="validation.termi" :is-editing="true"></ep-input>
      </ep-form-content>
      <ep-form-content name="kasite-selitys">
        <ep-content v-model="kasite.selitys" help="kasite-selitys-ohje" :validation="validation.selitys" :is-editable="true" layout="normal"></ep-content>
      </ep-form-content>

      <ep-form-content name="alaviitteessa">
        <ep-toggle v-model="kasite.alaviite">{{ $t('nayta-alaviitteessa') }}</ep-toggle>
      </ep-form-content>

      <template slot="modal-cancel">{{ $t('peruuta') }}</template>
      <template slot="modal-ok">{{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}</template>
    </b-modal>
  </ep-sub-view>
</template>

<script lang="ts">
import _ from 'lodash';

import { Component, Prop } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import { Kielet } from '@shared/stores/kieli';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { TermitStore } from '@/stores/TermitStore';
import { TermiDto } from '@shared/api/eperusteet';
import EpSubView from '@shared/components/EpSubView/EpSubView.vue';
import { kasiteValidator } from '@shared/validators/kasite';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { createLogger } from '@shared/utils/logger';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

const logger = createLogger('RouteKasite');

@Component({
  components: {
    EpFormContent,
    EpInput,
    EpSearch,
    EpSpinner,
    EpSubView,
    EpButton,
    EpKielivalinta,
    EpField,
    EpContent,
    EpToggle,
    EpMaterialIcon,
  },
  mixins: [
    validationMixin,
  ],
  validations() {
    return {
      kasite: {
        ...(this as any).validator,
      },
    };
  },
} as any)
export default class RouteKasite extends PerusteprojektiRoute {
  @Prop({ required: true })
  private termitStore!: TermitStore;

  private query = '';
  private kasite: TermiDto = {};
  private toggled: number[] = [];

  async onProjektiChange() {
    if (this.perusteId) {
      this.termitStore.init(this.perusteId);
    }
  }

  get termit() {
    return this.termitStore.termit.value;
  }

  get termitToggled() {
    return _.map(this.termit, termi => {
      return {
        ...termi,
        closed: !_.includes(this.toggled, termi.id),
      };
    });
  }

  get termitFiltered() {
    return _.filter(this.termitToggled, termi => Kielet.search(this.query, termi.termi) || Kielet.search(this.query, termi.selitys));
  }

  toggleTermi(termi) {
    if (_.includes(this.toggled, termi.id)) {
      this.toggled = _.reject(this.toggled, id => id === termi.id);
    }
    else {
      this.toggled = [...this.toggled, termi.id];
    }
  }

  avaaMuokkausModal(kasite?: TermiDto) {
    if (!kasite) {
      this.kasite = {};
    }
    else {
      this.kasite = _.cloneDeep(kasite);
    }
    (this as any).$refs.kasitteenLuontiModal.show();
  }

  avaaPoistoModal(kasite) {
    this.kasite = _.cloneDeep(kasite);
    (this as any).$refs.kasitteenPoistoModal.show();
  }

  async poistaKasite() {
    try {
      await this.termitStore.delete(this.perusteId!, this.kasite);
      this.$success(this.$t('kasite-poistettu') as string);
    }
    catch (err) {
      logger.error(err);
      this.$fail(this.$t('kasite-poisto-epaonnistui') as string);
    }
  }

  async tallennaKasite() {
    try {
      await this.termitStore.save(this.perusteId!, this.kasite);
      this.$success(this.$t('kasite-tallennettu') as string);
    }
    catch (err) {
      logger.error(err);
      this.$fail(this.$t('kasite-tallennus-epaonnistui') as string);
    }
  }

  get validator() {
    return kasiteValidator([
      Kielet.getSisaltoKieli.value,
    ]);
  }

  get validation() {
    return (this as any).$v.kasite;
  }
}

</script>
<style scoped lang="scss">
@import '@shared/styles/_variables';

  .kasitelista {
    .row:nth-child(odd) {
      background-color: $table-odd-row-bg-color;
    }

    .row{

      .col:not(.toiminnot) {
        padding-top: 10px;
        padding-bottom: 10px;
      }

      /deep/ p {
        margin: 0;
      }

      .btn {
        color: $black;
      }
    }

    .row:not(.open) {
      min-width: auto;
      overflow: hidden;

      height: 2.5em;
      white-space: nowrap;
      text-overflow: ellipsis;

      /deep/ p {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        height: 2.5em;
      }

    }
  }

</style>
