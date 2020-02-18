import { Computed } from '@shared/utils/interfaces'
import { PerusteQuery, PerusteprojektiKevytDto, PerusteprojektiListausDto } from '@shared/api/eperusteet'
import { Page } from '@shared/tyypit'


export interface IProjektiProvider {
  ownProjects: Computed<PerusteprojektiListausDto[]>;
  projects: Computed<Page<PerusteprojektiKevytDto>>;
  updateQuery: (query: PerusteQuery) => Promise<void>;
  updateOwnProjects: () => Promise<void>;
}
