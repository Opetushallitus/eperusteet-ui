<template>
  <div>
    <h4 v-if="isEditing" class="mt-4">{{$t('tavoitteen-nimi')}}</h4>
    <ep-input v-if="isEditing" v-model="model.tavoite" :is-editing="isEditing"></ep-input>

    <h4 class="mt-4">{{$t('tavoitteista-johdetut-oppimisen-tavoitteet')}}</h4>
    <ep-content layout="normal" v-model="model.tavoitteistaJohdetutOppimisenTavoitteet" :is-editable="isEditing"> </ep-content>

    <h4 class="mt-4">{{$t('tavoitealue')}}</h4>
    <b-row>
      <b-col cols="10">
        <ep-select v-if="isEditing"
                  v-model="kohdealue"
                  :items="supportData.kohdealueet"
                  :is-editing="isEditing"
                  :enable-empty-option="true"
                  :placeholder="'valitse'"
                  :emptyOptionDisabled="true">
          <template slot-scope="{ item }">
            {{$kaanna(item.nimi)}}
          </template>
        </ep-select>
        <div v-else>
          <span v-if="kohdealue">{{$kaanna(kohdealue.nimi)}}</span>
          <span v-else class="disabled-text">{{$t('ei-asetettu')}}</span>
        </div>
      </b-col>
      <b-col cols="2">
        <ep-button v-if="isEditing" variant="link" @click="kohdealue=null">{{ $t('tyhjenna-valinta') }}</ep-button>
      </b-col>
    </b-row>

    <h4 class="mt-4">{{$t('laaja-alainen-osaaminen')}}</h4>
    <ep-collapse class="mb-3" v-for="(lao, index) in laajaAlaisetOsaamiset" :key="'lao' + index" :border-bottom="false" :usePadding="false" chevronLocation="left" :expandedByDefault="false">
      <template #header>
        <div class="d-flex">
          <div>{{ $kaanna(lao.nimi)}}</div>
          <div v-if="isEditing" class="default-icon clickable ml-3 mt-1" @click="poistaLaajaAlainenOsaaminen(lao)">
            <EpMaterialIcon>delete</EpMaterialIcon>
          </div>
        </div>
      </template>
      <ep-content class="ml-4 pl-1" layout="normal" v-model="lao.kuvaus" :is-editable="false"> </ep-content>
    </ep-collapse>

    <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alainen-osaaminen')" variant="primary">
      <b-dropdown-item-button
        @click="lisaaLaajaAlainenOsaaminen(laaja)"
        v-for="(laaja, index) in laajaAlaisetOsaamisetValinnat"
        :key="index+'addlaaja'"
        :disabled="laaja.valittu">
        {{ $kaanna(laaja.nimi) }}
      </b-dropdown-item-button>
    </b-dropdown>

    <template v-if="sisaltoalueetValinnat">
      <h4 class="mt-4">{{$t('sisaltoalueet')}}</h4>
      <ep-collapse class="mb-3" v-for="(sisaltoalue, index) in sisaltoalueet" :key="'sisaltoalue' + index" :border-bottom="false" :usePadding="false" chevronLocation="left" :expandedByDefault="false">
        <template #header>
          <div class="d-flex">
            <div>{{ $kaanna(sisaltoalue.nimi)}}</div>
            <div v-if="isEditing" class="default-icon clickable ml-3 mt-1" @click="poistaSisaltoalue(sisaltoalue)">
              <EpMaterialIcon>delete</EpMaterialIcon>
            </div>
          </div>
        </template>
        <ep-content class="ml-4 pl-1" layout="normal" v-model="sisaltoalue.kuvaus" :is-editable="false"> </ep-content>
      </ep-collapse>

      <b-dropdown v-if="isEditing" :text="$t('lisaa-sisaltoalue')" variant="primary">
        <b-dropdown-item-button
          @click="lisaaSisaltoalue(sisaltoalue)"
          v-for="(sisaltoalue, index) in sisaltoalueetValinnat"
          :key="index+'addSisaltoalue'"
          :disabled="sisaltoalue.valittu">
          {{ $kaanna(sisaltoalue.nimi) }}
        </b-dropdown-item-button>
      </b-dropdown>
    </template>

    <h4 class="mt-4">{{$t('arvoinnin-kohde')}}</h4>
    <ep-input v-model="model.arvioinninKuvaus" :is-editing="isEditing"></ep-input>

    <div class="mt-4" v-if="isEditing">
      <h4>{{$t('osaamisen-arvioinnin-otsikko')}}</h4>
      <ep-input v-model="model.arvioinninOtsikko" :is-editing="isEditing"></ep-input>
    </div>
    <h4 class="mt-4" v-else >{{$kaanna(model.arvioinninOtsikko)}}</h4>

    <b-row class="mt-4 border-bottom-2 mx-1">
      <b-col cols="4">
        <h5>{{ $t('arviointitaulukko-arvosana-otsikko') }}</h5>
      </b-col>
      <b-col cols="8">
        <h5>{{ $t('arviointitaulukko-osaaminen-otsikko') }}</h5>
      </b-col>
    </b-row>

