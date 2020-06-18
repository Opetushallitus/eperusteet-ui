import { Perusteprojektit } from '@shared/api/eperusteet';

export async function arkistoiPeruste(el, meta) {
  const arkistoi = await el.$bvModal.msgBoxConfirm(el.$t(meta.confirm) as any, {
    title: el.$t(meta.title),
    okVariant: 'primary',
    okTitle: el.$t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (arkistoi) {
    await Perusteprojektit.updatePerusteprojektiTila(el.$route.params.projektiId, 'poistettu');
    el.$router.push({
      name: meta.reroute,
    });
  }
}
