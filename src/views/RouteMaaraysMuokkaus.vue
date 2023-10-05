<template>
  <ep-main-view container>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t(header) }}</h1>
      </div>
    </template>

    <EpEditointi :store="store" :confirmRemove="false">
      <template v-slot:default="{ data, isEditing, validation, supportData }">

        <div v-if="!isEditing">
          <b-form-group :label="$t('tila')">
            <span v-if="data.tila">{{$t(data.tila.toLowerCase())}} - {{ $t('muokannut-viimeksi')}}: </span>
            <span v-if="muokkaajaNimi">{{ muokkaajaNimi }} </span>
            <span v-else>{{ data.muokkaaja }} </span>
            <span>{{$sdt(data.muokattu)}}</span>
          </b-form-group>
        </div>

        <b-form-group :label="$t('tyyppi') + isRequired" class="mt-4">
          <template v-if="isEditing">
            <b-form-radio v-for="tyyppi in tyypit" v-model="data.tyyppi" :value="tyyppi" :key="'tyyppivalinta_'+tyyppi">
              {{ $t('maarays-tyyppi-' + tyyppi.toLowerCase()) }}
            </b-form-radio>
          </template>
          <div v-else>
            {{ $t('maarays-tyyppi-' + data.tyyppi.toLowerCase()) }}
            <span v-if="data.peruste">(<router-link :to="{ name : 'perusteprojekti', params: { projektiId: data.peruste._perusteprojekti }}">{{$kaanna(data.peruste.nimi)}}</router-link>)
            </span>
          </div>
        </b-form-group>

        <b-form-group :label="$t('maarayksen-nimi') + isRequired" class="mt-4">
          <ep-input v-model="data.nimi" :is-editing="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('maarayksen-diaarinumero') + isRequired" class="mt-4">
          <ep-input v-model="data.diaarinumero" :is-editing="isEditing" type="string"/>
        </b-form-group>

        <b-form-group :label="$t('voimassaolo')" class="mt-4">
          <div class="d-flex align-items-center">
            <div>
              <div v-if="isEditing">{{$t('alkaen')}}{{ isRequired }}</div>
              <ep-datepicker v-model="data.voimassaoloAlkaa" :is-editing="isEditing" />
            </div>
            <div class="ml-2 mr-2" :class="{'mt-4': isEditing}">-</div>
            <div>
              <div v-if="isEditing">{{$t('paattyen')}}</div>
              <ep-datepicker v-model="data.voimassaoloLoppuu" :is-editing="isEditing" v-if="data.voimassaoloLoppuu || isEditing"/>
            </div>
          </div>
        </b-form-group>

        <b-form-group :label="$t('maarays-annettu') + isRequired" class="mt-4 d-flex">
          <ep-datepicker v-model="data.maarayspvm" :is-editing="isEditing" />
        </b-form-group>

        <b-form-group :label="$t('maaraysdokumentti') + isRequired" class="mt-4">
          <div v-if="maarayskirje">
            <a :href="maarayskirjeUrl" target="_blank" rel="noopener noreferrer">{{ maarayskirje.nimi }}</a>
          </div>
          <EpMaaraysLiitteet v-else v-model="data.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="MAARAYSDOKUMENTTI" yksittainen/>
        </b-form-group>

        <b-form-group :label="liittyykoToiseenMaaraykseenOtsikko" class="mt-4">
          <EpMaaraysLiittyyMuuttaaValinta v-model="storeData" :maarayksetNimella="supportData.maarayksetNimella" :isEditing="isEditing" />
        </b-form-group>

        <b-form-group :label="$t('koulutustyyppi') + isRequired" class="mt-4">
          <EpMaaraysKoulutustyypit v-model="data.koulutustyypit" :isEditing="isEditing" />
        </b-form-group>

        <b-form-group :label="$t('asiasana')" class="mt-4">
          <EpMaaraysAsiasanat v-model="data.asiasanat[kieli].asiasana" :asiasanat="supportData.asiasanat[kieli]" :isEditing="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('kuvaus') + isRequired" class="mt-4">
          <ep-content v-model="data.kuvaus" layout="simplified" :is-editable="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('liitteet')" class="mt-4 mb-5">
          <EpMaaraysLiitteet v-model="data.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="LIITE" nimisyote/>
        </b-form-group>

      </template>

      <template v-slot:footer="{ data, isEditing, cancel, save, disabled, validation, isSaving, modify, remove, editable }">
        <div class="d-flex justify-content-end">
          <router-link :to="{ name:'maarayskokoelma'}" class="mr-auto">
            <ep-button v-if="!isEditing "
                        variant="link"
                        icon="undo">
              {{ $t('takaisin') }}
            </ep-button>
          </router-link>
          <ep-button class="ml-4"
                      v-if="!isEditing && data.id"
                      @click="poista(remove)"
                      :disabled="disabled || !editable"
                      variant="link"
                      icon="delete"
                      v-oikeustarkastelu="{oikeus:'poisto', kohde: 'eperusteet_maarays'}"
                      >
            {{ $t('poista') }}
          </ep-button>
          <ep-button class="ml-4"
                      v-if="isEditing"
                      @click="cancel()"
                      :disabled="disabled"
                      variant="link">
            {{ $t('peruuta') }}
          </ep-button>
          <ep-button class="ml-4"
                      @click="tallenna(LUONNOS, save)"
                      v-if="isEditing"
                      :disabled="disabled || (validation && validation.$invalid)"
                      variant="primary">
            {{ $t('tallenna-luonnoksena') }}
          </ep-button>
          <ep-button class="ml-4"
                      @click="tallenna(JULKAISTU, save)"
                      v-if="isEditing"
                      :disabled="disabled || (validation && validation.$invalid)"
                      variant="primary">
            {{ $t('tallenna-ja-julkaise') }}
          </ep-button>

          <ep-button class="ml-4"
                      v-if="!isEditing"
                      @click="modify()"
                      :disabled="disabled || !editable"
                      variant="link"
                      icon="edit"
                      v-oikeustarkastelu="{oikeus:'muokkaus', kohde: 'eperusteet_maarays'}"
                      >
            {{ $t('muokkaa') }}
          </ep-button>

          <EpSpinner v-if="isSaving" />
        </div>

      </template>
    </EpEditointi>
  </ep-main-view>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import { Murupolku } from '@shared/stores/murupolku';
