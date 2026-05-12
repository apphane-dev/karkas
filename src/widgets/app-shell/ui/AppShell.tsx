import { SiGithub } from '@icons-pack/react-simple-icons'
import { atom, computed, memo, reatomBoolean, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Languages, Monitor, Moon, PanelLeft, Search, Sun } from 'lucide-react'
import { type CSSProperties, type ReactNode } from 'react'

import { m } from '#paraglide/messages.js'
import { Heading, IconButton, Input, Kbd, Menu } from '#shared/components'
import {
	localeAtom,
	showGithubLinkInTopBarAtom,
	showLanguageSwitcherInTopBarAtom,
	showThemeSwitcherInTopBarAtom,
	themePreferenceAtom,
} from '#shared/model'
import { withResizeObserver } from '#shared/reatom'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

import { GlobalLoader } from './GlobalLoader'
import { SidebarDrawer } from './sidebar'

type Props = {
	appName: string
	sidebarContent: ReactNode
	sidebarFooter: ReactNode
	mobileHeader: ReactNode
	breadcrumbs: ReactNode
	children: ReactNode
}

const desktopSidebarCollapsedAtom = reatomBoolean(false, 'desktopSidebar.collapsed')

const measureRefAtom = atom<HTMLElement | null>(null, 'appShell.measureRef').extend(
	withResizeObserver(),
	(target) => ({
		height: computed(
			() => memo(() => target.sizeEntry()?.contentRect.height) ?? 0,
			'appShell.headerHeight',
		),
	}),
)

const SidebarBrand = ({ appName }: { appName: string }) => (
	<styled.div mb="3" px="2" h="10" display="flex" alignItems="center">
		<Heading
			fontSize="lg"
			fontWeight="bold"
			className={css({
				opacity: 1,
				visibility: 'visible',
				whiteSpace: 'nowrap',
				transition: 'opacity 0.12s ease',
				transitionDelay: '0.2s',
				'[data-sidebar-collapsed] &': {
					opacity: 0,
					visibility: 'hidden',
					transitionDelay: '0s',
				},
			})}
		>
			<a href="/">{appName}</a>
		</Heading>
	</styled.div>
)

const SidebarInner = ({
	appName,
	content,
	footer,
}: {
	appName: string
	content: ReactNode
	footer: ReactNode
}) => (
	<>
		<SidebarBrand appName={appName} />
		<styled.div
			flex="1"
			minH="0"
			overflowY="auto"
			display="flex"
			flexDirection="column"
			gap="1"
			p={2}
			m={-2}
		>
			{content}
		</styled.div>
		{footer && (
			<styled.div mt="auto" pt="3" borderTopWidth="1px" borderColor="border">
				{footer}
			</styled.div>
		)}
	</>
)

const DesktopSidebar = ({
	isCollapsed,
	children,
}: {
	isCollapsed: boolean
	children: ReactNode
}) => (
	<styled.aside
		w={isCollapsed ? '60px' : '240px'}
		overflow="hidden"
		flexShrink={0}
		bg="gray.2"
		borderRightWidth="1px"
		borderColor="border"
		display={{ base: 'none', md: 'flex' }}
		flexDirection="column"
		p={isCollapsed ? '2' : '4'}
		gap="1"
		position={{ md: 'sticky' }}
		top="0"
		alignSelf={{ md: 'flex-start' }}
		h="100dvh"
		className={css({ transition: 'width 0.2s ease, padding 0.2s ease' })}
		data-sidebar-collapsed={isCollapsed ? '' : undefined}
	>
		{children}
	</styled.aside>
)

const MobileHeaderSlot = ({ children }: { children: ReactNode }) => (
	<styled.div display={{ base: 'flex', md: 'none' }} alignItems="center" flex="1" minW="0">
		{children}
	</styled.div>
)

const SidebarToggleButton = reatomComponent(
	() => (
		<IconButton
			variant="plain"
			size="xs"
			display={{ base: 'none', md: 'inline-flex' }}
			position="absolute"
			left="0"
			top="50%"
			bg="gray.1"
			borderWidth="1px"
			borderColor="border"
			borderRadius="full"
			aria-label={m.topbar_toggle_sidebar()}
			onClick={wrap(desktopSidebarCollapsedAtom.toggle)}
			className={css({ transform: 'translate(-50%, -50%)' })}
		>
			<PanelLeft />
		</IconButton>
	),
	'SidebarToggleButton',
)

const BreadcrumbsSlot = ({ children }: { children: ReactNode }) => (
	<styled.div display={{ base: 'none', md: 'flex' }} alignItems="center" minW="0">
		{children}
	</styled.div>
)

