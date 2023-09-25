<template>
  <div>
    <b-modal ref="tutkinnonosaTuontiModal"
            id="tuotutkinnonosa"
            size="xl"
            centered
            @close="close">
      <template v-slot:modal-title>
        {{ $t('tuo-tutkinnon-osa') }}
      </template>

      <div class="d-flex">
        <b-form-group class="w-50" :label="$t('tutkinnon-osan-nimi')">
          <ep-search v-model="tutkinnonosaQuery.nimi" :placeholder="$t('etsi-tutkinnon-osaa')"/>
          <ep-toggle v-model="tutkinnonosaQuery.vanhentuneet" :isSWitch="false" class="mt-2">
            {{$t('nayta-myos-vanhentuneet')}}
          </ep-toggle>
        </b-form-group>

        <b-form-group class="ml-auto w-50">
          <div slot="label" class="d-flex">
            <div>{{$t('tutkinto')}}</div>
            <ep-spinner v-if="perusteetLoading" />
          </div>
          <EpMultiSelect
            class="flex-grow-1"
            v-model="tutkinnonosaQuery.peruste"
            :placeholder="!perusteetLoading ? $t('kirjoita-tutkinnon-nimi') : $t('valitse')"
            :is-editing="true"
            :options="perusteet ? perusteet : []"
            @search="perusteSearch"
            :internalSearch="false"
            :clearOnSelect="false">
            <template slot="noResult"><div v-if="perusteet && perusteet.length === 0">{{ $t('ei-hakutuloksia') }}</div><div v-else/></template>
            <template slot="noOptions"><div></div></template>
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
              <span v-if="option.voimassaoloAlkaa">
                ({{$t('voimassa')}} {{$sd(option.voimassaoloAlkaa)}} - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
              </span>
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
              <span v-if="option.voimassaoloAlkaa">
                ({{$t('voimassa')}} {{$sd(option.voimassaoloAlkaa)}} - <span v-if="option.voimassaoloLoppuu">{{$sd(option.voimassaoloLoppuu)}}</span>)
              </span>
            </template>
          </EpMultiSelect>
        </b-form-group>
      </div>

      <ep-spinner v-if="!tutkinnonosat" />

      <div v-else-if="tutkinnonosat.length > 0">
        <b-table
          responsive
          striped
          :items="tutkinnonosatWithSelected"
          :fields="tutkinnonosatFields">
          <template v-slot:cell(nimi)="{ item }">
            <div class="selectable" @click="selectRow(item)">
              <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
              <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
              <span>{{$kaanna(item.nimi)}}</span>
              <span v-if="item.tutkinnonOsa.koodiArvo">({{item.tutkinnonOsa.koodiArvo}})</span>
            </div>
          </template>
          <template v-slot:cell(peruste)="{ item, value }">

            <b-button variant="link" :id="'peruste-popover-'+item.id">
              {{$t('kaytossa')}}
            </b-button>

            <b-popover :target="'peruste-popover-'+item.id" triggers="hover click">
              <template #title>{{$t('kaytossa-tutkinnossa')}}</template>
              {{value}}
            </b-popover>

          </template>
        </b-table>
        <b-pagination v-if="totalRows > sisaltoSivuKoko"
            v-model="page"
            :total-rows="totalRows"
            :per-page="sisaltoSivuKoko"
            align="center"
            aria-controls="tuo-tutkinnon-osa"></b-pagination>
      </div>
      <div v-else>
        {{$t('ei-hakutuloksia')}}
      </div>

      <div v-if="selectedTutkinnonosat.length > 0">
        <h3>{{$t('valittu')}} {{selectedTutkinnonosat.length}} {{$t('kpl')}}</h3>
        <b-table
          responsive
          striped
          :items="tutkinnonosatWithSalliMuokattavaksi"
          :fields="valittuFields">

          <template v-slot:cell(salli-muokkaus)="{ item }">
            <div class="selectable" @click="selectSalliMuokkausRow(item)">
              <EpMaterialIcon v-if="item.kopioiMuokattavaksi" class="checked mr-2">check_box</EpMaterialIcon>
              <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
              <span>{{$t('kylla')}}</span>
            </div>
          </template>

        </b-table>
      </div>

      <div slot="modal-footer">
        <ep-button @click="close" variant="link">{{ $t('peruuta')}}</ep-button>
        <ep-button @click="save">{{ $t('tuo-valitut-tutkinnon-osat')}}</ep-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { PerusteDto, TutkinnonOsaViiteKontekstiDto } from '@shared/generated/eperusteet';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
    EpMultiSelect,
    EpToggle,
    EpMaterialIcon,
  },
})
export default class EpTutkinnonosaTuontiModal extends Vue {
  @Prop({ required: true })
  protected peruste!: PerusteDto;

  private tutkinnonosatTuontiStore: TutkinnonosatTuontiStore | null = null;
  private perusteQuery = '';
  private tutkinnonosaQuery = {} as any;
  private sivu = -1;
  private sisaltoSivuKoko = 10;
  private selectedTutkinnonosat: TutkinnonOsaViiteKontekstiDto[] = [];
  private valitutMuokattavaksiTutkinnonosat: TutkinnonOsaViiteKontekstiDto[] = [];

