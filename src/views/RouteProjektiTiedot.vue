<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('projektin-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <h3>{{ $t('perustiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('projektin-nimi') + '*'">
                <ep-input v-model="data.nimi"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.nimi"></ep-input>
              </b-form-group>
            </b-col>
            <b-col lg="6">
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('perustetyoryhma')">
                <perustetyoryhma-select v-model="data.ryhmaOid"
                                        :ulkopuoliset-store="ulkopuolisetStore"
                                        :is-editing="isEditing" />
                <ep-button v-if="isEditing"
                           class="btn-tyhjenna"
                           variant="link"
                           :paddingx="false"
                           :disabled="!data.ryhmaOid"
                           @click="data.ryhmaOid = null">{{ $t('tyhjenna-valinta') }}</ep-button>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('yhteyshenkilo')">
                <ep-input v-model="data.yhteistyotaho"
                          type="string"
                          :is-editing="isEditing"
                          :validation="validation.yhteistyotaho"></ep-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('kuvaus')">
                <div v-if="isEditing">
                  <div class="text-muted mb-3">
                    {{ $t('perusteprojekti-ohje-kuvaus') }}
                  </div>
                  <b-form-radio-group stacked v-model="data.projektiKuvaus" class="mb-3">
                    <b-form-radio :value="kuvaus.korjaus">{{ $t('perusteen-korjaus') }}</b-form-radio>
                    <b-form-radio :value="kuvaus.uudistus">{{ $t('perusteen-uudistus') }}</b-form-radio>
                  </b-form-radio-group>
                </div>
                <div v-else-if="data.projektiKuvaus === kuvaus.korjaus">
                  {{ $t('perusteen-korjaus') }}
                </div>
                <div v-else-if="data.projektiKuvaus === kuvaus.uudistus">
                  {{ $t('perusteen-uudistus') }}
                </div>
                <ep-content v-model="data.kuvaus" layout="normal" :is-editable="isEditing" :kasiteHandler="kasiteHandler" :kuvaHandler="kuvaHandler"></ep-content>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
        <h3>{{ $t('esikatselu-ja-lataus') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col lg="6" :class="{'disabled-events': data.tila === 'poistettu'}">
              <ep-toggle v-model="data.esikatseltavissa" :is-editing="isEditing" v-if="isEditing || !data.esikatseltavissa">
                {{$t('salli-perusteen-esikatselu')}}
              </ep-toggle>
              <ep-external-link :url="data.esikatseluUrl" v-if="!isEditing && data.esikatseltavissa">
                {{$t('esikatsele-perustetta')}}
              </ep-external-link>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('perusteen-lataus')" v-if="!isEditing">
                <ep-button variant="primary" micon="description" @click="exportPeruste">{{ $t('lataa-peruste-json') }}</ep-button>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { PerusteprojektiEditStore } from '@/stores/PerusteprojektiEditStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import PerustetyoryhmaSelect from './PerustetyoryhmaSelect.vue';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { TermitStore } from '@/stores/TermitStore';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { Maintenance, PerusteprojektiLuontiKuvausEnum } from '@shared/api/eperusteet';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpToggle,
    PerustetyoryhmaSelect,
    EpExternalLink,
  },
})
export default class RouteProjektiTiedot extends PerusteprojektiRoute {
  @Prop({ required: true })
  ulkopuolisetStore!: UlkopuolisetStore;

  private store: EditointiStore | null = null;

  async onProjektiChange(projektiId: number) {
    this.store = new EditointiStore(new PerusteprojektiEditStore(projektiId, this.perusteStore));
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }

  get kuvaus() {
    return {
      uudistus: PerusteprojektiLuontiKuvausEnum.UUDISTUS,
      korjaus: PerusteprojektiLuontiKuvausEnum.KORJAUS,
    };
  }

  async exportPeruste() {
    const peruste = JSON.stringify((await Maintenance.viePerusteJson(this.perusteId!)).data);
    const blob = new Blob([peruste as any], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'peruste';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
</script>

<style lang="scss" scoped>
/deep/ .form-group {
  padding-right: 30px !important;
}

.btn-tyhjenna {
  float: right;
}
</style>
