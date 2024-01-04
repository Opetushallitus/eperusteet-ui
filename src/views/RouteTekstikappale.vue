<template>
  <div v-if="store">
    <EpEditointi :store="store"
                 :versionumero="versionumero"
                 :confirmRemove="true"
                 :postRemove="postRemove"
                 label-remove-confirm="vahvista-tekstikappaleen-poisto">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template v-slot:postHeader="{ data }">
        <span v-if="data.liite"><b>{{ $t('liite') }}. </b></span>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1 otsikko" v-if="isEditing">
          <div class="mb-4" v-if="osaamisalat.length > 0 || tutkintonimikkeet.length > 0">
            <b-form-radio v-if="osaamisalat.length > 0"
                          v-model="tekstikappaleTyyppi"
                          value="osaamisala"
                          name="tekstikappaleTyyppi">{{ $t('osaamisala') }}</b-form-radio>
            <b-form-radio v-if="tutkintonimikkeet.length > 0"
                          v-model="tekstikappaleTyyppi"
                          value="tutkintonimike"
                          name="tekstikappaleTyyppi">{{ $t('tutkintonimike') }}</b-form-radio>
            <b-form-radio v-model="tekstikappaleTyyppi"
                          value="tekstikappale"
                          name="tekstikappaleTyyppi">{{ $t('tekstikappale') }}</b-form-radio>
          </div>
          <div v-if="tekstikappaleTyyppi === 'osaamisala'" class="mb-4">
            <div class="d-flex">
              <h3>{{$t('osaamisala')}}</h3>
              <EpMaterialIcon class="ml-2"
                              icon-shape="outlined"
                              v-b-popover="{content: $t('valintaa-kaytetaan-tekstikappaleen-otsikkona'), trigger: 'hover', placement: 'top', variant: 'primary'}"
                              size="20px">info</EpMaterialIcon>
            </div>
            <EpMultiSelect v-model="data.osaamisala" :is-editing="true" :options="osaamisalat" :multiple="false" trackBy="uri" class="multiselect">
              <template slot="singleLabel" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template slot="option" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <div v-if="tekstikappaleTyyppi === 'tutkintonimike'" class="mb-4">
            <div class="d-flex">
              <h3>{{$t('tutkintonimike')}}</h3>
              <EpMaterialIcon class="ml-2"
                              icon-shape="outlined"
                              v-b-popover="{content: $t('valintaa-kaytetaan-tekstikappaleen-otsikkona'), trigger: 'hover', placement: 'top', variant: 'primary'}"
                              size="20px">info</EpMaterialIcon>
            </div>
            <EpMultiSelect v-model="data.tutkintonimike" :is-editing="true" :options="tutkintonimikkeet" :multiple="false" trackBy="uri" class="multiselect">
              <template slot="singleLabel" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template slot="option" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <div v-if="tekstikappaleTyyppi === 'tekstikappale'" class="mb-4">
            <h3>{{$t('otsikko')}}</h3>
            <ep-input v-model="data.nimi" :is-editing="true" :validation="validation.nimi" :disabled="!!data.osaamisala || !!data.tutkintonimike"></ep-input>
          </div>
          <ep-toggle class="mt-4" v-model="data.liite">{{$t('nayta-tekstikappale-liitteena')}}</ep-toggle>
        </div>
        <div :class="{ 'mt-4': isEditing }">
          <ep-content v-model="data.teksti"
                      layout="normal"
                      :is-editable="isEditing"
                      :kasiteHandler="kasiteHandler"
                      :kuvaHandler="kuvaHandler"></ep-content>
        </div>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';
import { Murupolku } from '@shared/stores/murupolku';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

interface koodistoryhma {
  ryhma: string;
  koodistot: string[];
}

