<template>
  <div class="d-flex flex-column h-100 moduuli" :style="style">
    <div class="d-flex align-items-center flex-grow-1 h-100">
      <div class="pl-1" v-if="hasChildren">
        <b-button variant="link" @click="toggleOpen">
          <fas v-if="isOpen" icon="chevron-up" />
          <fas v-else icon="chevron-down" />
        </b-button>
      </div>
      <div class="flex-grow-1 h-100 p-2 nimi">
        {{ $kaanna(nimi) }}
      </div>
      <div style="width: 100px;" class="text-center">
        <b-button variant="none" :class="{ 'text-danger': !validity.isValid }" v-b-popover.hover="$t('laskettu-laajuus') + ': ' + laskettu">
          <span v-if="laajuusMinimi > 0">
            {{ laajuusMinimi }}
          </span>
          <span v-if="laajuusMaksimi > 0">
            -
            {{ laajuusMaksimi }}
          </span>
        </b-button>
      </div>
      <div style="width: 80px" class="clearfix">
        <div class="float-right">
          <b-dropdown
            v-if="isEditing"
            size="lg"
            variant="link"
            toggle-class="text-decoration-none"
            no-caret>
            <template v-slot:button-content>
              <fas icon="ellipsis-h" /><span class="sr-only">{{ $t('muokkaa-ryhmaa') }}</span>
            </template>
            <b-dropdown-item-button @click="edit">{{ $t('muokkaa') }}</b-dropdown-item-button>
            <b-dropdown-item-button @click="remove">{{ $t('poista') }}</b-dropdown-item-button>
            <b-dropdown-divider v-if="isRyhma"></b-dropdown-divider>
            <b-dropdown-text v-if="isRyhma">
              <ep-button icon="plus" variant="outline">{{ $t('liita-tutkinnon-osa') }}</ep-button>
              <ep-button icon="plus" variant="outline">{{ $t('lisaa-ryhma') }}</ep-button>
            </b-dropdown-text>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div v-if="value.kuvaus" class="text-muted kuvaus-wrapper">
      <div v-if="showDescription" class="kuvaus">
        <ep-content v-model="value.kuvaus" :is-editable="false" layout="normal"></ep-content>
      </div>
      <div class="text-center description-button">
        <b-button variant="link" @click="toggleDescription">
          <fas icon="ellipsis-h" />
        </b-button>
      </div>
    </div>
    <b-modal ref="editModal" size="lg">
      <template #modal-header>
        <h2>{{ $t('muokkaa') }}: {{ $kaanna(nimi) }}</h2>
      </template>

      <template #default>
        <div v-if="isRyhma">
          <b-form-group :label="$t('pakollisuus')">
            <b-form-radio class="ml-1" v-model="tyyppi" value="osaamisala" name="tyyppi">
              {{ $t('osaamisala') }}
            </b-form-radio>
            <b-form-radio class="ml-1" v-model="tyyppi" value="tutkintonimike" name="tyyppi">
              {{ $t('tutkintonimike') }}
            </b-form-radio>
            <b-form-radio class="ml-1 mt-2" v-model="tyyppi" value="rakenne-moduuli-pakollinen" name="tyyppi">
              {{ $t('rakenne-moduuli-pakollinen') }}
            </b-form-radio>
            <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-valinnainen" name="tyyppi">
              {{ $t('rakenne-moduuli-valinnainen') }}
            </b-form-radio>
            <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-ammatilliset" name="tyyppi">
              {{ $t('rakenne-moduuli-ammatilliset') }}
            </b-form-radio>
            <b-form-radio class="ml-1" v-model="tyyppi" value="rakenne-moduuli-yhteiset" name="tyyppi">
              {{ $t('rakenne-moduuli-yhteiset') }}
            </b-form-radio>
            <b-form-radio class="ml-1 mt-2" v-model="tyyppi" value="rakenne-moduuli-paikalliset" name="tyyppi">
              {{ $t('rakenne-moduuli-paikalliset') }}
            </b-form-radio>
          </b-form-group>
          <b-form-group :label="$t('laajuus')">
            <div class="d-flex align-items-center">
              <div>
                <ep-input type="number" is-editing v-model="value.muodostumisSaanto.laajuus.minimi">
                </ep-input>
              </div>
              <div class="ml-2" v-if="value.muodostumisSaanto.laajuus.maksimi">
                -
              </div>
              <div class="ml-2" v-if="value.muodostumisSaanto.laajuus.maksimi">
                <ep-input type="number" is-editing v-model="value.muodostumisSaanto.laajuus.maksimi">
                </ep-input>
              </div>
              <div class="ml-2">
                osp
              </div>
            </div>
            <ep-toggle
              :value="value.muodostumisSaanto.laajuus.maksimi !== null"
              @input="toggleMaksimi"
              switch>
            {{ $t('aseta-myos-maksimiarvo') }}
            </ep-toggle>
          </b-form-group>
        </div>
        <div v-else>
          <b-form-group :label="$t('pakollisuus')">
            <ep-toggle v-model="value.pakollinen" switch>
              {{ $t('tutkinnon-osa-on-pakollinen') }}
            </ep-toggle>
          </b-form-group>
        </div>
        <b-form-group :label="$t('kuvaus')">
          <ep-content v-model="value.kuvaus" :is-editable="true" layout="normal"></ep-content>
        </b-form-group>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import _ from 'lodash';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { RakenneModuuliDto } from '@shared/api/eperusteet';
import { RooliToTheme, ColorMap, RakenneMainType, RakenneModuuliType } from './utils';
import { v4 as genUuid } from 'uuid';