  defaults() {
    this.tutkinnonosatTuontiStore = new TutkinnonosatTuontiStore(this.peruste);
    this.tutkinnonosaQuery = {
      sivukoko: this.sisaltoSivuKoko,
      nimi: '',
      peruste: null,
      vanhentuneet: false,
    } as any;

    this.page = 1;
    this.selectedTutkinnonosat = [];
    this.valitutMuokattavaksiTutkinnonosat = [];
  }

  get perusteet() {
    return this.tutkinnonosatTuontiStore?.perusteet.value?.data || null;
  }

  get perusteetLoading() {
    return !this.perusteet;
  }

  get tutkinnonosat() {
    return this.tutkinnonosatTuontiStore?.tutkinnonosat?.value?.data || null;
  }

  get tutkinnonosatWithSelected() {
    return _.map(this.tutkinnonosat, tutkinnonosa => {
      return {
        ...tutkinnonosa,
        selected: _.includes(_.map(this.selectedTutkinnonosat, 'id'), _.get(tutkinnonosa, 'id')),
      };
    });
  }

  get tutkinnonosatWithSalliMuokattavaksi() {
    return _.map(this.selectedTutkinnonosat, tutkinnonosa => {
      return {
        ...tutkinnonosa,
        kopioiMuokattavaksi: _.includes(_.map(this.valitutMuokattavaksiTutkinnonosat, 'id'), _.get(tutkinnonosa, 'id')),
        alkuperainenPeruste: tutkinnonosa.peruste,
      };
    });
  }

  get tutkinnonosatPage() {
    return this.tutkinnonosatTuontiStore?.tutkinnonosat.value || null;
  }

  async show() {
    (this.$refs.tutkinnonosaTuontiModal as any).show();
    this.defaults();
  }

  @Watch('tutkinnonosaQuery', { deep: true })
  async onQueryChange() {
    this.sivu = 0;
    await this.queryFetch();
  }

  @Watch('sivu')
  async onPageChange() {
    await this.queryFetch();
  }

  async queryFetch() {
    await this.tutkinnonosatTuontiStore!.fetchTutkinnonosat({ ...this.tutkinnonosaQuery, sivu: this.sivu, kieli: Kielet.getSisaltoKieli.value });
  }

  get totalRows() {
    return this.tutkinnonosatPage!.kokonaismäärä;
  }

  get page() {
    return this.tutkinnonosatPage!.sivu + 1;
  }

  set page(value: number) {
    this.sivu = value - 1;
  }

  async save() {
    try {
      await this.tutkinnonosatTuontiStore!.tuoSisaltoa(
        _.map(this.tutkinnonosatWithSalliMuokattavaksi, tutkinnonosa =>
          _.pick(tutkinnonosa, ['laajuus', 'nimi', 'suoritustapakoodi', 'tyyppi', '_tutkinnonOsa', 'kopioiMuokattavaksi', 'alkuperainenPeruste']) as any));

      this.$success(this.$t('tutkinnon-osat-tuotu-onnistuneesti') as string);
      this.close();
      this.$emit('refresh');
    }
    catch (e) {
      this.$fail(this.$t('tutkinnon-osien-tuonti-epaonnistui') as string);
    }
  }

  close() {
    (this as any).$bvModal.hide('tuotutkinnonosa');
  }

  selectRow(item) {
    if (_.includes(_.map(this.selectedTutkinnonosat, 'id'), item.id)) {
      this.selectedTutkinnonosat = _.filter(this.selectedTutkinnonosat, tutkinnonosa => tutkinnonosa.id !== item.id);
    }
    else {
      this.selectedTutkinnonosat = [
        ...this.selectedTutkinnonosat,
        item,
      ];
    }
  }

  selectSalliMuokkausRow(item) {
    if (_.includes(_.map(this.valitutMuokattavaksiTutkinnonosat, 'id'), item.id)) {
      this.valitutMuokattavaksiTutkinnonosat = _.filter(this.valitutMuokattavaksiTutkinnonosat, tutkinnonosa => tutkinnonosa.id !== item.id);
    }
    else {
      this.valitutMuokattavaksiTutkinnonosat = [
        ...this.valitutMuokattavaksiTutkinnonosat,
        item,
      ];
    }
  }

  get tutkinnonosatFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: false,
      thStyle: { width: '40%' },
    }, {
      key: 'voimaantulo',
      label: this.$t('voimaantulo'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return item.peruste.voimassaoloAlkaa ? this.$sd(item.peruste.voimassaoloAlkaa) : '';
      },
    }, {
      key: 'laajuus',
      label: this.$t('laajuus'),
      sortable: false,
    }, {
      key: 'peruste',
      label: this.$t('kaytossa'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(item.peruste.nimi);
      },
    }];
  }

  get valittuFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'salli-muokkaus',
      label: this.$t('salli-muokkaus') + '?',
      sortable: false,
      thStyle: { width: '30%' },
    }];
  }

  async perusteSearch(search) {
    if (_.size(search) > 2) {
      await this.tutkinnonosatTuontiStore!.fetchPerusteet(search);
    }
  }
}

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep .filter {
    max-width: 100%;
  }

  .selectable {
    cursor: pointer;

    .checked {
      color: $paletti-blue;
    }
  }

</style>
