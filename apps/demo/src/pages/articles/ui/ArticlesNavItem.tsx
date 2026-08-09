import { reatomComponent } from '@reatom/react'
import { FileText } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { articlesRoute } from '../model/routes'

export const ArticlesNavItem = reatomComponent(
	() => (
		<a href={articlesRoute.path()}>
			<SideNavButton active={articlesRoute.match()}>
				<SideNavItemContent Icon={FileText} label={m.nav_articles()} />
			</SideNavButton>
		</a>
	),
	'ArticlesNavItem',
)
