import { action, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ChevronsUpDown, LogOut } from 'lucide-react'

import { authSessionAtom, logoutAction } from '#entities/auth'
import { m } from '#paraglide/messages.js'
import { Menu, Text } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

// App-layer sign-out orchestration. `logoutAction` clears the session before
// its (possibly failing) API call, so swallow that rejection to keep sign-out
// resilient to a logout API failure.
const signOut = action(async () => {
	await wrap(logoutAction()).catch(() => {})
}, 'app.signOut')

export const AccountMenu = reatomComponent(() => {
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
							{session?.user.name ?? ''}
						</styled.div>
						<styled.div fontSize="xs" color="muted" truncate>
							{session?.user.email ?? ''}
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
}, 'AccountMenu')