import { MaaraysDtoTyyppiEnum, MaaraysDtoTilaEnum, MaaraysLiiteDtoTyyppiEnum, MaaraysDtoLiittyyTyyppiEnum, baseURL } from '@shared/api/eperusteet';
import { MaarayksetEditStore } from '@/stores/MaarayksetEditStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { nimiSearchIdentity } from '@shared/utils/helpers';
import EpMaaraysLiittyyMuuttaaValinta from '@/components/maaraykset/EpMaaraysLiittyyMuuttaaValinta.vue';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpMaaraysLiitteet from '@/components/maaraykset/EpMaaraysLiitteet.vue';
import EpMaaraysKoulutustyypit from '@/components/maaraykset/EpMaaraysKoulutustyypit.vue';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpMainView,
    EpEditointi,
    EpButton,
    EpContent,
    EpInput,
    EpDatepicker,
    KoulutustyyppiSelect,
    EpTiedostoLataus,
    EpMaterialIcon,
    EpMultiSelect,
    EpSpinner,
    EpMaaraysAsiasanat,
    EpMaaraysLiitteet,
    EpMaaraysKoulutustyypit,
    EpMaaraysLiittyyMuuttaaValinta,
  },
})
export default class RouteMaaraysMuokkaus extends Vue {
  private store: EditointiStore | null = null;
  private LUONNOS = MaaraysDtoTilaEnum.LUONNOS;
  private JULKAISTU = MaaraysDtoTilaEnum.JULKAISTU;
  private LIITE = MaaraysLiiteDtoTyyppiEnum.LIITE;
  private MAARAYSDOKUMENTTI = MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI;
  private EILIITY = MaaraysDtoLiittyyTyyppiEnum.EILIITY
  private MUUTTAA = MaaraysDtoLiittyyTyyppiEnum.MUUTTAA
  private KORVAA = MaaraysDtoLiittyyTyyppiEnum.KORVAA

