<template>
  <div>
    <div v-if="store">
      <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">
          <span>
            {{ $kaanna(data.nimi) || $t('nimeton-osaalue') }}{{ data.laajuus ? ',' : '' }}
          </span>
          <span v-if="data.laajuus">
            {{ data.laajuus }} {{ $t('OSAAMISPISTE') }}
          </span>
        </h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">
        <EpSpinner v-if="!data" />
        <div v-else>
          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('osaalue-nimi')">
                <ep-input v-model="data.nimi"
                          :is-editing="isEditing"
                          :validation="validation.nimi" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group :label="$t('koodi')">
                <ep-koodisto-select :store="koodisto"
                  v-model="data.koodi">
                  <template #default="{ open }">
                    <b-input-group>
                      <b-form-input
                        :value="data.koodi ? ($kaanna(data.koodi.nimi) + ' (' + data.koodi.arvo + ')') : ''"
                        disabled></b-form-input>
                      <b-input-group-append>
                        <b-button @click="open" icon="plus" variant="primary">
                          {{ $t('hae-koodistosta') }}
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                  </template>
                </ep-koodisto-select>
              </b-form-group>
            </b-col>
          </b-row>
        </div>

        <ep-collapse tyyppi="pakolliset-osaamistavoitteet" :border-bottom="false" :border-top="true">
          <h3 slot="header">{{ $t('pakolliset-osaamistavoitteet') }}</h3>
          <Osaamistavoite v-model="data.pakollisetOsaamistavoitteet"
                          :arviointi-store="arviointiStore"
                          :validation="validation.osaamistavoitteet && validation.osaamistavoitteet[0]"
                          :is-editing="isEditing">
          </Osaamistavoite>
        </ep-collapse>

        <ep-collapse tyyppi="valinnaiset-osaamistavoitteet" :border-bottom="false" :border-top="true">
          <h3 slot="header">{{ $t('valinnaiset-osaamistavoitteet') }}</h3>
          <Osaamistavoite v-model="data.valinnaisetOsaamistavoitteet"
                          :arviointi-store="arviointiStore"
                          :validation="validation.osaamistavoitteet && validation.osaamistavoitteet[1]"
                          :is-editing="isEditing">
          </Osaamistavoite>
        </ep-collapse>

        <ep-collapse tyyppi="arviointi" :border-bottom="false" :border-top="true">
          <h3 slot="header">{{ $t('arviointi') }}</h3>
          <EpGeneerinenAsteikko v-if="data"
                                v-model="data.arviointi.id"
                                :arviointi-store="arviointiStore"
                                :is-editing="isEditing" />
        </ep-collapse>

        <pre>{{ data }}</pre>

      </template>
      </EpEditointi>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodisto } from '@shared/api/eperusteet';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import Osaamistavoite from './Osaamistavoite.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import EpGeneerinenAsteikko from '@/components/EpGeneerinenAsteikko/EpGeneerinenAsteikko.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { OsaalueStore } from '@/stores/OsaalueStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { PerusteprojektiRoute } from '../PerusteprojektiRoute';

import _ from 'lodash';

@Component({
  components: {
    EpAmmattitaitovaatimukset,
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpGeneerinenAsteikko,
    EpInput,
    EpKoodistoSelect,
    EpLaajuusInput,
    EpSpinner,
    Osaamistavoite,
  },
})
export default class RouteTutkinnonOsanOsaalue extends PerusteprojektiRoute {
  @Prop({ required: true })
  private arviointiStore!: ArviointiStore;

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

  get osaalueId() {
    return this.$route.params.osaalueId;
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get kaikkiGeneeriset() {
    return this.arviointiStore.geneeriset.value;
  }

  protected async onProjektiChange() {
  }

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('ammatillisenoppiaineet', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  @Watch('this.$route.path', { immediate: true })
  async onParamChange() {
    if (!this.tutkinnonOsaId || !this.osaalueId) {
      return;
    }

    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
    await this.perusteStore.blockUntilInitialized();
    const store = new OsaalueStore(
      Number(this.tutkinnonOsaId),
      this.osaalueId,
      this.$router);
    this.store = new EditointiStore(store);
  }

}
</script>

<style lang="scss" scoped>
</style>
