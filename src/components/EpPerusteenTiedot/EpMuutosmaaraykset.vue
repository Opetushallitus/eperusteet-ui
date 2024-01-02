<template>
  <div>
    <table class="table" v-if="value && value.length > 0">
      <thead>
        <tr>
          <th>{{ $t('nimi') }}</th>
          <th>{{ $t('tiedosto') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(muutos, idx) in value" :key="'muutos' + idx">
          <td>
            <ep-input v-model="muutos.nimi"
                      :is-editing="isEditing"></ep-input>
          </td>
          <td>
            <ep-multi-select class="w-100"
                             v-if="isEditing"
                             :value="muutos.liitteet ? muutos.liitteet[$slang.value] : null"
                             @input="updateLiite(idx, $event)"
                             :options="liitteet">
              <template v-slot:singleLabel="{ option }">{{ option.nimi }}</template>
              <template v-slot:option="{ option }">{{ option.nimi }}</template>
              <template v-slot:tag="{ option }">{{ option.nimi }}</template>
            </ep-multi-select>
            <div v-else>
              {{ (muutos.liitteet && muutos.liitteet[$slang.value].nimi) ? muutos.liitteet[$slang.value].nimi : null }}
            </div>
          </td>
          <td v-if="isEditing">
            <div class="text-center">
              <ep-button variant="link" icon="delete" @click="poista(idx)"></ep-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <ep-button class="mt-3" @click="lisaaMuutosmaarays()" v-if="isEditing">{{ $t('lisaa-muutosmaarays') }}</ep-button>

    <EpSpinner v-if="!muutosmaaraykset" />
    <b-table
      v-else-if="muutosmaaraykset.length > 0"
      class="w-90 mt-3"
      :items="muutosmaaryksetSorted"
      :fields="muutosmaarayksetFields"
      striped>

      <template v-slot:cell(nimi)="{ item }">
        <EpPdfLink v-if="item.url" :url="item.url">{{ $kaanna(item.nimi) }}</EpPdfLink>
        <div v-else>{{ $kaanna(item.nimi) }}</div>
      </template>

      <template v-slot:cell(toiminnot)="{item}">
        <div class="d-flex" v-if="isEditing">
          <EpButton icon="edit" variant="link" @click="muokkaaMuutosmaarausta(item)">{{$t('muokkaa')}}</EpButton>
          <EpButton icon="delete" variant="link" @click="poistaMuutosmaarays(item)" :showSpinner="item.poistossa">{{$t('poista')}}</EpButton>
        </div>
      </template>

    </b-table>

    <EpMuutosmaaraysModal ref="muutosmaaraysModal" :perusteStore="perusteStore"/>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { LiiteDto, MaarayksetParams, MaaraysLiiteDtoTyyppiEnum, baseURL } from '@shared/api/eperusteet';
import EpMuutosmaaraysModal from '@/components/EpPerusteenTiedot/EpMuutosmaaraysModal.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kielet, KieliStore } from '@shared/stores/kieli';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpButton,
    EpInput,
    EpMultiSelect,
    EpMuutosmaaraysModal,
    EpSpinner,
    EpMaterialIcon,
  },
})
export default class EpMuutosmaaraykset extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ required: true })
  private liitteet!: LiiteDto[];

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ required: true })
  private perusteStore!: PerusteStore;

  poistossa: number[] = [];

  poista(idx) {
    const temp = [...this.value];
    Vue.delete(temp, idx);
    this.$emit('input', temp);
  }

  updateLiite(idx, liite) {
    const temp = this.value;
    Vue.set(temp[idx].liitteet, this.$slang.value, { ...liite });
    this.$emit('input', temp);
  }

  get muutosmaaraykset() {
    if (this.perusteStore.muutosmaaraykset.value) {
      return _.map(this.perusteStore.muutosmaaraykset.value, muutosmaarays => {
        return {
          ...muutosmaarays,
          url: this.muutosmaaraysUrl(muutosmaarays),
          poistossa: _.includes(this.poistossa, muutosmaarays.id),
        };
      });
    }
  }

  get muutosmaaryksetSorted() {
    return this.muutosmaaraykset;
  }

  muutosmaaraysUrl(muutosmaarays) {
    if (!_.find(muutosmaarays.liitteet![this.kieli].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI)) {
      return null;
    }

    return baseURL + MaarayksetParams.getMaaraysLiite(_.toString(_.get(_.find(muutosmaarays.liitteet![this.kieli].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI), 'id'))).url;
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get muutosmaarayksetFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '60%' },
      thClass: 'border-bottom-1',
      tdClass: 'align-middle',
      sortable: false,
    }, {
      key: 'voimassaoloAlkaa',
      label: this.$t('voimassaolo-alkaa'),
      thClass: 'border-bottom-1',
      tdClass: 'align-middle',
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sd(value);
      },
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%', borderBottom: '0px' },
      sortable: false,
    }];
  }

  lisaaMuutosmaarays() {
    (this.$refs['muutosmaaraysModal'] as any).muokkaa();
  }

  async muokkaaMuutosmaarausta(muutosmaarays) {
    (this.$refs['muutosmaaraysModal'] as any).muokkaa(muutosmaarays);
  }

  async poistaMuutosmaarays(muutosmaarays) {
    const poista = await this.$bvModal.msgBoxConfirm(this.$t('poista-muutosmaarays-varmistus') as any, {
      title: this.$t('poista-muutosmaarays') as any,
      okVariant: 'primary',
      okTitle: this.$t('poista') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
    });

    if (poista) {
      this.poistossa.push(muutosmaarays.id);
      this.perusteStore.poistaMuutosmaarays(muutosmaarays);
      this.poistossa = _.reject(this.poistossa, poisto => poisto === muutosmaarays.id);
      this.$success(this.$t('muutosmaarays-poistettu') as string);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