@Component({
  name: 'MuodostumisItem',
  components: {
    EpButton,
    EpContent,
    EpInput,
    EpToggle,
  },
})
export default class MuodostumisItem extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: 0 })
  private depth!: number;

  @Prop({ required: true })
  private tutkinnonOsatMap!: any;

  @Prop({ default: true })
  private isOpen!: boolean;

  private showDescription = false;

  get hasChildren() {
    return this.value.osat?.length > 0;
  }

  toggleOpen() {
    this.$emit('toggle');
  }

  get tosa() {
    if (!this.value._tutkinnonOsaViite) {
      return null;
    }
    return this.tutkinnonOsatMap[this.value._tutkinnonOsaViite];
  }

  get tyyppi() {
    if (this.value.rooli === 'osaamisala') {
      return 'osaamisala';
    }
    else if (this.value.rooli === 'tutkinnonosa') {
      return 'tutkinnonosa';
    }
    
    const rakennetyypit = [
      'rakenne-moduuli-valinnainen',
      'rakenne-moduuli-ammatilliset',
      'rakenne-moduuli-yhteiset',
      'rakenne-moduuli-paikalliset',
      'rakenne-moduuli-pakollinen'
    ];
    for (const rt of rakennetyypit) {
      if (this.value?.name?.fi === this.$t(rt, 'fi')) {
        return rt;
      }
    }
    console.log('?');
    return 'rakenne-moduuli-pakollinen';
  }

  get laskettu() {
    if (this.isRyhma) {
      return _(this.value.osat)
          .map(osa =>
            osa.muodostumisSaanto?.laajuus?.maksimi
            || (osa._tutkinnonOsaViite && this.tutkinnonOsatMap[osa._tutkinnonOsaViite].laajuus)
            || 0)
          .filter()
          .sum();
    }
    else {
      return this.laajuusMinimi;
    }
  }

  set tyyppi(value: string) {
    this.value.nimi = {
      fi: this.$t(value, 'fi'),
      sv: this.$t(value, 'sv'),
      en: this.$t(value, 'en'),
    };
  }

  mounted() {
    if (!this.value.muodostumisSaanto) {
      Vue.set(this.value, 'muodostumisSaanto', {
        laajuus: {
          minimi: 0,
          maksimi: null,
        },
      });
    }

    if (!this.value.muodostumisSaanto?.laajuus) {
      Vue.set(this.value.muodostumisSaanto, 'laajuus', {
        minimi: 0,
        maksimi: null,
      });
    }
  }

  get laajuusValidointi() {
    if (this.isRyhma) {
      return this.laajuusMaksimi || this.laajuusMinimi;
    }
    else {
      return 0;
    }
  }

  get validity() {
    if (this.isRyhma) {
      return {
        isValid: this.laskettu >= this.laajuusValidointi,
      };
    }
    else {
      return { isValid: true };
    }
  }

  get nimi() {
    if (this.isRyhma) {
      return this.value.nimi;
    }
    else {
      return this.tosa.nimi;
    }
  }

  get laajuus() {
    return this.value.muodostumisSaanto?.laajuus;
  }

  get laajuusMinimi() {
    if (this.isRyhma) {
      return this.laajuus?.minimi;
    }
    else {
      return this.tosa?.laajuus;
    }
  }

  get laajuusMaksimi() {
    if (this.isRyhma) {
      return this.laajuus?.maksimi;
    }
    else {
      return null;
    }
  }

  get style() {
    return {
      'min-height': (this.isRyhma ? 52 : 42) + 'px',
      'border-left': "9px solid " + this.color,
      'border-bottom-left-radius': '4px',
      'border-top-left-radius': '4px',
    };
  }

  get color() {
    if (this.isRyhma) {
      const mapped = RooliToTheme[this.value.rooli];
      if (mapped) {
        return ColorMap[mapped];
      }
      if (this.value.rooli === 'määritelty') {
        if (this.$kaanna(this.value.nimi) === this.$t('rakenne-moduuli-pakollinen')) {
          return ColorMap.pakollinen;
        }
        else if (this.$kaanna(this.value.nimi) === this.$t('rakenne-moduuli-ammatilliset')) {
          return ColorMap.ammatilliset;
        }
      }
      return ColorMap.valinnainen;
    }
    else {
      if (this.value.pakollinen) {
        return ColorMap.pakollinen;
      }
      else {
        return ColorMap.valinnainen;
      }
    }
    return '#fff';
  }

  get isRyhma() {
    return !!this.value.rooli;
  };

  remove() {
    this.$emit('remove');
  }

  edit() {
    (this.$refs.editModal as any).show();
  }

  toggleMaksimi() {
    if (_.isNumber(this.value.muodostumisSaanto?.laajuus.maksimi)) {
      this.value.muodostumisSaanto.laajuus.maksimi = null;
    }
    else {
      this.value.muodostumisSaanto.laajuus.maksimi = 1;
    }
  }

  toggleDescription() {
    this.showDescription = !this.showDescription;
  }

}
</script>

<style scoped lang="scss">
.children {
  background: #f2f2f2;
}

.muodostumisnode {
  background: #f0f4fb;
}

.moduuli {
  background: #fff;

  .nimi {
    font-weight: 600;
  }
}

.kuvaus-wrapper {
  .kuvaus {
    padding: 0.5rem 1rem 0 1rem;
    margin-bottom: -20px;
  }

  .description-button {
    max-height: 20px;
    margin-top: -8px;
    .btn {
      padding: 0;
      margin: 0;
    }
  }
}

.colorblock {
  content: " ";
  display: block;
  height: 100%;
  width: 8px;
}

</style>

