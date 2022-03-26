<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore">
    <template v-slot:header="{ data }">
      <h2 class="m-0" v-if="data.nimi" >{{ $kaanna(data.nimi) }}</h2>
      <h2 class="m-0" v-else >{{ $t('nimeton-opinto') }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, validation }">

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
            <div v-if="isEditing" slot="label">{{$t('kappaleen-teksti')}}</div>
            <ep-content v-model="data.yleiskuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                        :kasiteHandler="kasiteHandler"
                        :kuvaHandler="kuvaHandler"></ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col lg="8">
          <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alainen-osaaminen')" variant="primary" class="mb-4">
            <b-dropdown-item-button
              v-for="(laajaAlainenKoodi, index) in laajaAlaisetKoodit"
              @click="addLaajaAlainenOsaaminen(laajaAlainenKoodi)"
              :key="index+'addlaaja'"
              :disabled="laajaAlainenKoodi.hasPaikallinenKuvaus">
              {{ $kaanna(laajaAlainenKoodi.nimi) }}
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

@Component({
  components: {
    EpEditointi,
    EpSpinner,
    EpContent,
    EpInput,
  },
})
export default class RouteKotoLaajaalainenOsaaminen extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  kotoLaajaalainenOsaaminenId!: number;

  private editointiStore: EditointiStore | null = null;
  private laajaAlaisetKoodit;

  async mounted() {
    try {
      const koodit = (await Koodisto.kaikki(
        'laajaalainenosaaminenkoto2022')).data;

      this.laajaAlaisetKoodit = koodit
        .sort(x => parseInt(x.koodiArvo!))
        .reverse()
        .map(koodi => ({
          koodi: koodi.koodiArvo,
          nimi: this.extractNimi(koodi),
        }));
      debugger;
    }
    catch (err) {
      console.error(err);
    }
  }

  private extractNimi(koodi) {
    const nimet: { [locale: string]: string } = {};

    koodi.metadata!.forEach(meta => {
      nimet[meta.kieli!.toLowerCase()] = meta.nimi;
    });

    return nimet;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('kotoLaajaalainenOsaaminenId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const kotoStore = new KotoLaajaalainenOsaaminenStore(this.perusteId!, Number(id));
    this.editointiStore = new EditointiStore(kotoStore);
  }

  addLaajaAlainenOsaaminen(laajaAlainenKoodi) {
    // TODO
    debugger;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }
}

</script>
