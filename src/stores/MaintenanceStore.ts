import { Maintenance } from '@shared/api/eperusteet';
import * as _ from 'lodash';

export class MaintenanceStore {
  constructor(private projektiId: number, private perusteId: number) {
  }

  async exportPeruste() {
    const ladattuPeruste = (await Maintenance.viePeruste(this.perusteId!)) as any;
    const fileURL = window.URL.createObjectURL(new Blob([ladattuPeruste]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', 'peruste.json');
    document.body.appendChild(fileLink);
    fileLink.click();
  }
}
