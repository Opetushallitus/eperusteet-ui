<template>
  <div v-if="store">
    <EpEditointi :store="store" :versionumero="versionumero" :confirmRemove="false" :postRemove="postRemove">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <div class="mt-1 otsikko" v-if="isEditing">

          <div v-if="osaamisalat.length > 0" class="mb-4">
            <h3>{{$t('osaamisalat')}}</h3>
            <EpMultiSelect v-model="data.osaamisala" :is-editing="true" :options="osaamisalat" :multiple="false" trackBy="uri" class="multiselect">
              <template slot="singleLabel" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template slot="option" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <div v-if="tutkintonimikkeet.length > 0" class="mb-4">
            <h3>{{$t('tutkintonimikkeet')}}</h3>
            <EpMultiSelect v-model="data.tutkintonimike" :is-editing="true" :options="tutkintonimikkeet" :multiple="false" trackBy="uri" class="multiselect">
              <template slot="singleLabel" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
              <template slot="option" slot-scope="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </EpMultiSelect>
          </div>

          <h3>{{$t('otsikko')}}</h3>
          <ep-input v-model="data.nimi" :is-editing="true" :validation="validation.nimi" :disabled="!!data.osaamisala || !!data.tutkintonimike"></ep-input>
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
import { Koodisto } from '../../eperusteet-frontend-utils/vue/src/api/eperusteet';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';
import { KoodiDto } from '../../eperusteet-frontend-utils/vue/src/generated/eperusteet';
import { Murupolku } from '@shared/stores/murupolku';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';

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
  },
})
export default class RouteTekstikappale extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;
  private blockChange = false;

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

  async doWatchBlock(watch) {
    if (!this.blockChange) {
      this.blockChange = true;
      await watch();
      this.blockChange = false;
    }
  }

  @Watch('store.data.value.osaamisala', { immediate: true })
  async onOsaamisalaChange(val, oldVal) {
    await this.doWatchBlock(async () => {
      if (val) {
        this.store?.setData({
          ...this.store?.data.value,
          tutkintonimike: null,
        });
      }
      this.koodiNimikeChange(val, oldVal);
    });
  }

  @Watch('store.data.value.tutkintonimike', { immediate: true })
  async onTutkintonimikeChange(val, oldVal) {
    await this.doWatchBlock(async () => {
      if (val) {
        this.store?.setData({
          ...this.store?.data.value,
          osaamisala: null,
        });
      }
      this.koodiNimikeChange(val, oldVal);
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
    return this.store?.data.value.originalNimi;
  }

  @Watch('tekstikappaleId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.fetch();
  }

  async fetch() {
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TekstikappaleStore(this.perusteId!, Number(this.tekstikappaleId), this.versionumero);
    this.store = new EditointiStore(tkstore);
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  @Watch('versionumero', { immediate: true })
  async versionumeroChange() {
    await this.fetch();
  }

  get tekstikappale() {
    return this.store?.data?.value || null;
  }

  @Watch('tekstikappale')
  onDataChange(tk) {
    if (tk) {
      Murupolku.aseta('tekstikappale', this.$kaanna(tk.nimi), {
        name: 'tekstikappale',
      });
    }
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
            margin: 0px 10px;
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
