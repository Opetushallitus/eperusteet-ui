<template>
  <div class="mt-5">
    <div class="d-flex align-items-sm-center justify-content-sm-between flex-sm-row flex-column mb-1">
      <div class="d-flex">
        <h2 class="m-0">{{ $t('arviointiasteikot') }}</h2>
        <EpInfoPopover class="ml-3">{{ $t('arviointiasteikot-muokkaus-huomio-teksti') }}</EpInfoPopover>
      </div>
      <div class="mt-sm-0 mt-3">
        <div>
          <ep-button
            v-if="!isEditing"
            variant="link"
            icon="edit"
            @click="toggleEdit()"
            class="mt-sm-0 mt-3"
            v-oikeustarkastelu="{oikeus:'hallinta'}">
            {{ $t('muokkaa') }}
          </ep-button>
          <ep-button
            v-if="!isEditing"
            variant="link"
            icon="add"
            @click="lisaaArviointiasteikko()"
            class="mt-sm-0 mt-3"
            v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}">
            {{ $t('lisaa-uusi') }}
          </ep-button>
        </div>
        <div>
          <ep-button
            v-if="isEditing"
            variant="link"
            @click="toggleEdit()">
          {{ $t('peruuta') }}
          </ep-button>
          <ep-button
            v-if="isEditing"
            class="ml-2"
            variant="primary"
            @click="saveArviointiAsteikko()"
            :show-spinner="isSaving">
            {{ $t('tallenna') }}
          </ep-button>
        </div>
      </div>
    </div>
    <div class="taso-wrapper">
      <template v-if="arviointiasteikot">
        <div class="asteikko mt-4" v-for="(asteikko, idx) in arviointiasteikot" :key="asteikko.id">
          <span class="text-nowrap">
            <div class="d-flex align-text-top justify-content-between">
              <h3>{{$t('arviointiasteikko') + ' ' + (idx+1)}}</h3>
              <ep-button
                v-if="isEditing"
                @click="poistaArviointiasteikko(asteikko)"
                variant="link"
                icon="delete"
                v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}">
                {{ $t('poista-arviointiasteikko') }}
              </ep-button>
            </div>

            <div>
              <div
                v-for="(taso, index) in asteikko.osaamistasot"
                :key="taso.id"
                class="taso py-2 text-wrap"
                :class="{ 'pl-3': !isEditing, 'is-editing': isEditing }">
                <template v-if="!isEditing">
                  {{ $kaanna(taso.otsikko) }}
                </template>
                <div class="d-flex w-100 align-items-end" v-else>
                  <b-form-group
                    class="w-50"
                    :label="$t('osaamistaso') + ' ' + (index + 1)">
                    <ep-input
                      :name="$t('osaamistaso')"
                      v-model="taso.otsikko"
                      :is-editing="true"/>
                  </b-form-group>

                  <b-form-group class="w-40">
                    <ep-koodisto-select
                      :store="koodisto"
                      v-model="taso.koodi"
                      :is-editing="isEditing"
                      :naytaArvo="true">
                      <template #default="{ open }">
                        <b-input-group>
                          <b-form-input
                            :value="taso.koodi ? $kaanna(taso.koodi.nimi) : ''"
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

                  <b-form-group>
                    <div class="default-icon clickable mb-2 ml-4"
                         @click="poistaOsaamistaso(asteikko, taso)"
                         v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}">
                      <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                    </div>
                  </b-form-group>
                </div>
              </div>
              <ep-button v-if="isEditing"
                         variant="outline"
                         icon="add"
                         @click="lisaaOsaamistaso(asteikko)"
                         v-oikeustarkastelu="{oikeus:'hallinta', kohde:'pohja'}">
                {{ $t('lisaa-osaamistaso') }}
              </ep-button>
            </div>
          </span>
        </div>
      </template>
      <ep-spinner v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { ArviointiAsteikkoDto, Koodisto } from '@shared/api/eperusteet';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import * as _ from 'lodash';
import VueScrollTo from 'vue-scrollto';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpMainView,
    EpJulkiLista,
    EpButton,
    EpSpinner,
    EpInput,
    EpKoodistoSelect,
    EpInfoPopover,
    EpMaterialIcon,
  },
})
export default class RouteArviointiasteikot extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private isEditing: boolean | null = false;
  private isSaving = false;
  private arviointiasteikot: ArviointiAsteikkoDto[] | null = null;

  mounted() {
    this.init();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.init();
    }
  }

  lisaaArviointiasteikko() {
    this.isEditing = true;
    this.arviointiasteikot = [
      ...(this.arviointiasteikot || []),
      {
        osaamistasot: [],
      },
    ];

    VueScrollTo.scrollTo('footer', {
      offset: 200,
      x: false,
      y: true,
    });
  }

  poistaArviointiasteikko(asteikko) {
    this.arviointiasteikot = _.reject(this.arviointiasteikot, arviointiasteikko => arviointiasteikko === asteikko);
  }

  poistaOsaamistaso(asteikko, taso) {
    this.arviointiasteikot = _.map(this.arviointiasteikot, arviointiasteikko => {
      return {
        ...arviointiasteikko,
        osaamistasot: (asteikko === arviointiasteikko ? _.filter(asteikko.osaamistasot, osaamistaso => osaamistaso !== taso) : arviointiasteikko.osaamistasot),
      };
    });
  }

  lisaaOsaamistaso(asteikko) {
    asteikko.osaamistasot = [
      ...asteikko.osaamistasot,
      {},
    ];
  }

  async init() {
    await this.arviointiStore.fetchArviointiasteikot();
    this.arviointiasteikot = this.arviointiStore.arviointiasteikot.value as ArviointiAsteikkoDto[];
  }

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'arviointiasteikkoammatillinen15',
    async query(query: string, sivu = 0, koodisto: string) {
      const { data } = await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      });
      return data as any;
    },
  });

  async saveArviointiAsteikko() {
    this.isSaving = true;

    const koodittomia = _.some(this.arviointiasteikot, arviointiasteikko => {
      return _.size(_.reject(arviointiasteikko.osaamistasot, 'koodi')) > 0;
    });

    if (koodittomia) {
      this.$fail(this.$t('osaamistasolta-puuttuu-pakollinen-koodi') as string);
      this.isSaving = false;
      return;
    }

    try {
      await this.arviointiStore.updateArviointiasteikot(this.arviointiasteikot as ArviointiAsteikkoDto[]);
      this.isEditing = false;
      this.$success(this.$t('arviointiasteikko-tallennettu-onnistuneesti') as string);
      this.init();
    }
    catch (_err) {
      this.$fail(this.$t('arviointiasteikon-tallennus-epaonnistui') as string);
    }
    finally {
      this.isSaving = false;
    }
  }
}
</script>

<style lang="scss">
@import "@shared/styles/_variables.scss";

.asteikko {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;
}

.taso-wrapper {
  min-height: 75vh;
}

.taso {
  &:nth-of-type(even):not(.is-editing) {
    background-color: $table-even-row-bg-color;
  }
  &:nth-of-type(odd):not(.is-editing) {
    background-color: $table-odd-row-bg-color;
  }
}

.form-group {
  margin: 0;
}
</style>
