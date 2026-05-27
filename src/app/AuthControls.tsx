import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { LogOut } from 'lucide-react'

import { authSessionAtom, isAuthenticatedAtom, logoutAction } from '#entities/auth'
import { loginRoute } from '#pages/login'
import { m } from '#paraglide/messages.js'
import { Button, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

export const AuthControls = reatomComponent(() => {
	if (!isAuthenticatedAtom()) return null

	const session = authSessionAtom()

	return (
		<styled.div display="flex" flexDirection="column" gap="2" px="2">
			{session && (
				<styled.div display="flex" flexDirection="column" minW="0">
					<Text fontSize="sm" fontWeight="medium" truncate>
						{session.user.name}
					</Text>
					<Text fontSize="xs" color="muted" truncate>
						{session.user.email}
					</Text>
				</styled.div>
			)}
			<Button
				variant="plain"
				justifyContent="flex-start"
				onClick={wrap(async () => {
					await wrap(logoutAction())
					wrap(() => loginRoute.go(undefined, true))()
				})}
			>
				<LogOut />
				{m.auth_sign_out()}
			</Button>
		</styled.div>
	)
}, 'AuthControls')
