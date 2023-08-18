<template>
  <b-form-group>
    <div slot="label">
      <div v-if="isEditing" class="mb-2">{{$t('otsikko')}}</div>
      <EpInput :isEditing="isEditing" v-model="arvioinninKohdeAlue.otsikko" :class="{'mb-3': isEditing }"/>
    </div>
    <div v-for="(arvioinninKohde, arvindex) in arvioinninKohdeAlue.arvioinninKohteet" :key="'arvioinninKohde' + arvindex">
      <div class="font-weight-bold mb-2">
        <EpInput :isEditing="isEditing" v-model="arvioinninKohde.otsikko" />
      </div>
      <div class="mb-3">
        <EpInput :isEditing="isEditing" v-model="arvioinninKohde.selite" />
      </div>
      <b-row v-for="osaamistasonkriteeri in arvioinninKohde.osaamistasonKriteerit" :key="'osaamistasonkriteeri'+osaamistasonkriteeri._osaamistaso">
        <b-col cols="1">{{$kaanna(arviointiasteikotKeyById[arvioinninKohde._arviointiAsteikko].osaamistasot[_.toString(osaamistasonkriteeri.osaamistaso.id)].otsikko)}}</b-col>
        <b-col class="d-flex flex-column">
          <template v-if="!isEditing">
            <ul>
              <li v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex">
                {{$kaanna(osaamistasonkriteeri.kriteerit[kriteeriIndex])}}
              </li>
            </ul>
          </template>

          <template v-else>
            <div v-for="(kriteeri, kriteeriIndex) in osaamistasonkriteeri.kriteerit" :key="'kriteeri'+kriteeriIndex" class="mb-2">
              <div class="d-flex">
                <EpInput class="w-100" :isEditing="isEditing" v-model="osaamistasonkriteeri.kriteerit[kriteeriIndex]" />
                <EpButton v-if="isEditing" variant="link" icon="roskalaatikko" @click="poistaKriteeri(osaamistasonkriteeri, kriteeri)"/>
              </div>
            </div>
            <EpButton v-if="isEditing" class="mb-3" variant="outline-primary" icon="plussa" @click="lisaaKriteeri(osaamistasonkriteeri)">
              {{ $t('lisaa-kriteeri') }}
            </EpButton>
          </template>
        </b-col>
      </b-row>
    </div>
  </b-form-group>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpInput,
    EpButton,
  },
})
export default class Template extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: true })
  private arviointiasteikot!: any;

  get arvioinninKohdeAlue() {
    return this.value;
  }

  set arvioinninKohdeAlue(val) {
    this.$emit('input', val);
  }

  get arviointiasteikotKeyById() {
    return _.keyBy(_.map(this.arviointiasteikot, arviointiasteikko => {
      return {
        ...arviointiasteikko,
        osaamistasot: _.keyBy(arviointiasteikko.osaamistasot, 'id'),
      };
    }), 'id');
  }

  lisaaKriteeri(osaamistasonkriteeri) {
    osaamistasonkriteeri.kriteerit = [
      ...osaamistasonkriteeri.kriteerit,
      {},
    ];
  }

  poistaKriteeri(osaamistasonkriteeri, poistettavaKriteeri) {
    osaamistasonkriteeri.kriteerit = _.filter(osaamistasonkriteeri.kriteerit, kriteeri => kriteeri !== poistettavaKriteeri);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
