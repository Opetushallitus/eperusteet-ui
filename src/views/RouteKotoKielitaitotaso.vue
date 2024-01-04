<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
      <h2 class="m-0" v-else >{{ $t('nimeton-kielitaitotaso') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-koodisto-select :store="tavoitesisaltoalueotsikkoKoodisto" v-model="data.nimiKoodi" :is-editing="isEditing" :naytaArvo="false">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    disabled></b-form-input>
                  <b-input-group-append>
                    <b-button @click="open" variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
            </ep-koodisto-select>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <div v-if="isEditing" slot="label">{{$t('kuvaus')}}</div>
            <ep-content v-model="data.kuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>

          <EpKotoTaitotasot
            class="mt-4"
            v-model="data.taitotasot"
            :isEditing="isEditing"
            :kasiteHandler="kasiteHandler"
            :kuvaHandler="kuvaHandler"
            taitotasoTyyppi="kielitaitotaso"/>

        </b-col>
      </b-row>

    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import * as _ from 'lodash';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KotoKielitaitotasoStore } from '@/stores/Koto/KotoKielitaitotasoStore';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import { Murupolku } from '@shared/stores/murupolku';

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpKoodistoSelect,
    EpKotoTaitotasot,
  },
})
export default class RouteTavoitesisaltoalue extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;

  @Watch('kotokielitaitotasoId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }
    await this.fetch();
  }

  @Watch('kotoSisalto')
  onDataChange(kotoSisalto) {
    if (kotoSisalto) {
      Murupolku.aseta('koto_kielitaitotaso', kotoSisalto.nimiKoodi ? this.$kaanna(kotoSisalto.nimiKoodi.nimi) : this.$t('nimeton-kielitaitotaso'), {
        name: 'koto_kielitaitotaso',
      });
    }
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  public async fetch() {
    const tkstore = new KotoKielitaitotasoStore(this.perusteId!, Number(this.kotokielitaitotasoId), this.versionumero);
    this.store = new EditointiStore(tkstore);
  }

  private readonly tavoitesisaltoalueotsikkoKoodisto = new KoodistoSelectStore({
    koodisto: 'tavoitesisaltoalueenotsikko',
    async query(query: string, sivu = 0, koodisto: string) {
      const { data } = (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      }));
      return data as any;
    },
  });

  get kotoSisalto() {
    return this.store?.data?.value || null;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kotokielitaitotasoId() {
    return this.$route.params.kotokielitaitotasoId;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep fieldset {
    padding-right: 0;
  }

  ::v-deep .input-wrapper {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>
