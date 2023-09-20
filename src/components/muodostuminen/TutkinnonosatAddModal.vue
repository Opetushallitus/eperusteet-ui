<template>
  <b-modal
    ref="tutkinnonosatModal"
    size="xl"
    :cancelTitle="$t('peruuta')">

    <template #modal-header>
      <h2 >{{ $t('liita-tutkinnon-osia-ryhmaan') }}</h2>
    </template>

    <template #modal-footer>
      <div class="d-flex justify-content-end w-100">
        <ep-button @click="cancel" variant="link">
          {{$t('peruuta')}}
        </ep-button>
        <ep-button @click="save">
          {{$t('liita-valitut-tutkinnon-osat')}}
        </ep-button>
      </div>
    </template>

    <template #default>

      <ep-search v-model="queryTutkinnonOsa" :placeholder="$t('etsi-tutkinnon-osaa')" />
      <div class="ml-1 mt-1">
        <ep-toggle v-model="showUnusedTutkinnonOsat" :isSWitch="false">
          <span class="noselect">
            {{ $t('nayta-kayttamattomat') }}
          </span>
        </ep-toggle>
      </div>

      <div class="font-weight-600 mt-4">{{$t('valittu')}} {{selected.length}} {{$t('kpl')}}</div>
      <b-table
        striped
        responsive
        borderless
        fixed
        hover
        :current-page="sivu"
        :per-page="10"
        :items="items"
        :fields="fields"
        :selectable="true"
        @row-selected="onRowSelected"
        select-mode="single"
        selected-variant=''
      >
        <template v-slot:cell(nimi)="{ item }">
            <fas v-if="item.selected" icon="check-square" class="checked mr-2"/>
            <fas v-else :icon="['far', 'square']" class="checked mr-2"/>
          {{ $kaanna(item.nimi) }}
        </template>
      </b-table>
      <b-pagination
          v-model="sivu"
          :total-rows="items.length"
          :per-page="10"
          aria-controls="tutkinnonosat"
          align="center" />
    </template>
  </b-modal>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import * as _ from 'lodash';
import { Prop, Component, Vue, InjectReactive } from 'vue-property-decorator';
import EpSearch from '@shared/components/forms/EpSearch.vue';

@Component({
  components: {
    EpButton,
    EpContent,
    EpInput,
    EpToggle,
    EpSearch,
  },
})

export default class TutkinnonosatAddModal extends Vue {
  @Prop({ required: false })
  private tutkinnonosat!: any;

  private selected: any[] = [];
  private queryTutkinnonOsa = '';
  private showUnusedTutkinnonOsat = false;
  private sivu = 1;

  @InjectReactive('kayttamattomatTutkinnonOsat')
  private kayttamattomatTutkinnonOsat!: any[];

  show() {
    this.selected = [];
    this.sivu = 1;
    this.showUnusedTutkinnonOsat = false;
    this.queryTutkinnonOsa = '';
    (this.$refs.tutkinnonosatModal as any).show();
  }

  save() {
    this.$emit('save', this.selected);
    (this.$refs.tutkinnonosatModal as any).hide();
  }

  cancel() {
    (this.$refs.tutkinnonosatModal as any).hide();
  }

  get items() {
    if (!this.tutkinnonosat) {
      return null;
    }

    return _.chain(this.tutkinnonosat)
      .filter(tosa => !this.showUnusedTutkinnonOsat || _.includes(_.map(this.kayttamattomatTutkinnonOsat, '_tutkinnonOsa'), tosa._tutkinnonOsa))
      .filter(this.$filterBy('nimi', this.queryTutkinnonOsa))
      .map(tutkinnonosa => {
        return {
          ...tutkinnonosa,
          selected: _.includes(_.map(this.selected, '_tutkinnonOsa'), _.get(tutkinnonosa, '_tutkinnonOsa')),
        };
      })
      .value();
  }

  onRowSelected(items) {
    if (!_.isEmpty(items)) {
      const row = items[0];

      if (_.includes(_.map(this.selected, '_tutkinnonOsa'), _.get(row, '_tutkinnonOsa'))) {
        this.selected = _.filter(this.selected, tosa => tosa._tutkinnonOsa !== row._tutkinnonOsa);
      }
      else {
        this.selected = [
          ...this.selected,
          row,
        ];
      }
    }
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
    }, {
      key: 'laajuus',
      label: this.$t('osaamispiste'),
      thStyle: { width: '30%' },
    }];
  }
}

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .checked {
    color: $paletti-blue;
  }

  ::v-deep .filter {
    max-width: 100%;
  }
</style>
