import { Perusteprojektit } from '@shared/api/eperusteet';

export async function vaihdaPerusteTilaConfirm(el, meta) {
  const arkistoi = await el.$bvModal.msgBoxConfirm(el.$t(meta.confirm) as any, {
    title: el.$t(meta.title),
    okVariant: 'primary',
    okTitle: el.$t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (arkistoi) {
    try {
      await Perusteprojektit.updatePerusteprojektiTila(meta.projektiId ? meta.projektiId : el.$route.params.projektiId, meta.tila);
      el.$success(el.$t('tilan-vaihto-' + meta.tila + '-onnistui'));
    }
    catch (e) {
      el.$fail(el.$t('tilan-vaihto-' + meta.tila + '-epaonnistui'));
    }
    if (meta.reroute) {
      el.$router.push({
        name: meta.reroute,
      });
    }

    if (meta.callback) {
      await meta.callback();
    }
  }
}
