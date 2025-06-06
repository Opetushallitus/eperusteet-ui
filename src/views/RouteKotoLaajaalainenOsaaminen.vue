<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore" :versionumero="versionumero">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimi" >{{ $kaanna(data.nimi) }}</h2>
      <h2 class="m-0" v-else >{{ $t('nimeton-opinto') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">

      <b-row v-if="isEditing" class="mb-4">
        <b-col lg="8">
          <b-form-group :label="$t('otsikko') + (isEditing ? ' *' : '')" required>
            <ep-input v-model="data.nimi" :is-editing="isEditing">
            </ep-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col lg="8">
          <b-form-group required>
            <template v-if="isEditing" #label>
              <div>{{$t('kappaleen-teksti')}}</div>
            </template>
            <ep-content v-model="data.yleiskuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="data.osaamisAlueet.length > 0" class="mt-4">
        <b-col lg="8">
          <div v-for="(osaamisalue, index) in data.osaamisAlueet"
               :key="index+'kotoLaajaAlainenOsaaminen'">
            <div class="mt-4">
                <span>
                  <h3 class="d-inline">{{ $kaanna(osaamisalue.koodi.nimi) }}</h3>
                  <b-button variant="link"
                            @click.stop="removeLaajaAlainenOsaaminen(index, osaamisalue.koodi.arvo)"
                            v-if="isEditing">
                    <EpMaterialIcon>delete</EpMaterialIcon>
                    {{ $t('poista') }}
                  </b-button>
                </span>
            </div>
            <ep-content
              layout="normal"
              v-model="osaamisalue.kuvaus"
              :is-editable="isEditing"></ep-content>
          </div>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col lg="8">
          <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alainen-osaaminen')" variant="primary" class="mb-4">
            <b-dropdown-item-button
              v-for="(laajaAlainenKoodi, index) in laajaAlaisetKoodit"
              @click="addLaajaAlainenOsaaminen(laajaAlainenKoodi)"
              :key="index+'addlaaja'"
              :disabled="laajaAlainenKoodi.isAlreadySelected">
              {{ laajaAlainenKoodi.arvo + '. ' + $kaanna(laajaAlainenKoodi.nimi) }}
            </b-dropdown-item-button>
          </b-dropdown>
        </b-col>
      </b-row>

    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { KotoLaajaalainenOsaaminenStore } from '@/stores/Koto/KotoLaajaalainenOsaaminenStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { Koodisto } from '@shared/api/eperusteet';
import * as _ from 'lodash';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

interface LaajaaAlainenOsaaminenKoodi {
  nimi: { [locale: string]: string };
  arvo: string;
  uri: string;
  koodisto: string;
  isAlreadySelected: boolean
}

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpInput,
    EpMaterialIcon,
  },
})
export default class RouteKotoLaajaalainenOsaaminen extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private editointiStore: EditointiStore | null = null;
  private laajaAlaisetKoodit: LaajaaAlainenOsaaminenKoodi[] = [];

  async mounted() {
    try {
      const koodit = (await Koodisto.kaikki(
        'laajaalainenosaaminenkoto2022')).data;

      this.laajaAlaisetKoodit = koodit
        .sort(x => parseInt(x.koodiArvo!))
        .reverse()
        .map(koodi => ({
          uri: koodi.koodiUri!,
          arvo: koodi.koodiArvo!,
          koodisto: koodi.koodisto!.koodistoUri!,
          nimi: this.extractNimi(koodi),
          isAlreadySelected: false,
        }));
    }
    catch (err) {
      console.error(err);
    }
  }

  @Watch('kotoLaajaalainenOsaaminenId', { immediate: true })
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

  public async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const kotoStore = new KotoLaajaalainenOsaaminenStore(this.perusteId!, Number(this.kotoLaajaalainenOsaaminenId), this.versionumero);
    this.editointiStore = new EditointiStore(kotoStore);
  }

  private extractNimi(koodi) {
    const nimet: { [locale: string]: string } = {};

    koodi.metadata!.forEach(meta => {
      nimet[meta.kieli!.toLowerCase()] = meta.nimi;
    });

    return nimet;
  }

  private addLaajaAlainenOsaaminen(laajaAlainenKoodi) {
    this.setKoodiSelected(laajaAlainenKoodi.arvo);
    this.editointiStore!.data.value.osaamisAlueet.push({ koodi: laajaAlainenKoodi });
  }

  private setKoodiSelected(koodiarvo) {
    let selectedOsaaminen = this.laajaAlaisetKoodit.find(koodi => koodi.arvo === koodiarvo);
    if (selectedOsaaminen) {
      selectedOsaaminen.isAlreadySelected = true;
    }
  }

  private async removeLaajaAlainenOsaaminen(index, koodiarvo) {
    if (await this.$vahvista(this.$t('vahvista-poisto') as string, this.$t('poista-koto-laaja-alainen-osaamisalue') as string)) {
      this.editointiStore!.data.value.osaamisAlueet.splice(index, 1);
      this.setKoodiNotSelected(koodiarvo);
    }
  }

  private setKoodiNotSelected(koodiarvo) {
    let selectedOsaaminen = this.laajaAlaisetKoodit.find(koodi => koodi.arvo === koodiarvo);
    if (selectedOsaaminen) {
      selectedOsaaminen.isAlreadySelected = false;
    }
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get kotoLaajaalainenOsaaminenId() {
    return this.$route.params.kotoLaajaalainenOsaaminenId;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }
}

</script>
