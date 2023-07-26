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
            <b-col md="5">
              <b-form-group :label="$t('osaalue-nimi') + (isEditing ? ' *' : '')">
                <ep-input v-model="data.nimi"
                          :is-editing="isEditing"
                          :validation="validation.nimi" />
              </b-form-group>
            </b-col>

            <b-col md="4">
              <b-form-group :label="$t('koodi') + (isEditing ? ' *' : '')">
                <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing">
                  <template slot="koodisto">
                    ({{ koodistoAmmatillisetoppiaineet }})
                  </template>
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

            <b-col md="3">
              <b-form-group :label="$t('osa-alue-kieli')">
                <ep-koodisto-select :store="kielikoodisto" v-model="data.kielikoodi" :is-editing="isEditing">
                  <template slot="koodisto">
                    ({{ koodistoKielet }})
                  </template>
                  <template #default="{ open }">
                    <b-input-group>
                      <b-form-input
                        :value="data.kielikoodi ? ($kaanna(data.kielikoodi.nimi) + ' (' + data.kielikoodi.arvo + ')') : ''"
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
                          :is-valinnainen="false"
                          :is-editing="isEditing">
          </Osaamistavoite>
        </ep-collapse>

        <ep-collapse tyyppi="valinnaiset-osaamistavoitteet" :border-bottom="false" :border-top="true" v-if="isEditing || data.valinnaisetOsaamistavoitteet">
          <h3 slot="header">{{ $t('valinnaiset-osaamistavoitteet') }}</h3>

          <div v-if="isEditing" class="mb-3">
            <ep-button @click="poistaValinnaisetOsaamistavoitteet()" variant="link" icon="roskalaatikko" v-if="data.valinnaisetOsaamistavoitteet">
              {{ $t('poista-valinnaiset-osaamistavoitteet') }}
            </ep-button>

            <ep-button @click="lisaaValinnaisetOsaamistavoitteet()" variant="outline" icon="plus" v-else>
              {{ $t('lisaa-valinnaiset-osaamistavoitteet') }}
            </ep-button>
          </div>

          <Osaamistavoite v-model="data.valinnaisetOsaamistavoitteet"
                          v-if="data.valinnaisetOsaamistavoitteet"
                          :is-valinnainen="true"
                          :is-editing="isEditing">
          </Osaamistavoite>
        </ep-collapse>

        <ep-collapse tyyppi="arviointi" :border-bottom="false" :border-top="true">
          <h3 slot="header">{{ $t('arviointi') + (isEditing ? ' *' : '')}} </h3>
          <EpGeneerinenAsteikko v-model="arviointi"
                                :arviointi-store="arviointiStore"
                                :is-editing="isEditing" />
        </ep-collapse>

      </template>
      </EpEditointi>
    </div>
    <EpSpinner v-else />
  </div>
</template>

<script lang="ts">
import { Prop, Component } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodisto } from '@shared/api/eperusteet';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import Osaamistavoite from '@shared/components/EpOsaamistavoite/Osaamistavoite.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import EpGeneerinenAsteikko from '@/components/EpGeneerinenAsteikko/EpGeneerinenAsteikko.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OsaalueStore } from '@/stores/OsaalueStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { PerusteprojektiRoute } from '../PerusteprojektiRoute';
import { findDeep } from 'deepdash-es/standalone';

import _ from 'lodash';
import { UiKielet } from '@shared/stores/kieli';
import { Koodistot } from '@shared/utils/koodi';

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
    EpToggle,
    Osaamistavoite,
    EpSelect,
  },
  watch: {
    'osaalueId': {
      handler: 'onOsaAlueChange',
      immediate: true,
    } as any,
  },
})
export default class RouteTutkinnonOsanOsaalue extends PerusteprojektiRoute {
  @Prop({ required: true })
  private arviointiStore!: ArviointiStore;

  private store: EditointiStore | null = null;

  private koodistoAmmatillisetoppiaineet: string = Koodistot.AMMATILLISENOPPIAINEET;
  private koodistoKielet: string = Koodistot.KIELIVALIKOIMA;

  get isNew() {
    return this.osaalueId === 'uusi';
  }

  get tov() {
    if (!this.store) {
      return null;
    }
    return this.store.data.value;
  }

  set arviointi(id) {
    this.store?.setData({
      ...this.store?.data.value,
      arviointi: { id },
    });
  }

  get arviointi() {
    return this.store?.data.value.arviointi?.id || null;
  }

  get osaalueId() {
    return this.$route?.params?.osaalueId || null;
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get kaikkiGeneeriset() {
    return this.arviointiStore.geneeriset.value;
  }

  get navigation() {
    return this.perusteStore.navigation.value;
  }

  get osaalueNavigationNode() {
    return _.get(findDeep(this.perusteStore.navigation.value, (value, key) => {
      if (_.keys(this.osaalueIdObject)[0] === key && _.values(this.osaalueIdObject)[0] === value) return true;
      return false;
    }), 'parent');
  }

  get tutkinnonOsaId() {
    return _.get(this.osaalueNavigationNode, 'meta.tutkinnonOsaViite') || this.$route.query.tutkinnonOsaId;
  }

  get osaalueIdObject() {
    return { id: _.toNumber(this.osaalueId) };
  }

  protected async onProjektiChange() {
  }

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna(Koodistot.AMMATILLISENOPPIAINEET, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  private readonly kielikoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna(Koodistot.KIELIVALIKOIMA, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  async onOsaAlueChange() {
    if (!this.tutkinnonOsaId || !this.osaalueId) {
      return;
    }

    this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
    await this.perusteStore.blockUntilInitialized();
    const store = new OsaalueStore(
      Number(this.perusteId),
      Number(this.tutkinnonOsaId),
      this.osaalueId,
      this.$router);
    this.store = new EditointiStore(store);
  }

  get kielet() {
    return UiKielet;
  }

  poistaValinnaisetOsaamistavoitteet() {
    this.store!.setData({
      ...this.store!.data.value,
      valinnaisetOsaamistavoitteet: null,
    });
  }

  lisaaValinnaisetOsaamistavoitteet() {
    this.store!.setData({
      ...this.store!.data.value,
      valinnaisetOsaamistavoitteet: {},
    });
  }
}
</script>

<style lang="scss" scoped>

  .kieli-select {
    width: 300px;
  }
</style>
