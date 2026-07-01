import { action, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ChevronsUpDown, LogOut, Plus } from 'lucide-react'

import { authSessionAtom, logoutAction } from '#entities/auth'
import { resetCurrentPlanId } from '#entities/pricing'
import { m } from '#paraglide/messages.js'
import { Menu, Text } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

// App-layer logout orchestration: clears cross-entity cached state that must
// not survive a session change, then performs the auth logout. Lives here
// (above entities) so it may import both `auth` and `pricing` statically.
// `logoutAction` clears the session before its (possibly failing) API call, so
// swallow that rejection to keep sign-out resilient to a logout API failure.
const signOut = action(async () => {
	resetCurrentPlanId()
	await wrap(logoutAction()).catch(() => {})
}, 'app.signOut')

const OrgItem = ({ name, email, active }: { name: string; email: string; active?: boolean }) => (
	<styled.div display="flex" alignItems="center" gap="2" minW="0">
		<styled.div
			w="7"
			h="7"
			borderRadius="md"
			bg="colorPalette.3"
			flexShrink={0}
			display="flex"
			alignItems="center"
			justifyContent="center"
			fontSize="xs"
			fontWeight="bold"
			color="colorPalette.11"
		>
			{name.charAt(0)}
		</styled.div>
		<styled.div flex="1" minW="0">
			<Text fontSize="sm" fontWeight="medium" truncate>
				{name}
			</Text>
			<Text fontSize="xs" color="muted" truncate>
				{email}
			</Text>
		</styled.div>
		{active && <Menu.ItemIndicator />}
	</styled.div>
)

export const OrgSwitcher = reatomComponent(() => {
	const session = authSessionAtom()

	return (
		<Menu.Root positioning={{ placement: 'bottom-start' }}>
			<Menu.Trigger
				asChild
				className={css({ '[data-sidebar-collapsed] &': { justifyContent: 'center' } })}
			>
				<styled.button
					display="flex"
					alignItems="center"
					gap="2"
					w="100%"
					px="2"
					py="2"
					borderRadius="md"
					cursor="pointer"
					bg="transparent"
					border="none"
					color="inherit"
					_hover={{ bg: 'colorPalette.surface.bg.active' }}
				>
					<styled.div
						w="8"
						h="8"
						borderRadius="md"
						bg="colorPalette.3"
						flexShrink={0}
						display="flex"
						alignItems="center"
						justifyContent="center"
						fontSize="xs"
						fontWeight="bold"
						color="colorPalette.11"
					>
						{session?.user.name.charAt(0) ?? ''}
					</styled.div>
					<styled.div
						flex="1"
						minW="0"
						textAlign="left"
						className={css({ '[data-sidebar-collapsed] &': { display: 'none' } })}
					>
						<styled.div fontSize="sm" fontWeight="medium" truncate>
							Acme Inc
						</styled.div>
						<styled.div fontSize="xs" color="muted" truncate>
							{session?.user.email}
						</styled.div>
					</styled.div>
					<ChevronsUpDown
						className={css({
							w: '4',
							h: '4',
							color: 'muted',
							flexShrink: '0',
							'[data-sidebar-collapsed] &': { display: 'none' },
						})}
					/>
				</styled.button>
			</Menu.Trigger>
			<Menu.Positioner>
				<Menu.Content minW="56">
					{session && (
						<styled.div px="3" py="2" mb="1">
							<Text fontSize="sm" fontWeight="medium">
								{session.user.name}
							</Text>
							<Text fontSize="xs" color="muted">
								{session.user.email}
							</Text>
						</styled.div>
					)}
					<Menu.Separator />
					<Menu.ItemGroup id="orgs">
						<Menu.ItemGroupLabel>Organizations</Menu.ItemGroupLabel>
						<Menu.Item value="acme">
							<OrgItem name="Acme Inc" email="alex@acme.io" active />
						</Menu.Item>
						<Menu.Item value="personal">
							<OrgItem name="Personal" email={session?.user.email ?? ''} />
						</Menu.Item>
					</Menu.ItemGroup>
					<Menu.Separator />
					<Menu.Item value="create-org">
						<styled.div display="flex" alignItems="center" gap="2">
							<Plus className={css({ w: '4', h: '4' })} />
							Create organization
						</styled.div>
					</Menu.Item>
					<Menu.Separator />
					<Menu.Item value="sign-out" onClick={wrap(() => signOut())}>
						<styled.div display="flex" alignItems="center" gap="2" color="red.fg">
							<LogOut className={css({ w: '4', h: '4' })} />
							{m.auth_sign_out()}
						</styled.div>
					</Menu.Item>
				</Menu.Content>
			</Menu.Positioner>
		</Menu.Root>
	)
}, 'OrgSwitcher')
