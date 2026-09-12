import type { LoginForm } from '#pages/login/model/routes'

import { wrap } from '@reatom/core'
import { bindField, reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Alert, Button, Field, Heading, Input, Text } from '#shared/components'
import { formAlertMessage, visibleFieldError } from '#shared/reatom'
import { styled } from '#styled-system/jsx'

export const LoginPage = reatomComponent(({ form }: { form: LoginForm }) => {
	const { fields, submit } = form
	// `formAlertMessage`, not `submit.error()` directly: it stays null while a
	// field-level validation owns the failure, so the alert never repeats a
	// message already printed under a field. The copy here is deliberately
	// canned — ApiError.message is a status string, not user-facing text.
	// `isErrorHandled` from the model as the handled-predicate: it accepts a
	// validation error only when every issue was mapped onto a field, so the
	// alert must not re-announce those — a mapped error outlives the field
	// errors it produced. Unmapped or mixed responses keep the alert.
	const showErrorAlert = formAlertMessage(form, form.isErrorHandled) !== null
	// `visibleFieldError`, not bindField's `error`: with `keepErrorOnChange:
	// false` the last issue lingers in Reatom without its `triggered` flag, and
	// reading that raw error would leave stale copy under the field while the
	// user fixes the value.
	const { error: _emailError, ...emailBind } = bindField(fields.email)
	const { error: _passwordError, ...passwordBind } = bindField(fields.password)
	const emailError = visibleFieldError(fields.email)
	const passwordError = visibleFieldError(fields.password)
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
				onSubmit={wrap(form.handleSubmit)}
			>
				<styled.div display="flex" flexDirection="column" gap="1">
					<Heading fontSize="2xl">{m.login_title()}</Heading>
					<Text color="muted">{m.login_description()}</Text>
				</styled.div>

				{showErrorAlert && (
					<Alert.Root status="error" role="alert">
						<Alert.Indicator />
						<Alert.Content>
							<Alert.Title>{m.login_error_title()}</Alert.Title>
							<Alert.Description>{m.login_error_description()}</Alert.Description>
						</Alert.Content>
					</Alert.Root>
				)}

				<Field.Root required invalid={Boolean(emailError)}>
					<Field.Label>{m.login_email()}</Field.Label>
					<Input
						ref={wrap((element) => {
							fields.email.elementRef.set(element ?? undefined)
						})}
						type="email"
						autoComplete="email"
						{...emailBind}
					/>
					{emailError && <Field.ErrorText>{emailError}</Field.ErrorText>}
				</Field.Root>

				<Field.Root required invalid={Boolean(passwordError)}>
					<Field.Label>{m.login_password()}</Field.Label>
					<Input
						ref={wrap((element) => {
							fields.password.elementRef.set(element ?? undefined)
						})}
						type="password"
						autoComplete="current-password"
						{...passwordBind}
					/>
					{passwordError && <Field.ErrorText>{passwordError}</Field.ErrorText>}
				</Field.Root>

				<Button type="submit" loading={pending} loadingText={m.login_signing_in()}>
					{m.login_submit()}
				</Button>
			</styled.form>
		</styled.main>
	)
}, 'LoginPage')
