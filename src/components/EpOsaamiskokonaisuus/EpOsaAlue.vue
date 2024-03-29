<template>
  <div>
    <div v-if="isEditing">
      <b-form-group >
        <div slot="label" class="d-flex justify-content-between">
          <div>{{$t('osa-alueen-nimi')}}</div>
          <slot name="poisto"></slot>
        </div>
        <ep-input v-model="osaAlue.nimi" :is-editing="isEditing"/>
      </b-form-group>

      <hr/>

      <b-form-group v-for="(tasokuvaus, index) in osaAlue.tasokuvaukset" :key="'tasokuvaus' + index" :label="$t('osa-alue-otsiko-' + tasokuvaus.taso.toLowerCase())">
        <draggable
            v-bind="defaultDragOptions"
            tag="div"
            v-model="tasokuvaus.kuvaukset">

            <b-row v-for="(kuvaus, kuvausIndex) in tasokuvaus.kuvaukset" :key="'kuvaus'+kuvausIndex" class="pb-2">
              <b-col cols="11">
                <ep-input v-model="kuvaus[sisaltokieli]" :is-editing="isEditing" type="string" class="flex-grow-1">
                  <div class="order-handle m-2" slot="left">
                    <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                  </div>
                </ep-input>
              </b-col>
              <b-col cols="1">
                <div class="default-icon clickable mt-2" @click="poistaKuvaus('kuvaukset', kuvaus, tasokuvaus.taso)">
                  <EpMaterialIcon>delete</EpMaterialIcon>
                </div>
              </b-col>
            </b-row>

          </draggable>

          <ep-button @click="lisaaKuvaus('kuvaukset', tasokuvaus.taso)" variant="outline" icon="add" class="mt-2">
            {{ $t('lisaa-kuvaus') }}
          </ep-button>

          <template v-if="tasokuvaus.taso === 'VUOSILUOKKA_12' || tasokuvaus.taso === 'VUOSILUOKKA_3456' || tasokuvaus.taso === 'VUOSILUOKKA_789'">
            <div class="mt-3 mb-2">{{$t('edistynyt-osaaminen')}}</div>
            <draggable
              v-bind="defaultDragOptions"
              tag="div"
              v-model="tasokuvaus.edistynytOsaaminenKuvaukset">

              <b-row v-for="(kuvaus, kuvausIndex) in tasokuvaus.edistynytOsaaminenKuvaukset" :key="'kuvaus'+kuvausIndex" class="pb-2">
                <b-col cols="11">
                  <ep-input v-model="kuvaus[sisaltokieli]" :is-editing="isEditing" type="string" class="flex-grow-1">
                    <div class="order-handle m-2" slot="left">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </ep-input>
                </b-col>
                <b-col cols="1">
                  <div class="default-icon clickable mt-2" @click="poistaKuvaus('edistynytOsaaminenKuvaukset', kuvaus, tasokuvaus.taso)">
                    <EpMaterialIcon>delete</EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </draggable>

            <ep-button @click="lisaaKuvaus('edistynytOsaaminenKuvaukset', tasokuvaus.taso)" variant="outline" icon="add" class="mt-1">
              {{ $t('lisaa-kuvaus') }}
            </ep-button>
          </template>

        <hr/>
      </b-form-group>

    </div>

    <div v-else>
      <h3>{{ $kaanna(osaAlue.nimi) }}</h3>

      <div v-for="(tasokuvaus, index) in osaAlue.tasokuvaukset" :key="'tasokuvaus' + index">
        <b-form-group class="mt-3" v-if="(tasokuvaus.kuvaukset && tasokuvaus.kuvaukset.length > 0) || (tasokuvaus.edistynytOsaaminenKuvaukset && tasokuvaus.edistynytOsaaminenKuvaukset.length > 0)" :label="$t('osa-alue-otsiko-' + tasokuvaus.taso.toLowerCase())">
          <ul v-if="tasokuvaus.kuvaukset && tasokuvaus.kuvaukset.length > 0" class="mb-4">
            <li v-for="(kuvaus, kuvausIndex) in tasokuvaus.kuvaukset" :key="'kuvaus' + index + kuvausIndex">{{$kaanna(kuvaus)}}</li>
          </ul>

          <div v-if="tasokuvaus.edistynytOsaaminenKuvaukset && tasokuvaus.edistynytOsaaminenKuvaukset.length > 0" class="mb-3">
            <div class="ml-3 mb-2">{{$t('edistynyt-osaaminen')}}</div>
            <ul>
              <li v-for="(edistynytKuvaus, kuvausIndex) in tasokuvaus.edistynytOsaaminenKuvaukset" :key="'edistynytkuvaus' + index + kuvausIndex">{{$kaanna(edistynytKuvaus)}}</li>
            </ul>
          </div>
        </b-form-group>
      </div>
    </div>

  </div>

</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpInput from '@shared/components/forms/EpInput.vue';
import { Kielet } from '@shared/stores/kieli';
import draggable from 'vuedraggable';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpInput,
    draggable,
    EpButton,
    EpMaterialIcon,
  },
})
export default class EpOsaAlue extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  isEditing!: boolean;

  get osaAlue() {
    return this.value;
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      disabled: !this.isEditing,
      ghostClass: 'dragged',
      group: {
        name: 'kuvaukset',
      },
    };
  }

  get sisaltokieli() {
    return Kielet.getSisaltoKieli.value;
  }

  poistaKuvaus(listaKentta, kuvaus, taso) {
    this.$emit('input', {
      ...this.osaAlue,
      tasokuvaukset: _.map(this.osaAlue.tasokuvaukset, tasokuvaus => tasokuvaus.taso === taso ? { ...tasokuvaus, [listaKentta]: _.filter(tasokuvaus[listaKentta], tkuvaus => tkuvaus !== kuvaus) } : tasokuvaus),
    });
  }

  lisaaKuvaus(listaKentta, taso) {
    this.$emit('input', {
      ...this.osaAlue,
      tasokuvaukset: _.map(this.osaAlue.tasokuvaukset, tasokuvaus => tasokuvaus.taso === taso ? { ...tasokuvaus, [listaKentta]: [...tasokuvaus[listaKentta], {}] } : tasokuvaus),
    });
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
