<template>
  <div>
    <b-form-group v-if="isEditing">
      <b-form-radio-group v-model="inner">
        <b-form-radio
          v-for="geneerinen in geneeriset"
          name="geneerinen"
          :value="geneerinen.id"
          :key="'geneerinen-' + geneerinen.id">
          {{ $kaanna(geneerinen.nimi) }}
        </b-form-radio>
      </b-form-radio-group>
    </b-form-group>
    <div v-else-if="valittuGeneerinen">
      <div class="mt-3 mb-4">
        <div class="font-weight-bold">{{ $t('arvioinnin-kohde') }}</div>
        <div>{{ $kaanna(valittuGeneerinen.kohde) }}</div>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th width="20%">{{ $t('osaamistaso') }}</th>
            <th>{{ $t('kriteerit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ot, idx) in valittuGeneerinen.osaamistasot" :key="'ot-' + idx">
            <td>{{ $kaanna(ot.otsikko) }}</td>
            <td>
              <ul class="pl-4">
                <li v-for="(kriteeri, idx) in ot.kriteerit" :key="idx">
                  {{ $kaanna(kriteeri) }}
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <EpAlert :text="$t('ei-valittu')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { ArviointiStore } from '@/stores/ArviointiStore';
import _ from 'lodash';

export interface YhdistettyOsaamistaso {
  otsikko?: LokalisoituTekstiDto;
  kriteerit?: any[];
}

export interface YhdistettyGeneerinen {
  nimi?: LokalisoituTekstiDto;
  kohde?: LokalisoituTekstiDto;
  osaamistasot?: YhdistettyOsaamistaso[],
}

@Component({
  components: {
    EpAlert,
  },
})
export default class EpGeneerinenAsteikko extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: number;

  get inner() {
    return this.value;
  }

  set inner(value: number) {
    this.$emit('input', value);
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get kaikkiGeneeriset() {
    return this.arviointiStore.geneeriset.value;
  }

  get valittuGeneerinen(): YhdistettyGeneerinen | null {
    if (!this.value) {
      return null;
    }

    const geneerinen = _.first(_.filter(this.kaikkiGeneeriset,
      g => g.id === Number(this.value)));

    if (!geneerinen) {
      return null;
    }

    const asteikko = _.first(_.filter(this.arviointiasteikot,
      g => g.id === Number((geneerinen as any)._arviointiAsteikko)));

    if (!asteikko) {
      return null;
    }

    const kriteeriMap = _.keyBy(geneerinen.osaamistasonKriteerit, '_osaamistaso');

    return {
      nimi: geneerinen.nimi as any,
      kohde: geneerinen.kohde as any,
      osaamistasot: _.map(_.reverse(asteikko?.osaamistasot || []), (ot: any) => {
        return {
          otsikko: ot.otsikko as any,
          kriteerit: kriteeriMap[ot.id!]!.kriteerit!,
        };
      }),
    };
  }

  get geneeriset() {
    return _.filter(this.arviointiStore.geneeriset.value, 'julkaistu');
  }
}
</script>

<style lang="scss" scoped>
</style>
