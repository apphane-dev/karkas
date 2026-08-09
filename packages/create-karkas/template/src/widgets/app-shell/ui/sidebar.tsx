import type { PropsWithChildren } from 'react'

import { reatomBoolean, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { MenuIcon } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Drawer, IconButton } from '#shared/components'
import { css } from '#styled-system/css'

const sidebarAtom = reatomBoolean(false, 'sidebar.open')

export const SidebarDrawer = reatomComponent(({ children }: PropsWithChildren) => {
	return (
		<Drawer.Root
			open={sidebarAtom()}
			onOpenChange={wrap(({ open }) => void sidebarAtom.set(open))}
			placement="start"
		>
			<Drawer.Backdrop display={{ base: 'block', md: 'none' }} />
			<Drawer.Positioner display={{ base: 'flex', md: 'none' }}>
				<Drawer.Content maxW="220px" p="4" gap="1">
					{children}
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	)
}, 'SidebarDrawer')

export const SidebarToggleButton = reatomComponent(() => {
	return (
		<IconButton
			variant="plain"
			size="sm"
			display={{ base: 'inline-flex', md: 'none' }}
			aria-label={m.topbar_open_menu()}
			onClick={wrap(sidebarAtom.setTrue)}
		>
			<MenuIcon className={css({ w: '5', h: '5' })} />
		</IconButton>
	)
}, 'SidebarToggleButton')