const SearchControls = () => (
	<>
		<IconButton
			variant="plain"
			size="sm"
			display={{ base: 'none', md: 'inline-flex', xl: 'none' }}
			aria-label={m.topbar_search_placeholder()}
		>
			<Search />
		</IconButton>
		<styled.div display={{ base: 'none', xl: 'flex' }} alignItems="center" gap="2">
			<Search className={css({ w: '4', h: '4', color: 'gray.10', flexShrink: 0 })} />
			<Input
				placeholder={m.topbar_search_placeholder()}
				size="sm"
				variant="outline"
				bg="transparent"
				borderWidth="0"
				w="180px"
				_focus={{ borderWidth: '0', outline: 'none', boxShadow: 'none' }}
			/>
			<Kbd flexShrink={0}>⌘K</Kbd>
		</styled.div>
	</>
)

const GithubButton = reatomComponent(() => {
	if (!showGithubLinkInTopBarAtom()) return null

	return (
		<IconButton
			variant="plain"
			size="sm"
			display={{ base: 'none', md: 'inline-flex' }}
			asChild
			aria-label={m.topbar_github_link_label()}
		>
			<a href="https://github.com/guria/modern-stack" target="_blank" rel="noopener noreferrer">
				<SiGithub />
			</a>
		</IconButton>
	)
}, 'GithubButton')

const LanguageSwitcher = reatomComponent(() => {
	if (!showLanguageSwitcherInTopBarAtom()) return null

	return (
		<Menu.Root positioning={{ placement: 'bottom-end' }}>
			<Menu.Trigger asChild>
				<IconButton
					variant="plain"
					size="sm"
					display={{ base: 'none', md: 'inline-flex' }}
					aria-label={m.topbar_language_switcher_label()}
				>
					<Languages />
				</IconButton>
			</Menu.Trigger>
			<Menu.Positioner>
				<Menu.Content>
					<Menu.RadioItemGroup
						id="locale"
						value={localeAtom()}
						onValueChange={wrap(({ value }) => void localeAtom.set(value))}
					>
						{localeAtom.locales.map((locale) => (
							<Menu.RadioItem key={locale} value={locale}>
								<Menu.ItemText>{localeAtom.label(locale)()}</Menu.ItemText>
								<Menu.ItemIndicator />
							</Menu.RadioItem>
						))}
					</Menu.RadioItemGroup>
				</Menu.Content>
			</Menu.Positioner>
		</Menu.Root>
	)
}, 'LanguageSwitcher')

const ThemeIcon = ({ preference }: { preference: ReturnType<typeof themePreferenceAtom> }) => {
	if (preference === 'system') return <Monitor />
	return preference === 'dark' ? <Moon /> : <Sun />
}

const ThemeSwitcher = reatomComponent(() => {
	if (!showThemeSwitcherInTopBarAtom()) return null

	return (
		<IconButton
			variant="plain"
			size="sm"
			display={{ base: 'none', md: 'inline-flex' }}
			onClick={wrap(() => {
				const next = { system: 'light', light: 'dark', dark: 'system' } as const
				themePreferenceAtom.set(next[themePreferenceAtom()])
			})}
			aria-label={m.topbar_toggle_theme_label()}
		>
			<ThemeIcon preference={themePreferenceAtom()} />
		</IconButton>
	)
}, 'ThemeSwitcher')

const TopBar = ({ mobileHeader, breadcrumbs }: Pick<Props, 'mobileHeader' | 'breadcrumbs'>) => (
	<styled.header
		display="flex"
		alignItems="center"
		gap="2"
		px={{ base: '3', md: '6' }}
		h="14"
		borderBottomWidth="1px"
		borderColor="border"
		bg="gray.1"
	>
		<MobileHeaderSlot>{mobileHeader}</MobileHeaderSlot>
		<SidebarToggleButton />
		<BreadcrumbsSlot>{breadcrumbs}</BreadcrumbsSlot>
		<styled.div ml="auto" />
		<SearchControls />
		<GithubButton />
		<LanguageSwitcher />
		<ThemeSwitcher />
	</styled.header>
)

export const AppShell = reatomComponent(
	({ appName, sidebarContent, sidebarFooter, mobileHeader, breadcrumbs, children }: Props) => {
		const isCollapsed = desktopSidebarCollapsedAtom()
		const sidebarInner = (
			<SidebarInner appName={appName} content={sidebarContent} footer={sidebarFooter} />
		)

		return (
			<styled.div display="flex" minH="100dvh" position="relative">
				<SidebarDrawer>{sidebarInner}</SidebarDrawer>
				<DesktopSidebar isCollapsed={isCollapsed}>{sidebarInner}</DesktopSidebar>
				<styled.div
					display="flex"
					flex="1"
					flexDirection="column"
					minW="0"
					isolation="isolate"
					style={{ '--app-header-h': measureRefAtom.height() + 'px' } as CSSProperties}
				>
					<styled.div
						ref={wrap((node) => void measureRefAtom.set(node))}
						position="sticky"
						top="0"
						zIndex="sticky"
					>
						<TopBar mobileHeader={mobileHeader} breadcrumbs={breadcrumbs} />
					</styled.div>
					{children}
				</styled.div>
				<GlobalLoader />
			</styled.div>
		)
	},
	'AppShell',
)
