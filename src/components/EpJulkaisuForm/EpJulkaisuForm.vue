<template>
  <div>
    <b-form-group :label="$t('lataa-uusi-muutosmaaraus')" class="mt-4">
      <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="file" :as-binary="true" v-if="!file" />
      <div v-if="file">
        <b-input-group>
          <b-form-input v-model="liitteenNimi"></b-form-input>
          <b-input-group-append>
            <b-button @click="peruutaLiite()" variant="secondary">
              {{ $t('peruuta') }}
            </b-button>
            <b-button @click="tallennaLiite()" icon="plus" variant="primary" :disabled="!liitteenNimi">
              {{ $t('lisaa-liite') }}
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <b-table v-if="julkaisuMuutosMaaraysLiitteet && julkaisuMuutosMaaraysLiitteet.length > 0"
               :items="julkaisuMuutosMaaraysLiitteet"
               :fields="liitetableFields"
               responsive
               borderless
               striped
               fixed
               hover>
        <template v-slot:cell(toiminnot)="data">
          <div class="text-center">
            <ep-button variant="link" icon="roskalaatikko" @click="poistaLiite(data.item)">
              {{ $t('poista') }}
            </ep-button>
          </div>
        </template>
      </b-table>
    </b-form-group>

    <b-form-group v-if="julkaisuMuutosMaaraysLiitteet && julkaisuMuutosMaaraysLiitteet.length > 0" :label="$t('muutosmaaraykset')">
      <EpJulkaisuMuutosmaaraykset v-model="muutosmaaraykset"
                                  :liitteet="julkaisuMuutosMaaraysLiitteet"
                                  :julkaisukielet="julkaisukielet"/>
    </b-form-group>

    <b-form-group :label="$t('muutosmaarays-astuu-voimaan')" class="mt-4 col-lg-3">
      <ep-datepicker v-model="julkaisu.muutosmaaraysVoimaan" :is-editing="true" :validation="validations.julkaisu.muutosmaaraysVoimaan"/>
    </b-form-group>

    <b-form-group :label="$t('tiedote-hallintanakymaan')" class="mt-4">
      <div class="mb-3">{{ $t('tiedote-naytetaan-taman-sivun-julkaisuhistoriassa') }}</div>
      <ep-content v-model="julkaisu.tiedote"
                  layout="simplified"
                  :is-editable="true" />
      <ep-toggle v-model="julkaisu.julkinen" :isSWitch="false" class="mt-4">
        {{$t('julkaisu-naytetaan-julkisen-sivuston-julkaisuhistoriassa')}}
      </ep-toggle>
    </b-form-group>
    <b-form-group v-if="julkaisu.julkinen" :label="$t('tiedote-julkiselle-sivustolle')" class="mt-4">
      <div class="mt-4 mb-3">{{ $t('tiedote-naytetaan-perusteen-tiedot-näkyman-julkaisuhistoriassa') }}</div>
      <ep-content v-model="julkaisu.julkinenTiedote"
                  layout="simplified"
                  :is-editable="true" />
    </b-form-group>
  </div>
</template>

<script lang="ts">
import { Api, baseURL, LiiteDtoTyyppiEnum, Liitetiedostot, LiitetiedostotParam } from '@shared/api/eperusteet';
import _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpJulkaisuMuutosmaaraykset from '@/components/EpJulkaisuMuutosmaaraykset.vue';
import { Validations } from 'vuelidate-property-decorators';
import { koodistoKoodiValidator, requiredLokalisoituTeksti, requiredOneLang } from '@shared/validators/required';
import { required, requiredIf } from 'vuelidate/lib/validators';

@Component({
  components: {
    EpTiedostoLataus,
    EpContent,
    EpDatepicker,
    EpToggle,
    EpButton,
    EpJulkaisuMuutosmaaraykset,
    EpMultiSelect,
  },
})
export default class EpJulkaisuForm extends Vue {
  @Prop({ required: true })
  private julkaisu: any;

  @Prop({ required: true })
  private perusteId: any;

  @Prop({ required: true })
  private julkaisukielet: any;

  private file: any | null = null;
  private liitteenNimi = '';
  private liitteet: any[] | null = null;

  @Validations()
  validations = {
    julkaisu: {
      muutosmaaraysVoimaan: {
        required: requiredIf((value) => this.julkaisu.muutosmaaraykset && this.julkaisu.muutosmaaraykset.length > 0),
      },
    },
  }

  async mounted() {
    await this.fetchLiitteet();
  }

  async fetchLiitteet() {
    const res = await Liitetiedostot.getAllLiitteet(Number(this.perusteId!));
    this.liitteet = _.map(res.data, liite => ({
      ...liite,
      lisatieto: liite.lisatieto || '',
      url: baseURL + LiitetiedostotParam.getLiite(this.perusteId!, liite.id!).url,
    }));
  }

  async tallennaLiite() {
    if (!this.file) {
      return;
    }
    const data = new FormData();
    data.append('file', window.btoa(this.file.binary));
    data.set('nimi', this.liitteenNimi);
    data.set('tyyppi', 'julkaisumuutosmaarays');
    await Api.request({
      method: 'POST',
      url: `perusteet/${this.perusteId!}/liitteet/b64`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    this.$success(this.$t('liitetiedosto-tallennettu') as string);
    await this.fetchLiitteet();
    this.file = null;
    this.liitteenNimi = '';
  }

  peruutaLiite() {
    this.file = null;
    this.liitteenNimi = '';
  }

  async poistaLiite(item: any) {
    try {
      await Liitetiedostot._delete(Number(this.perusteId!), item.id);
      this.$success(this.$t('liitetiedoston-poisto-onnistui') as string);
      await this.fetchLiitteet();
    }
    catch (err) {
      this.$fail(this.$t('liitetiedoston-poisto-epaonnistui') as string);
      console.log(err);
    }
  }

  get muutosmaaraykset() {
    return this.julkaisu.muutosmaaraykset;
  }

  set muutosmaaraykset(maaraykset) {
    this.julkaisu.muutosmaaraykset = maaraykset;
  }

  get julkaisuMuutosMaaraysLiitteet() {
    return _.filter(this.liitteet, liite => liite.tyyppi === _.toLower(LiiteDtoTyyppiEnum.JULKAISUMUUTOSMAARAYS));
  }

  get liitetableFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      thStyle: { width: '60%' },
      sortable: true,
    }, {
      key: 'luotu',
      label: this.$t('lisätty'),
      sortable: true,
      formatter: (value: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '10%', borderBottom: '0px' },
      sortable: false,
    }];
  }

  @Watch('file')
  fileChange() {
    if (this.file) {
      this.liitteenNimi = this.file.file.name;
    }
  }
};
</script>

<style scoped>

</style>