  private maaraysliittyy: 'eiliity' | 'muuttaa' | 'korvaa' = 'eiliity';
  private nimiSearchIdentity = nimiSearchIdentity;

  mounted() {
    Murupolku.aseta('maaraysMuokkaus', this.$t(this.header), {
      name: 'maaraysMuokkaus',
    });
  }

  @Watch('maaraysId', { immediate: true })
  maaraysIdChange() {
    const tkstore = new MaarayksetEditStore(this.maaraysId, this);
    this.store = new EditointiStore(tkstore);
  }

  get tyypit() {
    return [
      MaaraysDtoTyyppiEnum.OPETUSHALLITUKSENMUU,
      MaaraysDtoTyyppiEnum.AMMATILLINENMUU,
      MaaraysDtoTyyppiEnum.PERUSTE,
    ];
  }

  get isUusi() {
    return this.maaraysId === 'uusi';
  }

  get header() {
    return this.isUusi ? 'lisaa-maarays' : 'maarays';
  }

  get maaraysId() {
    if (this.$route.params.maaraysId === 'uusi') {
      return this.$route.params.maaraysId;
    }

    return _.toNumber(this.$route.params.maaraysId);
  }

  get storeData() {
    return this.store?.data.value;
  }

  set storeData(data) {
    this.store?.setData(data);
  }

  async tallenna(tila, save) {
    this.store?.setData({
      ...this.store.data.value,
      tila,
    });

    await save();
  }

  get isRequired() {
    return this.store?.isEditing.value ? ' *' : '';
  }

  get muokkaajaNimi() {
    return parsiEsitysnimi(this.store?.data.value?.muokkaajaKayttaja);
  }

  get liittyyTyyppi() {
    return this.store?.data.value?.liittyyTyyppi;
  }

  @Watch('liittyyTyyppi')
  liittyyTyyppiChange() {
    if (this.liittyyTyyppi !== MaaraysDtoLiittyyTyyppiEnum.MUUTTAA) {
      this.store?.setData({
        ...this.store.data.value,
        muutettavatMaaraykset: [],
      });
    }

    if (this.liittyyTyyppi !== MaaraysDtoLiittyyTyyppiEnum.KORVAA) {
      this.store?.setData({
        ...this.store.data.value,
        korvattavatMaaraykset: [],
      });
    }
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get liittyykoToiseenMaaraykseenOtsikko() {
    if (this.store?.isEditing.value) {
      return this.$t('liittyyko-maarays-toiseen-maaraykseen') + this.isRequired;
    }

    if (this.store?.data.value.liittyyTyyppi === this.EILIITY) {
      return this.$t('ei-liity-toiseen-maaraykseen');
    }

    if (this.store?.data.value.liittyyTyyppi === this.MUUTTAA) {
      return this.$t('muuttaa-maaraysta');
    }

    if (this.store?.data.value.liittyyTyyppi === this.KORVAA) {
      return this.$t('korvaa-maarayksen');
    }
  }

  async poista(remove) {
    const varmistaPoisto = await this.$bvModal.msgBoxConfirm(
          this.$t('maarays-poisto-varmistus-teksti') as any, {
            title: this.$t('poista-maarays') as any,
            okTitle: this.$t('poista') as any,
            cancelTitle: this.$t('peruuta') as any,
            size: 'sm',
          });

    if (varmistaPoisto) {
      await remove();
    }
  }

  get maarayskirje() {
    return this.peruste?.maarayskirje?.liitteet[this.kieli] || null;
  }

  get maarayskirjeUrl() {
    if (this.peruste && !_.find(this.storeData?.liitteet[this.kieli].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI) && this.maarayskirje) {
      return `${baseURL}/perusteet/${this.peruste.id!}/liitteet/${this.maarayskirje.id}`;
    }
    else {
      return null;
    }
  }

  get peruste() {
    return this.store?.supportData.value?.peruste;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  ::v-deep .editointikontrolli .sisalto {
    padding: 0;
  }

</style>
