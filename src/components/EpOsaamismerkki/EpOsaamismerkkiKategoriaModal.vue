<template>
  <b-modal class="backdrop"
           id="osaamismerkkiKategoriaModal"
           ref="osaamismerkkiKategoriaModal"
           :no-close-on-backdrop="true"
           :no-enforce-focus="true"
           :lazy="true"
           size="xl"
           :hide-footer="true">
    <template slot="modal-header">
      <div class="row w-100">
        <div class="col">
          <span v-if="kategoria.id" class="mr-2">{{ $t('muokkaa-kategoriaa')}}</span>
          <span v-else class="mr-2">{{ $t('lisaa-kategoria')}}</span>
        </div>
        <div>
          <EpKielivalinta/>
        </div>
        <div class="close-btn clickable ml-3 pt-1" @click="sulje">
          <EpMaterialIcon aria-hidden="false" :aria-label="$t('sulje')">close</EpMaterialIcon>
        </div>
      </div>
    </template>

    <div class="mb-5">
      <b-form-group :label="$t('nimi') + ' *'">
        <EpField v-model="kategoria.nimi" :is-editing="true" :validation="$v.kategoria.nimi" :showValidValidation="false"/>
      </b-form-group>
      <b-form-group :label="$t('kuva') + ' *'">
        <div v-if="!liite" class="kuva-lataus tiedosto">
          <b-form-file v-model="kategoria.liite"
                       ref="file-input"
                       :accept="mimeTypes"
                       :placeholder="placeholder"
                       :drop-placeholder="dropPlaceholder"
                       :browse-text="browseText"
                       @input="fileChanged"></b-form-file>
        </div>
        <div v-if="!liite">
          <span class="font-size-08">{{ imageDimensionText }}</span>
        </div>
        <div>
          <img v-if="newImagePreviewUrl" :src="newImagePreviewUrl">
          <img v-if="liite && liite.binarydata && !newImagePreviewUrl" :src="savedImagePreviewUrl">
        </div>
        <div v-if="liite && liite.binarydata" class="clickable mt-2" @click="poistaKuva()">
          <span>{{ liite.nimi }}</span>
          <EpMaterialIcon class="default-icon ml-2">delete</EpMaterialIcon>
        </div>
      </b-form-group>
    </div>

    <div class="float-right">
      <EpButton @click="sulje"
                variant="link">
        {{ $t('peruuta') }}
      </EpButton>
      <EpButton @click="tallenna"
                :show-spinner="tallennetaan"
                :disabled="invalid">
        {{ $t('tallenna') }}
      </EpButton>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import * as _ from 'lodash';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import { Validations } from 'vuelidate-property-decorators';
import { requiredLokalisoituTeksti, notNull } from '@shared/validators/required';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpKuvaLataus from '@shared/components/EpKuvaLataus/EpKuvaLataus.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Kieli } from '@shared/tyypit';

@Component({
  components: {
    EpKuvaLataus,
    EpButton,
    EpField,
    EpTiedostoLataus,
    EpMaterialIcon,
    EpKielivalinta,
  },
})
export default class EpOsaamismerkkiKategoriaModal extends Vue {
  @Prop({ required: true })
  private store!: OsaamismerkitStore;

  private tallennetaan: boolean = false;
  private kategoria: OsaamismerkkiKategoriaDto = {};
  private newImagePreviewUrl: string | null = null;
  private imageWidth: number = 0;
  private imageHeight: number = 0;
  private imageMaxDimension: string = '200x200';
  private requiredKielet: Kieli[] = [Kieli.fi, Kieli.sv]
  private mimeTypes: string = 'image/jpeg, image/png, image/svg+xml';

  @Validations()
  validations = {
    kategoria: {
      nimi: requiredLokalisoituTeksti(this.requiredKielet),
      liite: {
        binarydata: notNull(),
      },
    },
  }

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.store.updateKategoria(this.kategoria);
      this.tallennetaan = false;
      this.$success(this.$t('kategorian-paivitys-onnistui') as string);
      await this.store.fetchKategoriat();
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('kategorian-paivitys-epaonnistui') as string);
    }
  }

  async fileChanged(file: File) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt: any) => {
      let img = new Image();
      img.onload = () => {
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        if (reader.result && this.isValidImage()) {
          this.newImagePreviewUrl = evt.target.result;
          this.kategoria.liite = {
            binarydata: reader.result.toString().split(',')[1],
            nimi: file.name,
          };
        }
        else {
          this.kategoria.liite = undefined;
          this.$fail(this.imageDimensionText);
        }
      };
      img.src = evt.target.result;
    };
  }

  poistaKuva() {
    this.kategoria.liite = undefined;
    this.newImagePreviewUrl = null;
  }

  sulje() {
    this.clear();
    (this.$refs['osaamismerkkiKategoriaModal'] as any).hide();
  }

  muokkaa(kategoria) {
    if (kategoria) {
      this.kategoria = _.cloneDeep(kategoria);
    }
    (this.$refs['osaamismerkkiKategoriaModal'] as any).show();
  }

  clear() {
    this.kategoria = {};
    this.newImagePreviewUrl = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
  }

  isValidImage() {
    return this.imageWidth <= 200 && this.imageHeight <= 200;
  }

  get imageDimensionText() {
    return this.$t('kuvan-maksimimitat') + ': ' + this.imageMaxDimension as string;
  }

  get liite() {
    return this.kategoria.liite;
  }

  get invalid() {
    return this.$v.$invalid;
  }

  get savedImagePreviewUrl() {
    return this.liite ? 'data:' + this.liite.mime + ';base64,' + this.liite.binarydata : null;
  }

  get placeholder() {
    return this.$t('fu-placeholder');
  }

  get dropPlaceholder() {
    return this.$t('fu-placeholder');
  }

  get browseText() {
    return this.$t('fu-browse-text');
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.error {
  color: $invalid;
}

.kuva-lataus {
  margin: 0;
  width:100%;
  border-width: 1px;
  border-color: $gray-lighten-2;
  border-style: dashed;
  border-radius: 10px;
  position: relative;

  &.tiedosto {
    height: 100px;
    background-color: $gray-lighten-7;
  }

  .custom-file::v-deep{
    height: 100%;
    flex-direction: column;
    justify-content: center;
    display: flex;

    input {
      display: none;
    }

    .custom-file-label {
      width: 100%;
      background-image: url('~@assets/img/icons/lataus_ikoni.svg');
      background-repeat: no-repeat;
      background-position: left;
      border: 0;
      margin-left: 30px;
      margin-top: 10px;
      height: 50px;
      background-color: inherit;
      padding-top: 0;
      padding-left: 60px;
      position: relative;
      border-radius: 0;
    }

    .custom-file-label::after {
      text-decoration: underline;
      color: blue;
      padding: 0 0 0 0.20rem;
      display: inline;
      position: relative;
      background-color: $gray-lighten-7;
    }
  }
}
</style>