<<<<<<< HEAD
    <b-row
      class="mt-2 mx-1 py-2"
      v-for="(arvioinninkohde, index) in model.arvioinninkohteet"
      :key="'arvio'+index"
      :class="{'listaus': !isEditing, 'border-bottom': isEditing}">
      <b-col cols="4">
        <ep-select v-if="isEditing"
                  v-model="arvioinninkohde.arvosana"
                  :items="arvosanat"
                  :is-editing="isEditing"
                  :enable-empty-option="true"
                  :placeholder="'valitse'"
                  :emptyOptionDisabled="true">
          <template slot-scope="{ item }">
            {{$t('osaamisen-kuvaus-arvosanalle_' + item)}}
          </template>
        </ep-select>
        <div v-else>{{ $t('osaamisen-kuvaus-arvosanalle_' + arvioinninkohde.arvosana) }}</div>
      </b-col>
      <b-col cols="7">
        <ep-input v-model="arvioinninkohde.osaamisenKuvaus" :is-editing="isEditing"></ep-input>
      </b-col>
      <b-col cols="1" class="text-center">
        <div v-if="isEditing" class="default-icon clickable mt-2" @click="poistaArviointi(arvioinninkohde)">
          <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
        </div>
      </b-col>
    </b-row>
=======
    <template v-if="isEditing">
      <b-row
        class="mt-2 mx-1 py-2 border-bottom"
        v-for="(arvioinninkohde, index) in model.arvioinninkohteet"
        :key="'arvio'+index">
        <b-col cols="4">
          <ep-select v-model="arvioinninkohde.arvosana"
                    :items="arvosanat"
                    :is-editing="isEditing"
                    :enable-empty-option="true"
                    :placeholder="'valitse'"
                    :emptyOptionDisabled="true">
            <template slot-scope="{ item }">
              {{$t('osaamisen-kuvaus-arvosanalle_' + item)}}
            </template>
          </ep-select>
        </b-col>
        <b-col cols="7">
          <ep-input v-model="arvioinninkohde.osaamisenKuvaus" :is-editing="isEditing"></ep-input>
        </b-col>
        <b-col cols="1" class="text-center">
          <fas icon="roskalaatikko" class="default-icon clickable mt-2" @click="poistaArviointi(arvioinninkohde)"/>
        </b-col>
      </b-row>
    </template>

    <template v-else>
      <b-row class="mt-2 mx-1 py-2 listaus" v-for="(arvioinninkohde, index) in arvioinninKohteetSorted" :key="'arvio'+index">
        <b-col cols="4">
          <div>{{ $t('osaamisen-kuvaus-arvosanalle_' + arvioinninkohde.arvosana) }}</div>
        </b-col>
        <b-col cols="7">
          {{$kaanna(arvioinninkohde.osaamisenKuvaus)}}
        </b-col>
      </b-row>
    </template>
