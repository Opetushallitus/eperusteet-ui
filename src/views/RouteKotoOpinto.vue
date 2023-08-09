<template>
  <EpEditointi v-if="store" :store="store" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimiKoodi" >{{ $kaanna(data.nimiKoodi.nimi) }}</h2>
      <h2 class="m-0" v-else >{{ $t('nimeton-opinto') }}</h2>
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
            taitotasoTyyppi="opintokokonaisuus"/>
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
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import { Murupolku } from '@shared/stores/murupolku';
import * as _ from 'lodash';

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpKoodistoSelect,
    EpKotoTaitotasot,
  },
})
export default class RouteKotoOpinto extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;

  @Watch('kotoOpintoId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }
    await this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  @Watch('kotoSisalto')
  onDataChange(kotoSisalto) {
    if (kotoSisalto) {
      Murupolku.aseta('koto_opinto', kotoSisalto.nimiKoodi ? this.$kaanna(kotoSisalto.nimiKoodi.nimi) : this.$t('nimeton-opinto'), {
        name: 'koto_opinto',
      });
    }
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new KotoOpintoStore(this.perusteId!, Number(this.kotoOpintoId), this.versionumero);
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

  get kotoOpintoId() {
    return this.$route.params.kotoOpintoId;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get kotoSisalto() {
    return this.store?.data?.value || null;
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
