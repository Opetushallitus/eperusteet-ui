<template>
  <ep-main-view container>
    <EpEditointi :store="store" :confirmRemove="false">
      <template v-slot:customheader="{ data, isEditing, cancel, save, disabled, validation, isSaving, modify, remove, editable }">
        <div class="d-flex justify-content-between header py-2" :class="{'editing': isEditing}">
          <h1 class="mb-4 mr-auto">{{ $t(header) }}</h1>

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

          <EpSpinner v-if="isSaving" />
        </div>
      </template>

      <template v-slot:default="{ data, isEditing, supportData }">

        <div v-if="!isEditing">
          <b-form-group :label="$t('tila')">
            <span v-if="data.tila">{{$t(data.tila.toLowerCase())}} - {{ $t('muokannut-viimeksi')}}: </span>
            <span v-if="muokkaajaNimi">{{ muokkaajaNimi }} </span>
            <span v-else>{{ data.muokkaaja }} </span>
            <span v-if="data.muokattu">{{$sdt(data.muokattu)}}</span>
          </b-form-group>
        </div>

        <b-form-group class="mt-4">
          <template #label>
            <div class="d-flex">
              <div>{{$t('tyyppi') + isRequired }}</div>
              <EpInfoPopover class="ml-3" v-if="isEditing"><div v-html="$t('maarays-muokkaus-tyyppi-info-selite')" /></EpInfoPopover>
            </div>
          </template>
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
              <div v-if="isEditing">{{$t('alkaa')}}{{ isRequired }}</div>
              <ep-datepicker v-model="data.voimassaoloAlkaa" :is-editing="isEditing" />
            </div>
            <div class="ml-2 mr-2" :class="{'mt-4': isEditing}">-</div>
            <div>
              <div v-if="isEditing">{{$t('paattyy')}}</div>
              <ep-datepicker v-model="data.voimassaoloLoppuu" :is-editing="isEditing" v-if="data.voimassaoloLoppuu || isEditing"/>
            </div>
          </div>
        </b-form-group>

        <b-form-group :label="$t('maarayksen-paatospaivamaara') + isRequired" class="mt-4 d-flex">
          <ep-datepicker v-model="data.maarayspvm" :is-editing="isEditing" />
        </b-form-group>

        <b-form-group :label="$t('maaraysdokumentti') + ' (pdf) ' + isRequired" class="mt-4">
          <div v-if="maarayskirje">
            <a :href="maarayskirjeUrl" target="_blank" rel="noopener noreferrer">{{ maarayskirje.nimi }}</a>
          </div>
          <EpMaaraysLiitteet v-else v-model="data.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="MAARAYSDOKUMENTTI" yksittainen/>
        </b-form-group>

        <b-form-group :label="liittyykoToiseenMaaraykseenOtsikko" class="mt-4">
          <EpMaaraysLiittyyMuuttaaValinta v-model="storeData" :maarayksetNimella="supportData.maarayksetNimella" :isEditing="isEditing" />
        </b-form-group>

        <b-form-group :label="$t('koulutus-tai-tutkinto')" class="mt-4">
          <EpMaarayskokoelmaKoulutustyyppiSelect v-model="data.koulutustyypit" :isEditing="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('asiasana')" class="mt-4">
          <EpMaaraysAsiasanat v-model="data.asiasanat[kieli].asiasana" :asiasanat="asiasanat" :isEditing="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('kuvaus') + isRequired" class="mt-4">
          <ep-content v-model="data.kuvaus" layout="simplified_w_links" :is-editable="isEditing"/>
        </b-form-group>

        <b-form-group :label="$t('liitteet') + ' (pdf)'" class="mt-4 mb-5">
          <EpMaaraysLiitteet v-model="data.liitteet[kieli].liitteet" :isEditing="isEditing" :tyyppi="LIITE" nimisyote/>
        </b-form-group>

      </template>
    </EpEditointi>
  </ep-main-view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
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
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { nimiSearchIdentity } from '@shared/utils/helpers';
import EpMaaraysLiittyyMuuttaaValinta from '@/components/maaraykset/EpMaaraysLiittyyMuuttaaValinta.vue';
import EpMaaraysAsiasanat from '@/components/maaraykset/EpMaaraysAsiasanat.vue';
import EpMaaraysLiitteet from '@/components/maaraykset/EpMaaraysLiitteet.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kielet } from '@shared/stores/kieli';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMaarayskokoelmaKoulutustyyppiSelect from '@shared/components/EpMaarayskokoelmaKoulutustyyppiSelect/EpMaarayskokoelmaKoulutustyyppiSelect.vue';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';

const route = useRoute();
const instance = getCurrentInstance();

