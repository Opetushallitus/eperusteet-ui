<template>
  <EpEditointi :store="store">
    <template #header="{ data }">
      <h2 v-if="data.koodi">{{ $kaanna(data.koodi.nimi) }}</h2>
      <h2 v-else-if="data.nimi">{{ $kaanna(data.nimi) }}</h2>
      <h2 v-else class="font-italic" >{{ $t('nimeton-kurssi') }}</h2>
    </template>

    <template #default="{ data, isEditing, supportData }">
      <b-row>
        <b-col cols="8" v-if="isEditing">
          <b-form-group :label="$t('kurssin-nimi')">
            <ep-koodisto-select :store="koodisto" v-model="data.koodi" :is-editing="isEditing" :naytaArvo="false">
              <template slot="koodisto">
                ({{ koodistoNimi }})
              </template>
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
        </b-col>

        <b-col cols="3">
          <b-form-group :label="$t('koodi')">
            <span v-if="data.koodi">
              {{ data.koodi.arvo }}
            </span>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('tavoitteisiin-liittyvat-keskeiset-sisaltoalueet')">
            <ep-content layout="normal" v-model="data.kuvaus" :is-editable="isEditing"> </ep-content>
          </b-form-group>
        </b-col>
      </b-row>

      <hr/>

      <b-row>
        <b-col cols="11">
          <b-form-group :label="$t('liitetyt-tavoitteet')">
            <b-form-checkbox-group v-if="isEditing" v-model="data.tavoitteet" stacked>
              <b-form-checkbox v-for="tavoite in supportData.tavoitteet" :key="tavoite.id" :value="tavoite.id">
                {{ $kaanna(tavoite.tavoite) }}
              </b-form-checkbox>
            </b-form-checkbox-group>

            <template v-else>
              <div class="listaus p-3" v-for="tavoite in tavoitteet" :key="tavoite.id">
                {{ $kaanna(tavoite.tavoite) }}
              </div>
            </template>
          </b-form-group>
        </b-col>
      </b-row>

    </template>
  </EpEditointi>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { AipeKurssiStore } from '@/stores/AipeKurssiStore';

@Component({
  components: {
    EpEditointi,
    EpButton,
    EpKoodistoSelect,
    EpContent,
  },
})
export default class RouteAipeKurssi extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: false })
  vaiheId: any;

  @Prop({ required: false })
  oppiaineId: any;

  @Prop({ required: false })
  kurssiId: any;

  store: EditointiStore | null = null;

  private koodistoNimi: string = 'oppiaineetyleissivistava2';

  @Watch('kurssiId', { immediate: true })
  async kurssiChange() {
    const store = new AipeKurssiStore(this.perusteId!, this.vaiheId, this.oppiaineId, this.kurssiId, this.perusteStore, this);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('oppiaineetyleissivistava2', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  get isEditing() {
    return this.store?.isEditing.value;
  }

  get tavoitteet() {
    return _.filter(this.store?.supportData.value?.tavoitteet, tavoite => _.includes(this.store?.data.value?.tavoitteet, _.toString(tavoite.id)));
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.listaus:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.listaus:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}

</style>
