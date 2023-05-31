<template>
  <EpEditointi :store="store">
    <template #header>
      <h3>{{$t('laaja-alaisen-osaamisen-osa-alueet')}}</h3>
    </template>
    <template #default="{ data, isEditing }">
      <b-row>
        <b-col cols="11">
          <EpDraggableCollapse v-model="data.laajaAlaisetOsaamiset" :isEditing="isEditing">
            <template #header="{data}" v-if="!isEditing">
              <h4 class="ml-3 mt-3" v-if="data.koodi">{{$kaanna(data.koodi.nimi)}}</h4>
            </template>

            <template #default="{data}">
              <div class="row">
                <div class="col-10" v-if="isEditing">
                  <b-form-group :label="$t('laaja-alaisen-osaamisen-otsikko')">
                    <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
                      <template #default="{ open }">
                        <b-input-group>
                          <b-form-input
                            :value="data.koodi ? $kaanna(data.koodi.nimi) : ''"
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

                </div>
                <div class="col-2">
                  <b-form-group :label="$t('koodi')" v-if="data.koodi && data.koodi.arvo">
                    {{data.koodi.arvo}}
                  </b-form-group>
                </div>
              </div>

              <b-form-group>
                <template #label v-if="isEditing">
                  <div class="mt-4">
                    {{$t('kuvaus')}}
                  </div>
                </template>
                <ep-content v-model="data.kuvaus"
                      layout="normal"
                      :is-editable="isEditing"
                      :kasiteHandler="kasiteHandler"/>
              </b-form-group>

              <div v-if="isEditing" class="d-flex justify-content-end">
                <ep-button variant="link" icon="roskalaatikko" @click="poistaLaajaAlainenOsaaminen(data)">
                  {{ $t('poista-laaja-alainen') }}
                </ep-button>
              </div>
            </template>

          </EpDraggableCollapse>

          <ep-button @click="lisaaLaajaAlainenOsaaminen()" variant="outline" icon="plus" v-if="isEditing" class="ml-3 mt-3">
            {{ $t('uusi-laaja-alainen') }}
          </ep-button>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>

</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { LukioLaajaAlaisetOsaamisetStore } from '@/stores/LukioLaajaAlaisetOsaamisetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpDraggableCollapse from '@shared/components/EpDraggableCollapse/EpDraggableCollapse.vue';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpEditointi,
    EpContent,
    EpKoodistoSelect,
    EpDraggableCollapse,
  },
})
export default class RouteLaajaAlaisetOsaamiset extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: EditointiStore | null = null;

  async mounted() {
    const store = new LukioLaajaAlaisetOsaamisetStore(this.perusteId!);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('laajaalainenosaaminenlops2021', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  lisaaLaajaAlainenOsaaminen() {
    this.store?.setData({
      ...this.store.data.value,
      laajaAlaisetOsaamiset: [
        ...this.store.data.value!.laajaAlaisetOsaamiset,
        {},
      ],
    });
  }

  poistaLaajaAlainenOsaaminen(poistettavaLao) {
    this.store?.setData({
      ...this.store.data.value,
      laajaAlaisetOsaamiset: _.filter(this.laajaAlaisetOsaamiset, lao => lao !== poistettavaLao),
    });
  }

  get laajaAlaisetOsaamiset() {
    return this.store?.data.value.laajaAlaisetOsaamiset;
  }

  get isEditing() {
    return this.store?.isEditing.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
