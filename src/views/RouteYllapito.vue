<template>
  <ep-main-view :container="true">
    <template slot="header">
      <h1>{{ $t('yllapito') }}</h1>
    </template>

    <div class="mt-4">
      <b-table
        striped
        hover
        responsive
        show-empty
        :empty-text="$t('ei-sisaltoa')"
        :items="items"
        :fields="fields">

        <template v-slot:cell(kuvaus)="data">
          <ep-input v-model="data.item.kuvaus" :is-editing="isEditing"/>
        </template>

        <template v-slot:cell(key)="data">
          <ep-input v-model="data.item.key" :is-editing="isEditing" />
        </template>

        <template v-slot:cell(value)="data">
          <ep-input v-model="data.item.value" :is-editing="isEditing" />
        </template>

      </b-table>
    </div>

    <EpSpinner v-if="isLoading" />
    <div v-else>
      <div v-if="!isEditing">
        <ep-button variant="primary ml-2" @click="onEdit()">{{ $t('muokkaa') }}</ep-button>
      </div>
      <div v-else class="d-flex justify-content-between">
        <div>
          <ep-button class="ml-2" variant="primary" @click="onSave()" :disabled="$v.$invalid">{{ $t('tallenna') }}</ep-button>
        </div>
      </div>
    </div>
  </ep-main-view>
</template>

<script lang="ts" >
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { YllapitoStore } from '@/stores/YllapitoStore';
import { YllapitoDto } from '@shared/generated/eperusteet';
import { Validations } from 'vuelidate-property-decorators';
import { notNull } from '@shared/validators/required';

@Component({
  components: {
    EpMainView,
    EpButton,
    EpInput,
    EpSpinner,
  },
})
export default class RouteYllapito extends Vue {
  @Prop({ required: true })
  private yllapitoStore!: YllapitoStore;

  private isEditing = false;
  private isLoading = false;

  private inner: YllapitoDto[] = [];

  @Validations()
  validations = {
    inner: {
      $each: {
        kuvaus: notNull(),
        key: notNull(),
        value: notNull(),
      },
    },
  };

  @Watch('editing', { immediate: true })
  onEditingChange(value) {
    this.isEditing = value;
  }

  @Watch('items', { immediate: true })
  onValueChange(value) {
    this.inner = value;
  }

  async mounted() {
    this.isLoading = true;
    try {
      await this.yllapitoStore.fetch();
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
    finally {
      this.isLoading = false;
    }
  }

  async onSave() {
    this.isLoading = true;
    try {
      await this.yllapitoStore.save(this.inner);
      this.$success(this.$t('tallennus-onnistui') as string);
    }
    catch (e) {
      this.$fail(this.$t('tallentaminen-epaonnistui') as string);
    }
    finally {
      this.isEditing = false;
      this.isLoading = false;
    }
  }

  get items() {
    return this.yllapitoStore.yllapito.value;
  }

  get fields() {
    return [{
      key: 'kuvaus',
      label: this.$t('kuvaus') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }, {
      key: 'key',
      label: this.$t('avain') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }, {
      key: 'value',
      label: this.$t('arvo') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }];
  }

  onEdit() {
    this.isEditing = true;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