const store = ref<EditointiStore | null>(null);
const LUONNOS = MaaraysDtoTilaEnum.LUONNOS;
const JULKAISTU = MaaraysDtoTilaEnum.JULKAISTU;
const LIITE = MaaraysLiiteDtoTyyppiEnum.LIITE;
const MAARAYSDOKUMENTTI = MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI;
const EILIITY = MaaraysDtoLiittyyTyyppiEnum.EILIITY;
const MUUTTAA = MaaraysDtoLiittyyTyyppiEnum.MUUTTAA;
const KORVAA = MaaraysDtoLiittyyTyyppiEnum.KORVAA;

const maaraysliittyy = ref<'eiliity' | 'muuttaa' | 'korvaa'>('eiliity');
const arvioinninTyyppi = ref<'geneerinen' | 'tutkinnonosa-kohtainen' | null>(null);

onMounted(() => {
  Murupolku.aseta('maaraysMuokkaus', $t(header.value), {
    name: 'maaraysMuokkaus',
  });
});

const maaraysId = computed(() => {
  if (route.params.maaraysId === 'uusi') {
    return route.params.maaraysId;
  }

  return _.toNumber(route.params.maaraysId);
});

// Initialize the store when maaraysId changes
watch(maaraysId, (newId) => {
  const tkstore = new MaarayksetEditStore(newId, instance?.proxy as any);
  store.value = new EditointiStore(tkstore as any);
}, { immediate: true });

const tyypit = computed(() => {
  return [
    MaaraysDtoTyyppiEnum.OPETUSHALLITUKSENMUU,
    MaaraysDtoTyyppiEnum.AMMATILLINENMUU,
    MaaraysDtoTyyppiEnum.PERUSTE,
  ];
});

const isUusi = computed(() => {
  return maaraysId.value === 'uusi';
});

const header = computed(() => {
  return isUusi.value ? 'lisaa-maarays' : 'maarays';
});

const storeData = computed({
  get() {
    return store.value?.data.value;
  },
  set(data) {
    store.value?.setData(data);
  },
});

const tallenna = async (tila, save) => {
  store.value?.setData({
    ...store.value?.data.value,
    tila,
  });

  await save();
};

const isRequired = computed(() => {
  return store.value?.isEditing.value ? ' *' : '';
});

const muokkaajaNimi = computed(() => {
  return parsiEsitysnimi(store.value?.data.value?.muokkaajaKayttaja);
});

const liittyyTyyppi = computed(() => {
  return store.value?.data.value?.liittyyTyyppi;
});

// Watch liittyyTyyppi changes
watch(liittyyTyyppi, (newType) => {
  if (newType !== MaaraysDtoLiittyyTyyppiEnum.MUUTTAA) {
    store.value?.setData({
      ...store.value?.data.value,
      muutettavatMaaraykset: [],
    });
  }

  if (newType !== MaaraysDtoLiittyyTyyppiEnum.KORVAA) {
    store.value?.setData({
      ...store.value?.data.value,
      korvattavatMaaraykset: [],
    });
  }
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const liittyykoToiseenMaaraykseenOtsikko = computed(() => {
  if (store.value?.isEditing.value) {
    return $t('maarayksen-liittyminen-aiempaan-maaraykseen') + isRequired.value;
  }

  if (store.value?.data.value?.liittyyTyyppi === EILIITY) {
    return $t('ei-liity-toiseen-maaraykseen');
  }

  if (store.value?.data.value?.liittyyTyyppi === MUUTTAA) {
    return $t('muuttaa-maaraysta');
  }

  if (store.value?.data.value?.liittyyTyyppi === KORVAA) {
    return $t('korvaa-maarayksen');
  }

  return '';
});

const poista = async (remove) => {
  const varmistaPoisto = await $bvModal.msgBoxConfirm(
    $t('maarays-poisto-varmistus-teksti'), {
      title: $t('poista-maarays'),
      okTitle: $t('poista'),
      cancelTitle: $t('peruuta'),
      size: 'sm',
    });

  if (varmistaPoisto) {
    await remove();
  }
};

const peruste = computed(() => {
  return store.value?.supportData.value?.peruste;
});

const maarayskirje = computed(() => {
  return peruste.value?.maarayskirje?.liitteet[kieli.value] || null;
});

const maarayskirjeUrl = computed(() => {
  if (peruste.value && !_.find(storeData.value?.liitteet[kieli.value]?.liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI) && maarayskirje.value) {
    return `${baseURL}/perusteet/${peruste.value.id}/liitteet/${maarayskirje.value.id}`;
  }
  else {
    return null;
  }
});

const asiasanat = computed(() => {
  if (_.isEmpty(store.value?.supportData.value?.asiasanat[kieli.value])) {
    return [];
  }

  return store.value?.supportData.value?.asiasanat[kieli.value];
});
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

:deep(.editointikontrolli .sisalto) {
  padding: 0;
}

.header {
  background: $white;

  &.editing {
    border-bottom: 1px solid #E7E7E7;
  }
}
</style>