@Component({
  components: {
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
    EpKoodistoSelect,
    EpButton,
    EpToggle,
    EpSelect,
    EpMultiSelect,
    EpMaterialIcon,
  },
})
export default class RouteTekstikappale extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;
  private tekstikappaleTyyppi: 'osaamisala' | 'tutkintonimike' | 'tekstikappale' | null = null;

  get projektiId() {
    return this.$route.params.projektiId;
  }

  get tekstikappaleId() {
    return this.$route.params.tekstiKappaleId;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get osaamisalat() {
    return this.perusteStore.peruste.value?.osaamisalat;
  }

  get tutkintonimikkeet() {
    return _.map(this.perusteStore.peruste.value?.tutkintonimikkeet, tutkintonimike => {
      return {
        nimi: tutkintonimike.nimi,
        uri: tutkintonimike.tutkintonimikeUri,
        arvo: tutkintonimike.tutkintonimikeArvo,
        koodisto: 'tutkintonimikkeet',
        versio: null,
      };
    });
  }

  koodiNimikeChange(val, oldVal) {
    if (!val) {
      val = { nimi: this.oldNimi };
    }
    if (!_.isEqual(val, oldVal)) {
      this.store?.setData({
        ...this.store?.data.value,
        nimi: val.nimi,
      });
    }
  }

  get oldNimi() {
    return this.store?.data.value?.originalNimi;
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TekstikappaleStore(this.perusteId!, Number(this.tekstikappaleId), this.versionumero);
    this.store = new EditointiStore(tkstore);
  }

  get tekstikappale() {
    return this.store?.data?.value || null;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  @Watch('store.isEditing.value')
  onEditingChange() {
    this.koodiNimikeChange(null, null);
    this.tekstikappaleTyyppiInit();
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  @Watch('tekstikappaleId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.fetch();
  }

  @Watch('tekstikappale')
  onDataChange(tk) {
    if (tk) {
      Murupolku.aseta('tekstikappale', this.$kaanna(tk.nimi), {
        name: 'tekstikappale',
      });
      if (!this.tekstikappaleTyyppi) {
        this.tekstikappaleTyyppiInit();
      }
    }
  }

  @Watch('tekstikappaleTyyppi')
  async onTekstikappaleTyyppiChange() {
    if (this.store?.isEditing.value) {
      this.resetTutkintonimike();
      this.resetOsaamisala();
      this.resetNimi();
    }
  }

  @Watch('store.data.value.osaamisala')
  async onOsaamisalaChange(val, oldVal) {
    this.handleDropdownValueChange(val, oldVal);
  }

  @Watch('store.data.value.tutkintonimike')
  async onTutkintonimikeChange(val, oldVal) {
    this.handleDropdownValueChange(val, oldVal);
  }

  tekstikappaleTyyppiInit() {
    if (this.store?.data.value.id) {
      if (this.store?.data.value?.tutkintonimike) {
        this.tekstikappaleTyyppi = 'tutkintonimike';
      }
      else if (this.store?.data.value?.osaamisala) {
        this.tekstikappaleTyyppi = 'osaamisala';
      }
      else {
        this.tekstikappaleTyyppi = 'tekstikappale';
      }
    }
  }

  handleDropdownValueChange(val, oldVal) {
    if (val) {
      this.koodiNimikeChange(val, oldVal);
    }
    else {
      this.resetNimi();
    }
  }

  resetNimi() {
    this.store?.setData({
      ...this.store?.data.value,
      nimi: null,
    });
  }

  resetTutkintonimike() {
    this.store?.setData({
      ...this.store?.data.value,
      tutkintonimike: null,
    });
  }

  resetOsaamisala() {
    this.store?.setData({
      ...this.store?.data.value,
      osaamisala: null,
    });
  }

  get fields() {
    let fields = [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: true,
      formatter: (value, key, item) => {
        return this.$kaanna(item.nimi);
      },
    }, {
      key: 'arvo',
      sortable: true,
      label: this.$t('koodi'),
      thStyle: 'width: 10%',
    }];

    if (this.store?.isEditing.value) {
      return [
        ...fields,
        {
          key: 'delete',
          label: '',
          sortable: false,
          thClass: 'border-0',
          thStyle: 'width: 1%',
        },
      ];
    }

    return fields;
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.perusteId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }

  get postRemove() {
    return () => {
      this.$router.push({
        name: 'poistetutsisallot',
      });
    };
  }
}
</script>

<style lang="scss" scoped>
  @import "@shared/styles/_variables.scss";

  .koodistoryhmat {
    margin-top: 50px;

    .koodistoryhma {
      margin-top: 30px;

      .koodistot {
        padding: 20px;
        border: 1px solid $gray-lighten-4;

        .koodisto {
          margin-bottom: 30px;

          .roskalaatikko {
            color: $paletti-blue;
            cursor: pointer;
            margin: 0 10px;
          }
        }
      }
    }
  }

  .otsikko {
    .multiselect {
      ::v-deep .multiselect__content-wrapper {
        width: 100%;
      }
    }
  }

</style>
