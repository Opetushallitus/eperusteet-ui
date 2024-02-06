<template>
  <div class="d-flex flex-column h-100 moduuli mb-3" :style="style">
    <div class="d-flex align-items-center flex-grow-1 h-100">
      <div class="pl-1" v-if="hasChildren">
        <b-button variant="link" @click="toggleOpen">
          <EpMaterialIcon v-if="isOpen">expand_less</EpMaterialIcon>
          <EpMaterialIcon v-else>expand_more</EpMaterialIcon>
        </b-button>
      </div>
      <div class="flex-grow-1 h-100 p-2 nimi">
        <EpColorIndicator :size="10" :backgroundColor="tutkinnonOsaColor" class="ml-2 mr-2" v-if="tosa"/>
        {{ $kaanna(nimi) }} <span v-if="koodiArvo">({{koodiArvo}})</span>
      </div>
      <div style="width: 100px;" class="text-center">
        <b-button variant="none" :class="{ 'text-danger': !validity.isValid }" v-b-popover.hover="$t('laskettu-laajuus') + ': ' + laskettu">
          <span v-if="laajuusMinimi > 0 || laajuusMaksimi > 0">
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
              <EpMaterialIcon>more_horiz</EpMaterialIcon>
              <span class="sr-only">{{ $t('muokkaa-ryhmaa') }}</span>
            </template>
            <b-dropdown-item-button @click="edit">{{ $t('muokkaa') }}</b-dropdown-item-button>
            <b-dropdown-item-button @click="remove">{{ $t('poista') }}</b-dropdown-item-button>

            <template v-if="isRyhma">
              <b-dropdown-item-button @click="copy">{{ $t('kopioi-leikelaudalle') }}</b-dropdown-item-button>
              <b-dropdown-divider v-if="isRyhma"></b-dropdown-divider>
              <b-dropdown-text v-if="isRyhma">
                <ep-button icon="add" variant="outline" @click="liitaTosa">{{ $t('liita-tutkinnon-osa') }}</ep-button>
                <ep-button icon="add" variant="outline" @click="lisaaRyhma">{{ $t('lisaa-ryhma') }}</ep-button>
              </b-dropdown-text>
            </template>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div v-if="value.kuvaus" class="text-muted kuvaus-wrapper">
      <div v-if="showDescription" class="kuvaus">
        <ep-content v-model="value.kuvaus" :is-editable="false" layout="normal"></ep-content>
      </div>
      <div class="text-center description-button">
        <b-button variant="link" @click="toggleDescription()">
          <EpMaterialIcon>more_horiz</EpMaterialIcon>
        </b-button>
      </div>
    </div>
    <EpRakenneModal v-model="innerModel" ref="eprakennemodal" @remove="remove" :tutkinnonOsatMap="tutkinnonOsatMap" muokkaus/>

    <EpRakenneModal v-model="uusi.ryhma" ref="eprakennemodalNew" @save="addUusi(value)"/>

    <TutkinnonosatAddModal ref="tutkinnonosatModal" :tutkinnonosat="tutkinnonosat" @save="lisaaTutkinnonosat" />

  </div>
</template>

