<template>
  <div v-if="store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">
          <span>
            {{ $kaanna(data.tutkinnonOsa.nimi) || $t('nimeton-tutkinnonosa') }}{{ data.laajuus ? ',' : '' }}
          </span>
          <span v-if="data.laajuus">
            {{ data.laajuus }} {{ $t('OSAAMISPISTE') }}
          </span>
        </h2>
      </template>

      <template v-slot:default="{ data, isEditing }">
        <div class="mt-1" v-if="isEditing && isNew">
          <b-form-group :label="$t('tyyppi')">
            <b-form-radio v-model="data.tyyppi" name="tyyppi" value="normaali">
              {{ $t('tutkintokohtainen') }}
            </b-form-radio>
            <b-form-radio v-model="data.tyyppi" name="tyyppi" value="reformi-tutke2">
              {{ $t('yhteinen') }}
            </b-form-radio>
          </b-form-group>
        </div>

        <b-row>
          <b-col md="8">
            <b-form-group :label="$t('tutkinnon-osan-nimi')">
              <ep-input v-model="data.tutkinnonOsa.nimi" :is-editing="isEditing" />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group :label="$t('laajuus')">
              <ep-laajuus-input v-model="data.laajuus" :is-editing="isEditing" />
            </b-form-group>
          </b-col>
        </b-row>

        <div v-if="data.tyyppi === 'normaali'">
          <ep-collapse tyyppi="ammattitaitovaatimukset" :border-bottom="false" :border-top="isEditing">
            <h2 slot="header">{{ $t('ammattitaitovaatimukset') }}</h2>
            <b-form-group>
              <EpAmmattitaitovaatimukset v-model="data.tutkinnonOsa.ammattitaitovaatimukset2019"
                                         :is-editing="isEditing" />
            </b-form-group>
          </ep-collapse>

          <ep-collapse tyyppi="osaamisen-arviointi" :border-bottom="false" :border-top="true">
            <h2 slot="header">{{ $t('osaamisen-arviointi') }}</h2>
            <b-form-group v-if="isEditing">
              <b-form-radio
                v-for="geneerinen in geneeriset"
                v-model="data.tutkinnonOsa._geneerinenArviointiasteikko"
                name="geneerinen"
                :value="'' + geneerinen.id"
                :key="'geneerinen-' + geneerinen.id">
                {{ $kaanna(geneerinen.nimi) }}
              </b-form-radio>
            </b-form-group>
            <b-form-group v-else-if="valittuGeneerinen">
              <h3>{{ $kaanna(valittuGeneerinen.nimi) }}</h3>
              <div class="mt-3 mb-4">
                <div class="font-weight-bold">{{ $t('arvioinnin-kohde') }}</div>
                <div>{{ $kaanna(valittuGeneerinen.kohde) }}</div>
              </div>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th width="20%">{{ $t('osaamistaso') }}</th>
                    <th>{{ $t('kriteerit') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ot, idx) in valittuGeneerinen.osaamistasot" :key="'ot-' + idx">
                    <td>{{ $kaanna(ot.otsikko) }}</td>
                    <td>
                      <ul class="pl-4">
                        <li v-for="(kriteeri, idx) in ot.kriteerit" :key="idx">
                          {{ $kaanna(kriteeri) }}
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-form-group>
          </ep-collapse>

          <ep-collapse tyyppi="ammattitaidon-osoittamistavat" :border-bottom="false" :border-top="true">
            <h2 slot="header">{{ $t('ammattitaidonOsoittamistavat') }}</h2>
            <b-form-group>
              <ep-content v-model="data.tutkinnonOsa.ammattitaidonOsoittamistavat" layout="normal" :is-editable="isEditing"></ep-content>
            </b-form-group>
          </ep-collapse>
        </div>
        <div v-else>
        </div>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TutkinnonOsaEditStore } from '@/stores/TutkinnonOsaEditStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import _ from 'lodash';

interface YhdistettyOsaamistaso {
  otsikko: any;
  kriteerit: any[];
}


interface YhdistettyGeneerinen {
  nimi: any;
  kohde: any;
  osaamistasot: YhdistettyOsaamistaso[],
}


@Component({
  components: {
    EpAmmattitaitovaatimukset,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpInput,
    EpLaajuusInput,
    EpSpinner,
  },
})
export default class RouteTutkinnonosa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private store: EditointiStore | null = null;

  get isNew() {
    return this.tutkinnonOsaId === 'uusi';
  }

  get tov() {
    if (!this.store) {
      return null;
    }
    return this.store.data.value;
  }

  get tutkinnonOsaId() {
    return this.$route.params.tutkinnonOsaId;
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get kaikkiGeneeriset() {
    return this.arviointiStore.geneeriset.value;
  }

  get valittuGeneerinen(): YhdistettyGeneerinen | null {
    if (!this.tov || !this.tov.tutkinnonOsa?._geneerinenArviointiasteikko) {
      return null;
    }

    const geneerinen = _.first(_.filter(this.kaikkiGeneeriset,
      g => g.id === Number(this.tov!.tutkinnonOsa._geneerinenArviointiasteikko)));
    
    if (!geneerinen) {
      return null;
    }

    const asteikko = _.first(_.filter(this.arviointiasteikot,
      g => g.id === Number((geneerinen as any)._arviointiAsteikko)));

    if (!asteikko) {
      return null;
    }

    const kriteeriMap = _.keyBy(geneerinen.osaamistasonKriteerit, '_osaamistaso');

    return {
      nimi: geneerinen.nimi,
      kohde: geneerinen.kohde,
      osaamistasot: _.map(_.reverse(asteikko.osaamistasot), ot => {
        return {
          otsikko: ot.otsikko,
          kriteerit: kriteeriMap[ot.id!]!.kriteerit!,
        };
      }),
    };
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get geneeriset() {
    return _.filter(this.arviointiStore.geneeriset.value, 'julkaistu');
  }

  @Watch('tutkinnonOsaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TutkinnonOsaEditStore(
      this.perusteId!,
        id ? Number(id!)
        : undefined);
    this.store = new EditointiStore(tkstore);
  }
}
</script>

<style lang="scss" scoped>
</style>
