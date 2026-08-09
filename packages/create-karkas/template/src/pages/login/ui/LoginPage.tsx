import type { LoginForm } from '#pages/login/model/routes'

import { wrap } from '@reatom/core'
import { bindField, reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Alert, Button, Field, Heading, Input, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

export const LoginPage = reatomComponent(({ form }: { form: LoginForm }) => {
	const { fields, submit } = form
	const error = submit.error()
	const pending = !submit.ready()

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
				onSubmit={wrap((event) => {
					event.preventDefault()
					submit()
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
					<Field.Label>{m.login_email()}</Field.Label>
					<Input type="email" autoComplete="email" {...bindField(fields.email)} />
				</Field.Root>

				<Field.Root required>
					<Field.Label>{m.login_password()}</Field.Label>
					<Input type="password" autoComplete="current-password" {...bindField(fields.password)} />
				</Field.Root>

				<Button type="submit" loading={pending} loadingText={m.login_signing_in()}>
					{m.login_submit()}
				</Button>
			</styled.form>
		</styled.main>
	)
}, 'LoginPage')
