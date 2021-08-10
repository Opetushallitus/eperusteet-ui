<template>
  <b-modal
    ref="rakenneModal"
    size="xl"
    :cancelTitle="$t('peruuta')">

    <template #modal-header>
      <h2 v-if="muokkaus">{{ $t('muokkaa-ryhmaa') }}: {{$kaanna(nimi)}}</h2>
      <h2 v-else>{{ $t('lisaa-ryhma') }}</h2>
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-end w-100">
        <ep-button @click="remove" icon="roskalaatikko" variant="link" class="flex-grow-1" v-if="muokkaus">
          {{$t('poista')}}
        </ep-button>
        <ep-button @click="cancel" variant="link">
          {{$t('peruuta')}}
        </ep-button>
        <ep-button @click="save" :disabled="invalid">
          {{$t('tallenna')}}
        </ep-button>
      </div>
    </template>

    <template #default>
      <div v-if="isRyhma">
        <b-form-group :label="$t('ryhma') + ' *'">
          <b-form-radio class="ml-1" v-model="tyyppi" value="osaamisala" name="tyyppi">
            {{ $t('osaamisala') }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="tyyppi" value="tutkintonimike" name="tyyppi">
            {{ $t('tutkintonimike') }}
          </b-form-radio>
          <b-form-radio class="ml-1 mt-2" v-model="tyyppi" value="rakenne-moduuli-pakollinen" name="tyyppi">
            {{ $t('rakenne-moduuli-pakollinen') }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-valinnainen" name="tyyppi">
            {{ $t('rakenne-moduuli-valinnainen') }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-ammatilliset" name="tyyppi">
            {{ $t('rakenne-moduuli-ammatilliset') }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-yhteiset" name="tyyppi">
            {{ $t('rakenne-moduuli-yhteiset') }}
          </b-form-radio>
          <b-form-radio class="ml-1 mt-2" v-model="tyyppi" value="rakenne-moduuli-paikalliset" name="tyyppi">
            {{ $t('rakenne-moduuli-paikalliset') }}
          </b-form-radio>
        </b-form-group>

        <b-form-group :label="$t('osaamisala') + ' *'" v-if="tyyppi ==='osaamisala'">
          <b-form-radio v-for="(osaamisala, index) in selectableOsaamisalat" :key='"osaamisala"+index'
              class="ml-1" v-model="innerModel.osaamisala" :value="osaamisala" name="osaamisalaValinta">
            {{ $kaanna(osaamisala.nimi) }}
          </b-form-radio>
        </b-form-group>

        <b-form-group :label="$t('tutkintonimike') + ' *'" v-if="tyyppi ==='tutkintonimike'">
          <b-form-radio v-for="(tutkintonimike, index) in selectableTutkintonimikkeet" :key='"tutkintonimike"+index'
              class="ml-1" v-model="innerModel.tutkintonimike" :value="tutkintonimike" name="tutkintonimikeValinta">
            {{ $kaanna(tutkintonimike.nimi) }}
          </b-form-radio>
        </b-form-group>

        <b-form-group :label="$t('nimi') + ' *'" v-if="tyyppi ==='rakenne-moduuli-paikalliset'">
          <b-form-radio class="ml-1" v-model="nimiValinta" value="paikallinen" name="nimiValinta">
            {{ $t(nimiValintaTekstit['paikallinen']) }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="nimiValinta" value="tutkinnonosato" name="nimiValinta">
            {{ $t(nimiValintaTekstit['tutkinnonosato']) }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="nimiValinta" value="korkeakoulu" name="nimiValinta">
            {{ $t(nimiValintaTekstit['korkeakoulu']) }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="nimiValinta" value="yhteinen" name="nimiValinta">
            {{ $t(nimiValintaTekstit['yhteinen']) }}
          </b-form-radio>
          <b-form-radio class="ml-1" v-model="nimiValinta" value="muu" name="nimiValinta">
            {{ $t(nimiValintaTekstit['muu']) }}
          </b-form-radio>

          <ep-input class="mt-1 ml-4" is-editing v-model="innerModel.nimi" v-if="nimiValinta === 'muu' || tyyppi !=='rakenne-moduuli-paikalliset'"/>
          <ep-input class="mt-1 ml-4" is-editing value="" v-else :disabled="true"/>

        </b-form-group>

        <b-form-group :label="$t('laajuus')" v-if="innerModel.muodostumisSaanto">
          <div class="d-flex align-items-center">
            <div>
              <ep-input type="number" is-editing v-model="innerModel.muodostumisSaanto.laajuus.minimi">
              </ep-input>
            </div>
            <div class="ml-2" v-if="innerModel.muodostumisSaanto.laajuus.maksimi">
              -
            </div>
            <div class="ml-2" v-if="innerModel.muodostumisSaanto.laajuus.maksimi">
              <ep-input type="number" is-editing v-model="innerModel.muodostumisSaanto.laajuus.maksimi">
              </ep-input>
            </div>
            <div class="ml-2">
                {{$t('osaamispiste')}}
            </div>
          </div>
          <ep-toggle
            :value="!!innerModel.muodostumisSaanto.laajuus.maksimi"
            @input="toggleMaksimi"
            switch>
          {{ $t('aseta-myos-maksimiarvo') }}
          </ep-toggle>
        </b-form-group>
      </div>
      <div v-else>
        <b-form-group :label="$t('pakollisuus')">
          <ep-toggle v-model="value.pakollinen" switch>
            {{ $t('tutkinnon-osa-on-pakollinen') }}
          </ep-toggle>
        </b-form-group>
      </div>
      <b-form-group :label="$t('kuvaus')">
        <ep-content v-model="value.kuvaus" :is-editable="true" layout="normal"></ep-content>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import * as _ from 'lodash';
import { Kieli } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { Prop, Component, Vue, Watch, InjectReactive } from 'vue-property-decorator';

@Component({
  components: {
    EpButton,
    EpContent,
    EpIcon,
    EpInput,
    EpToggle,
  },
})

export default class EpRakenneModal extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: false })
  private tutkinnonOsatMap!: any;

  @InjectReactive('osaamisalat')
  private osaamisalat!: any[];

  @InjectReactive('tutkintonimikkeet')
  private tutkintonimikkeet!: any[];

  @Prop({ required: false, default: false, type: Boolean })
  private muokkaus!: boolean;

  private nimiValinta: 'paikallinen' | 'tutkinnonosato' | 'korkeakoulu' | 'yhteinen' | 'muu' | null = null;
  private tyyppi: string | null = null;
  private tempModel: any;
  private oldMaksimi = 1;

  private tyyppiRoolit = {
    'rakenne-moduuli-pakollinen': 'määritelty',
    'rakenne-moduuli-valinnainen': 'määritelty',
    'rakenne-moduuli-ammatilliset': 'määritelty',
    'rakenne-moduuli-yhteiset': 'vieras',
    'rakenne-moduuli-paikalliset': 'määrittelemätön',
  }

  set innerModel(innerModel) {
    this.$emit('input', innerModel);
  }

  get innerModel() {
    return this.value;
  }

  show(isNew?) {
    (this.$refs.rakenneModal as any).show();
    if (isNew) {
      this.tyyppi = null;
    }
    else {
      this.tyyppi = this.defaultTyyppi;
    }

    this.tempModel = _.cloneDeep(this.innerModel);
    this.setDefaultNimi();

    if (!this.innerModel.muodostumisSaanto) {
      this.$emit('input', { ...this.innerModel,
        muodostumisSaanto: {
          laajuus: {
            minimi: null,
            maksimi: null,
          },
        },
      });
    }

    if (this.innerModel.tutkintonimike) {
      this.$emit('input',
        {
          ...this.innerModel,
          tutkintonimike: _.find(this.selectableTutkintonimikkeet, tutkintonimike => this.innerModel.tutkintonimike.uri === tutkintonimike.uri),
        });
    }
  }

  save() {
    if (this.tyyppi === 'osaamisala') {
      this.innerModel = {
        ...this.innerModel,
        rooli: 'osaamisala',
        nimi: _.get(_.find(this.osaamisalat, osaamisala => osaamisala.osaamisala.osaamisalakoodiUri === this.innerModel.osaamisala.osaamisalakoodiUri), 'nimi'),
      };
    }
    else if (this.tyyppi === 'tutkintonimike') {
      this.innerModel = {
        ...this.innerModel,
        rooli: 'tutkintonimike',
        nimi: _.get(_.find(this.tutkintonimikkeet, tutkintonimike => tutkintonimike.tutkintonimike.uri === this.innerModel.tutkintonimike.uri), 'nimi'),
      };
    }
    else if (this.isRyhma && this.tyyppi && this.tyyppiRoolit[this.tyyppi]) {
      this.innerModel = {
        ...this.innerModel,
        rooli: this.tyyppiRoolit[this.tyyppi],
      };
    }

    this.$emit('save');
    (this.$refs.rakenneModal as any).hide();
  }

  remove() {
    this.$emit('remove');
    (this.$refs.rakenneModal as any).hide();
  }

  cancel() {
    this.$emit('input', this.tempModel);
    (this.$refs.rakenneModal as any).hide();
  }

  toggleRange() {
    this.innerModel.useRange = !this.innerModel.useRange;
    if (this.innerModel.useRange) {
      this.innerModel.ryhma.muodostumisSaanto.laajuus.maksimi = 0;
    }
    else {
      delete this.innerModel.ryhma.muodostumisSaanto.laajuus.maksimi;
    }
  }

  get defaultTyyppi() {
    if (this.value.rooli === 'osaamisala') {
      return 'osaamisala';
    }
    else if (this.value.rooli === 'tutkintonimike') {
      return 'tutkintonimike';
    }

    const rakennetyypit = [
      'osaamisala',
      'tutkintonimike',
      'rakenne-moduuli-valinnainen',
      'rakenne-moduuli-ammatilliset',
      'rakenne-moduuli-yhteiset',
      'rakenne-moduuli-paikalliset',
      'rakenne-moduuli-pakollinen',
    ];
    for (const rt of rakennetyypit) {
      if (this.value?.nimi?.fi === this.$t(rt, 'fi')) {
        return rt;
      }
    }

    return 'rakenne-moduuli-paikalliset';
  }

  setDefaultNimi() {
    if (this.tyyppi === 'rakenne-moduuli-paikalliset') {
      for (const nimiteksti of _.keys(this.nimiValintaTekstit)) {
        if (this.value?.nimi?.fi === this.$t(this.nimiValintaTekstit[nimiteksti], 'fi')) {
          this.nimiValinta = nimiteksti as any;
        }
      }

      if (!this.nimiValinta) {
        this.nimiValinta = 'muu';
      }
    }
  }

  toggleMaksimi(toggled) {
    if (!toggled) {
      if (this.innerModel.muodostumisSaanto.laajuus.maksimi) {
        this.oldMaksimi = this.innerModel.muodostumisSaanto.laajuus.maksimi;
      }
      this.innerModel.muodostumisSaanto.laajuus.maksimi = null;
    }
    else {
      this.innerModel.muodostumisSaanto.laajuus = {
        ...this.innerModel.muodostumisSaanto.laajuus,
        maksimi: this.oldMaksimi,
      };
    }
  }

  @Watch('nimiValinta')
  nimiValintaChange(newVal, oldVal) {
    if (this.nimiValinta !== null) {
      if (this.nimiValinta !== 'muu') {
        this.$emit('input', { ...this.innerModel, nimi: this.getNimi(this.nimiValintaTekstit[this.nimiValinta]) });
      }
      else if (oldVal) {
        this.$emit('input', { ...this.innerModel, nimi: null });
      }
    }
  }

  @Watch('tyyppi')
  tyyppiChange(newVal, oldVal) {
    let osaamisala = this.innerModel.osaamisala;
    if (this.tyyppi === 'osaamisala' && _.isNil(this.innerModel.osaamisala)) {
      osaamisala = {};
    }
    else if (this.tyyppi !== 'osaamisala') {
      osaamisala = null;
    }

    if (this.tyyppi && this.tyyppi !== 'rakenne-moduuli-paikalliset') {
      this.$emit('input', {
        ...this.innerModel,
        nimi: this.getNimi(this.tyyppi),
        osaamisala,
      });
    }
    else if (oldVal) {
      this.$emit('input', { ...this.innerModel, nimi: null });
    }
  }

  get nimiValintaTekstit() {
    return {
      'paikallinen': 'peruste-rakenne-nimi-paikallisiin',
      'tutkinnonosato': 'peruste-rakenne-nimi-tutkinnon-osa-toisesta',
      'korkeakoulu': 'peruste-rakenne-nimi-korkeakouluopinnot',
      'yhteinen': 'peruste-rakenne-nimi-yhteisten-tutkinnon-osien',
      'muu': 'peruste-rakenne-nimi-jokin-muu',
    };
  }

  getNimi(key: string) {
    return {
      fi: this.$t(key, Kieli.fi),
      sv: this.$t(key, Kieli.sv),
      en: this.$t(key, Kieli.en),
    };
  }

  get invalid() {
    if (this.tosa) {
      return false;
    }

    if (this.innerModel.nimi) {
      return _.isEmpty(this.innerModel.nimi[Kielet.getSisaltoKieli.value]) || this.tyyppi === null;
    }
    return true;
  }

  get isRyhma() {
    return !this.muokkaus || !!this.value.rooli;
  };

  get tosa() {
    if (!this.value._tutkinnonOsaViite) {
      return null;
    }
    if (this.tutkinnonOsatMap) {
      return this.tutkinnonOsatMap[this.value._tutkinnonOsaViite];
    }
  }

  get nimi() {
    if (this.isRyhma) {
      return this.value.nimi;
    }
    else {
      return this.tosa.nimi;
    }
  }

  get selectableOsaamisalat() {
    return _.map(this.osaamisalat, osaamisala => {
      return {
        nimi: osaamisala.nimi,
        osaamisalakoodiArvo: osaamisala.osaamisala.osaamisalakoodiArvo,
        osaamisalakoodiUri: osaamisala.osaamisala.osaamisalakoodiUri,
      };
    });
  }

  get selectableTutkintonimikkeet() {
    return _.map(this.tutkintonimikkeet, tutkintonimike => {
      return {
        nimi: tutkintonimike.nimi,
        arvo: tutkintonimike.tutkintonimike.arvo,
        uri: tutkintonimike.tutkintonimike.uri,
      };
    });
  }
}

</script>