>>>>>>> 1e51dae (EP-3779-2)

    <ep-button class="mt-3" @click="lisaaArvosanaRivi" variant="outline" icon="add" v-if="isEditing">
      {{ $t('lisaa-rivi') }}
    </ep-button>

    <h4 class="mt-4">{{$t('vapaa-tekstisisalto')}}</h4>
    <ep-content v-if="isEditing || (model.vapaaTeksti && model.vapaaTeksti[sisaltokieli] && model.vapaaTeksti[sisaltokieli].length > 0)"
      layout="normal"
      v-model="model.vapaaTeksti"
      :is-editable="isEditing"> </ep-content>
    <div v-else class="disabled-text">{{ $t('ei-sisaltoa') }}</div>

    <div class="text-right" v-if="isEditing">
      <ep-button variant="link" icon="delete" @click="poistaTavoite">
        {{ $t('poista-tavoite') }}
      </ep-button>
    </div>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { Kielet } from '@shared/stores/kieli';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import draggable from 'vuedraggable';

interface OppiaineenTavoiteSupportData {
  kohdealueet: any[];
  laajaAlaisetOsaamiset: any[];
  sisaltoalueet?: any[];
}

@Component({
  components: {
    EpContent,
    EpInput,
    EpSelect,
    EpButton,
    EpCollapse,
    EpMaterialIcon,
    draggable,
  },
})
export default class EpOppiaineenTavoite extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  supportData!: OppiaineenTavoiteSupportData;

  @Prop({ required: false, default: false })
  isEditing!: boolean;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get kohdealue() {
    return _.find(this.supportData.kohdealueet, kohdealue => _.toString(kohdealue.id) === _.first(this.model.kohdealueet));
  }

  set kohdealue(val: any) {
    if (val) {
      this.model.kohdealueet = [_.toString(val.id)];
    }
    else {
      this.model.kohdealueet = [];
    }
  }

  get laajaAlaisetOsaamisetValinnat() {
    return _.map(this.supportData.laajaAlaisetOsaamiset, lao => {
      return {
        ...lao,
        valittu: _.includes(this.model.laajattavoitteet, _.toString(lao.id)),
      };
    });
  }

  get laajaAlaisetOsaamiset() {
    return _.filter(this.supportData.laajaAlaisetOsaamiset, lao => _.includes(this.model.laajattavoitteet, _.toString(lao.id)));
  }

  lisaaLaajaAlainenOsaaminen(lao) {
    this.model.laajattavoitteet = [
      ...this.model.laajattavoitteet,
      _.toString(lao.id),
    ];
  }

  poistaLaajaAlainenOsaaminen(lao) {
    this.model.laajattavoitteet = _.filter(this.model.laajattavoitteet, laajatavoite => laajatavoite !== _.toString(lao.id));
  }

  get sisaltoalueetValinnat() {
    if (this.supportData.sisaltoalueet) {
      return _.map(this.supportData.sisaltoalueet, sisaltoalue => {
        return {
          ...sisaltoalue,
          valittu: _.includes(this.model.sisaltoalueet, _.toString(sisaltoalue.id)),
        };
      });
    }
  }

  get sisaltoalueet() {
    return _.filter(this.supportData.sisaltoalueet, sisaltoalue => _.includes(this.model.sisaltoalueet, _.toString(sisaltoalue.id)));
  }

  lisaaSisaltoalue(sisaltoalue) {
    this.model.sisaltoalueet = [
      ...this.model.sisaltoalueet,
      _.toString(sisaltoalue.id),
    ];
  }

  poistaSisaltoalue(poistettavaSisaltoalue) {
    this.model.sisaltoalueet = _.filter(this.model.sisaltoalueet, sisaltoalue => sisaltoalue !== _.toString(poistettavaSisaltoalue.id));
  }

  get arvosanat() {
    return [10, 9, 8, 7, 6, 5, 1];
  }

  lisaaArvosanaRivi() {
    this.model.arvioinninkohteet = [
      ...this.model.arvioinninkohteet,
      {},
    ];
  }

  get sisaltokieli() {
    return Kielet.getSisaltoKieli.value;
  }

  poistaArviointi(arviointi) {
    this.model.arvioinninkohteet = _.filter(this.model.arvioinninkohteet, arvioinninkohde => arvioinninkohde !== arviointi);
  }

  get arvioinnitDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'arvioinnit',
      },
    };
  }

  poistaTavoite() {
    this.$emit('poista', this.model);
  }

  get arvioinninKohteetSorted() {
    return _.sortBy(this.model.arvioinninkohteet, 'arvosana');
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

  .listaus:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }
  .listaus:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }

</style>
