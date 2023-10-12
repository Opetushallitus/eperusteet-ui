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
      </div>
    </template>

    <div class="mb-5">
      <b-form-group :label="$t('nimi') + ' *'">
        <EpField v-model="kategoria.nimi" :is-editing="true" :validation="$v.kategoria.nimi" :showValidValidation="false"/>
      </b-form-group>
      <b-form-group :label="$t('kuva') + ' *'">
        <b-form-file ref="file-input" v-if="!kategoria.liite" accept="image/jpeg,image/png" :placeholder="placeholder" :drop-placeholder="dropPlaceholder" :browse-text="browseText" @input="fileChanged"></b-form-file>

        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" width="200" height="200">

        <div v-if="kategoria.liite && kategoria.liite.nimi" class="clickable mt-2" @click="poistaKuva()">
          <span>{{ kategoria.liite.nimi }}</span>
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
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpKuvaLataus from '@shared/components/EpKuvaLataus/EpKuvaLataus.vue';

@Component({
  components: {
    EpKuvaLataus,
    EpButton,
    EpField,
    EpTiedostoLataus,
    EpMaterialIcon,
  },
})
export default class EpOsaamismerkkiKategoriaModal extends Vue {
  @Prop({ required: true })
  private store!: OsaamismerkitStore;

  private tallennetaan: boolean = false;
  private kategoria: OsaamismerkkiKategoriaDto = {};
  private imagePreviewUrl: string | null = null;
  private imageWidth: number = 0;
  private imageHeight: number = 0;

  @Validations()
  validations = {
    kategoria: {
      nimi: {
        ...requiredLokalisoituTeksti(),
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
          this.imagePreviewUrl = evt.target.result;
          this.kategoria.liite = {
            binarydata: reader.result.toString().split(',')[1],
            nimi: file.name,
          };
        }
        else {
          this.$fail(this.$t('kuvan-maksimi-koko') as string);
        }
      };
      img.src = evt.target.result;
    };
  }

  poistaKuva() {
    this.kategoria.liite = undefined;
    this.imagePreviewUrl = null;
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
    this.imagePreviewUrl = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
  }

  isValidImage() {
    return this.imageWidth <= 200 && this.imageHeight <= 200;
  }

  get invalid() {
    return this.$v.$invalid || !this.kategoria.liite;
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
</style>