<script lang="ts">
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import { DefaultRyhma, ryhmaTemplate } from './utils';
import EpRakenneModal from '@/components/muodostuminen/EpRakenneModal.vue';
import TutkinnonosatAddModal from '@/components/muodostuminen/TutkinnonosatAddModal.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { ColorMap, rakenneNodecolor } from '@shared/utils/perusterakenne';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  name: 'MuodostumisItem',
  components: {
    EpButton,
    EpContent,
    EpInput,
    EpToggle,
    EpRakenneModal,
    TutkinnonosatAddModal,
    EpColorIndicator,
    EpMaterialIcon,
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

  @Prop({ default: false, type: Boolean })
  private pakollinen!: boolean;

  private showDescription = false;
  private uusi: any | null = DefaultRyhma;

  set innerModel(innerModel) {
    this.$emit('input', innerModel);
  }

  get innerModel() {
    return this.value;
  }

  get hasChildren() {
    return this.value.osat?.length > 0;
  }

  get isOpen() {
    if (this.innerModel.isOpen === undefined) {
      this.innerModel = {
        ...this.innerModel,
        isOpen: true,
      };
    }

    return this.innerModel.isOpen;
  }

  toggleOpen() {
    this.innerModel = {
      ...this.innerModel,
      isOpen: !this.innerModel.isOpen,
    };
  }

  get tosa() {
    if (!this.value._tutkinnonOsaViite) {
      return null;
    }
    return this.tutkinnonOsatMap[this.value._tutkinnonOsaViite];
  }

  get laskettu() {
    if (this.isRyhma) {
      return this.osanLaajuusRecursive(this.value);
    }
    else {
      return this.laajuusMinimi;
    }
  }

  osanLaajuusRecursive(osa) {
    return _(osa.osat)
      .map(osa => {
        return this.osanLaajuusRecursive(osa) + _.max([osa?.muodostumisSaanto?.laajuus?.minimi, osa?.muodostumisSaanto?.laajuus?.maksimi])
            || (osa._tutkinnonOsaViite && this.tutkinnonOsatMap[osa._tutkinnonOsaViite] && this.tutkinnonOsatMap[osa._tutkinnonOsaViite].laajuus)
            || 0;
      })
      .filter()
      .sum();
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

  get isPaikallinen() {
    return this.value?.rooli === 'määrittelemätön';
  }

  get validity() {
    if (this.isRyhma) {
      return {
        isValid: this.isPaikallinen || this.laskettu >= this.laajuusValidointi,
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
    else if (this.tosa) {
      return this.tosa.nimi;
    }
  }

  get koodiArvo() {
    if (this.innerModel.tutkintonimike?.arvo) {
      return this.innerModel.tutkintonimike?.arvo;
    }

    if (this.innerModel.tutkinnonosa?.tutkinnonOsa?.koodi?.arvo) {
      return this.innerModel.tutkinnonosa?.tutkinnonOsa?.koodi?.arvo;
    }

    if (this.tosa?.tutkinnonOsa?.koodi?.arvo) {
      return this.tosa?.tutkinnonOsa?.koodi?.arvo;
    }

    if (this.innerModel.osaamisala?.osaamisalakoodiArvo) {
      return this.innerModel.osaamisala?.osaamisalakoodiArvo;
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
      ...(!this.tosa && { 'border-left': '9px solid ' + this.color }),
      'border-bottom-left-radius': '4px',
      'border-top-left-radius': '4px',
    };
  }

  get color() {
    return rakenneNodecolor(this.value, this.pakollinen, this);
  }

  get tutkinnonOsaColor() {
    if (this.pakollinen) {
      return ColorMap['pakollinen'];
    }

    return ColorMap['valinnainen'];
  }

  get isRyhma() {
    return !!this.value.rooli;
  };

  remove() {
    this.$emit('remove');
  }

  edit() {
    (this.$refs.eprakennemodal as any).show();
  }

  toggleDescription(toggle?) {
    if (toggle) {
      this.showDescription = toggle;
    }
    else {
      this.showDescription = !this.showDescription;
    }
  }

  addUusi(root) {
    const template = ryhmaTemplate(this.uusi.tyyppi, this);
    if (this.uusi) {
      root.osat = [{
        ...template,
        ...this.uusi.ryhma,
      }, ...root.osat];
    }
  }

  lisaaRyhma() {
    this.uusi = _.cloneDeep(DefaultRyhma);
    (this.$refs.eprakennemodalNew as any).show(true);
  }

  liitaTosa() {
    (this.$refs.tutkinnonosatModal as any).show();
  }

  get tutkinnonosat() {
    return _.chain(this.tutkinnonOsatMap)
      .keys()
      .map(tosaViite => {
        return {
          ...this.tutkinnonOsatMap[tosaViite],
          _tutkinnonOsaViite: tosaViite,
        };
      })
      .value();
  }

  lisaaTutkinnonosat(tutkinnonosat) {
    this.value.osat = [
      ...this.value.osat,
      ..._.map(tutkinnonosat, tosa => {
        return {
          kuvaus: null,
          vieras: null,
          tunniste: null,
          pakollinen: false,
          erikoisuus: null,
          _tutkinnonOsaViite: tosa._tutkinnonOsaViite,
        };
      }),
    ];
  }

  copy() {
    this.$emit('copy');
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
