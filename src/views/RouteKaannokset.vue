<template>
  <EpMainView>
    <h2 aria-level="1" class="mb-4">{{ $t('kaannokset') }}</h2>
    <h3 aria-level="2" class="mb-4">{{ $t('tuo-kaannokset') }}</h3>
    <div>
      <button class="btn btn-primary"
              @click="loadTranslations()"
              :disabled="loading">
        {{ $t('lataa-kaannokset') }}
      </button>
    </div>

    <div class="mt-4">
      <h3 aria-level="2" class="mb-4">{{ $t('vie-kaannokset') }}</h3>
      <div class="mt-2">
        <input type="file"
               @change="loadFile"
               accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
        <div v-if="sent" class="alert alert-success mt-2">
          {{ 'kaannokset-lahetetty' }}
        </div>
        <div v-else-if="loadedData" class="mt-2">
          <button v-if="loadedData.length > 0"
                  class="btn btn-primary"
                  @click="uploadTranslations()">
            {{ $t('vie') }} {{ this.loadedData.length }} {{ $t('kaannosta') }}
          </button>
          <div v-else class="alert alert-success">
            {{ 'ei-muutoksia' }}
          </div>
        </div>
      </div>
    </div>
    <EpSpinner v-if="loading"></EpSpinner>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BvTableFieldArray } from 'bootstrap-vue';
import { PalautteetStore } from '@/stores/PalautteetStore';
import { getMessages } from '@shared/stores/kieli';
import { Api } from '@shared/api/eperusteet';
import { saveAs } from 'file-saver';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import XLSX from 'xlsx';
import _ from 'lodash';

@Component({
  components: {
    EpMainView,
    EpSpinner,
  },
})
export default class RouteKaannokset extends Vue {
  loading = false;
  files = [] as string[];
  loadedData = null as any;
  sent = false;

  async loadFile(ev) {
    this.sent = false;
    this.loading = true;
    this.loadedData = null;
    const file = ev.target.files[0];
    const reader = new FileReader();

    reader.onload = async event => {
      if (!event) {
        return;
      }
      const data = XLSX.read(event!.target!.result, { type: 'binary' });
      if (!data) {
        return;
      }
      const rows = XLSX.utils.sheet_to_json(data.Sheets[0]) as any[];

      if (rows[0]
        && rows[0].hasOwnProperty('kategoria')
        && rows[0].hasOwnProperty('avain')
        && rows[0].hasOwnProperty('suomi')
        && rows[0].hasOwnProperty('ruotsi')
        && rows[0].hasOwnProperty('englanti')) {
        const send = [] as any[];
        const originals = await this.fetchTranslations();

        for (const item of rows as any[]) {
          if (item.avain && _.startsWith(item.kategoria, 'eperusteet')) {
            const common = {
              key: item.avain,
              category: item.kategoria,
            };

            const original = originals[item.kategoria][item.avain];
            if (item.suomi && (!original || item.suomi !== original.fi)) {
              send.push({ ...common, locale: 'fi', value: item.suomi });
            }
            if (item.ruotsi && (!original || item.ruotsi !== original.sv)) {
              send.push({ ...common, locale: 'sv', value: item.ruotsi });
            }
            if (item.englanti && (!original || item.englanti !== original.en)) {
              send.push({ ...common, locale: 'en', value: item.englanti });
            }
          }
        }
        this.loadedData = send;
      }
      else {
        console.error('virheellinen-formaatti', rows[0]);
      }
      this.loading = false;
    };
    reader.readAsBinaryString(file);
  }

  async uploadTranslations() {
    if (!this.loadedData) {
      return;
    }

    try {
      console.log(`Lähetetään ${_.size(this.loadedData)} käännöstä.`);
      await Api.post('/lokalisointi/kaannokset', this.loadedData);
      this.sent = true;
    }
    finally {
      this.loadedData = null;
    }
  }

  async fetchTranslations() {
    const result = {
      eperusteet: {},
      'eperusteet-opintopolku': {},
      'eperusteet-ylops': {},
      'eperusteet-amosaa': {},
    } as any;

    const kaannokset = getMessages();

    for (const kaannos in kaannokset.fi) {
      result.eperusteet[kaannos] = {
        fi: kaannokset.fi[kaannos],
        sv: kaannokset.sv[kaannos],
        en: kaannokset.en[kaannos],
      };
    }

    { // Käännöspalvelun käännökset
      const { data } = await Api.get('/lokalisointi/kaannokset');
      for (const kaannos of data) {
        const uusi = result[kaannos.category][kaannos.key] || {};
        if (kaannos.value) {
          uusi[kaannos.locale] = kaannos.value;
        }
        result[kaannos.category][kaannos.key] = uusi;
      }
    }
    return result;
  }

  async loadTranslations() {
    this.loading = true;
    const kaannokset = await this.fetchTranslations();

    const data = [
      ['kategoria', 'avain', 'suomi', 'ruotsi', 'englanti'],
    ];

    for (const category of Object.keys(kaannokset)) {
      for (const key of Object.keys(kaannokset[category])) {
        const fi = kaannokset[category][key]['fi'] || '';
        const sv = kaannokset[category][key]['sv'] || '';
        const en = kaannokset[category][key]['en'] || '';
        data.push([category, key, fi, sv, en]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = _(_.range(0, 4))
      .map(idx => _.chain(data)
        .map(row => row ? _.size(row[idx]) : 0)
        .reduce((acc, next) => Math.max(acc || 0, next || 0), 0)
        .value())
      .map(wch => ({ wch: Math.min(wch, 100) }))
      .value();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '0');

    try {
      XLSX.writeFile(wb, 'kaannokset.xlsx');
    }
    catch (err) {
      console.log(err);
    }
    finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped lang="scss">
  @import '@shared/styles/_variables.scss';
</style>
