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
          <span v-if="kategoria.id" class="mr-2">{{ $t('muokkaa-teemaa')}}</span>
          <span v-else class="mr-2">{{ $t('lisaa-teema')}}</span>
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
        <EpInput v-model="kategoria.nimi" :is-editing="true"/>
      </b-form-group>
      <b-form-group :label="$t('kuvaus')">
        <EpInput v-model="kategoria.kuvaus" :is-editing="true"/>
      </b-form-group>
      <b-form-group :label="$t('kuva') + ' *'">
        <EpTiedostoInput v-if="!liite"
                         v-model="kategoria.liite"
                         @input="fileChanged"
                         :file-types="mimeTypes">
        </EpTiedostoInput>
        <div v-if="!liite">
          <span class="font-size-08">{{ imageInfoText }}</span>
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
      <EpButton v-if="kategoria.id"
                @click="poistaKategoria"
                :show-spinner="tallennetaan">
        {{ $t('poista') }}
      </EpButton>
      <EpButton @click="tallenna"
                class="ml-2"
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
import EpInput from '@shared/components/forms/EpInput.vue';
import * as _ from 'lodash';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';
import { Validations } from 'vuelidate-property-decorators';
import { requiredLokalisoituTeksti, notNull } from '@shared/validators/required';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import { Kieli } from '@shared/tyypit';
import EpTiedostoInput from '@shared/components/EpTiedosto/EpTiedostoInput.vue';

@Component({
  components: {
    EpButton,
    EpInput,
    EpMaterialIcon,
    EpKielivalinta,
    EpTiedostoInput,
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
  private requiredKielet: Kieli[] = [Kieli.fi, Kieli.sv];
  private mimeTypes: string[] = ['image/jpeg, image/png, image/svg+xml'];
  private allowedTypes: string = '.jpeg .png .svg';

  @Validations()
  validations = {
    kategoria: {
      nimi: requiredLokalisoituTeksti(this.requiredKielet),
      liite: {
        binarydata: notNull(),
      },
    },
  };

  async tallenna() {
    this.tallennetaan = true;
    try {
      await this.store.updateKategoria(this.kategoria);
      this.tallennetaan = false;
      this.$success(this.$t('teeman-paivitys-onnistui') as string);
      await this.store.fetchKategoriat();
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('teeman-paivitys-epaonnistui') as string);
    }
  }

  async poistaKategoria() {
    try {
      await this.store.deleteKategoria(this.kategoria.id);
      this.tallennetaan = false;
      this.$success(this.$t('teeman-poistaminen-onnistui') as string);
      await this.store.fetchKategoriat();
      this.sulje();
    }
    catch (err) {
      this.tallennetaan = false;
      this.$fail(this.$t('teeman-poistaminen-epaonnistui') as string);
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
          this.$fail(this.imageInfoText);
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

  avaaModal(kategoria) {
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

  get imageInfoText() {
    return this.$t('kuvan-maksimimitat') + ': ' + this.imageMaxDimension + '. ' + this.$t('sallitut-kuvaformaatit') + ': ' + this.allowedTypes;
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
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

</style>
