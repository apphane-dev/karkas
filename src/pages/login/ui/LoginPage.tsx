import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { authErrorAtom, authPendingAtom, loginAction } from '#entities/auth'
import { m } from '#paraglide/messages.js'
import { Alert, Button, Field, Heading, Input, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

const emailFieldId = 'login-email'
const passwordFieldId = 'login-password'

export const LoginPage = reatomComponent(({ onSuccess }: { onSuccess: () => void }) => {
	const error = authErrorAtom()
	const pending = authPendingAtom()

	return (
		<styled.main minH="100dvh" display="grid" placeItems="center" bg="gray.2" px="4" py="8">
			<styled.form
				w="full"
				maxW="380px"
				bg="bg.default"
				borderWidth="1px"
				borderColor="border"
				borderRadius="md"
				p="6"
				display="flex"
				flexDirection="column"
				gap="5"
				onSubmit={wrap(async (event) => {
					event.preventDefault()
					const form = new FormData(event.currentTarget)
					const didLogin = await wrap(
						loginAction({
							email: String(form.get('email') ?? ''),
							password: String(form.get('password') ?? ''),
						}),
					)
					if (!didLogin) return
					wrap(onSuccess)()
				})}
			>
				<styled.div display="flex" flexDirection="column" gap="1">
					<Heading fontSize="2xl">{m.login_title()}</Heading>
					<Text color="muted">{m.login_description()}</Text>
				</styled.div>

				{error && (
					<Alert.Root status="error" role="alert">
						<Alert.Indicator />
						<Alert.Content>
							<Alert.Title>{m.login_error_title()}</Alert.Title>
							<Alert.Description>{m.login_error_description()}</Alert.Description>
						</Alert.Content>
					</Alert.Root>
				)}

				<Field.Root required>
					<Field.Label htmlFor={emailFieldId}>{m.login_email()}</Field.Label>
					<Input
						id={emailFieldId}
						name="email"
						type="email"
						autoComplete="email"
						defaultValue="alex@example.com"
					/>
				</Field.Root>

				<Field.Root required>
					<Field.Label htmlFor={passwordFieldId}>{m.login_password()}</Field.Label>
					<Input
						id={passwordFieldId}
						name="password"
						type="password"
						autoComplete="current-password"
						defaultValue="password"
					/>
				</Field.Root>

				<Button type="submit" loading={pending} loadingText={m.login_signing_in()}>
					{m.login_submit()}
				</Button>
			</styled.form>
		</styled.main>
	)
}, 'LoginPage')
