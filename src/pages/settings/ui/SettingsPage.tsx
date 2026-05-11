import { createListCollection } from '@ark-ui/react/select'
import { wrap } from '@reatom/core'
import { bindField, reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, Input, Select, Switch, VisuallyHidden } from '#shared/components'
import {
	localeAtom,
	reatomLoc,
	showGithubLinkInTopBarAtom,
	showLanguageSwitcherInTopBarAtom,
	showThemeSwitcherInTopBarAtom,
	themePreferenceAtom,
} from '#shared/model'
import { styled } from '#styled-system/jsx'

import type {
	Density,
	DesktopNotification,
	EmailNotification,
	SettingsPageModel,
} from '../model/settingsForm'
import { FieldRow } from './FieldRow'
import { Section } from './Section'

const emailNotificationsCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.settings_notif_all(), value: 'all' },
				{ label: m.settings_notif_important(), value: 'important' },
				{ label: m.settings_notif_none(), value: 'none' },
			],
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'settings.emailNotificationsCollection',
)

const desktopNotificationsCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.settings_notif_enabled(), value: 'enabled' },
				{ label: m.settings_notif_disabled(), value: 'disabled' },
			],
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'settings.desktopNotificationsCollection',
)

const themeCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.settings_theme_light(), value: 'light' },
				{ label: m.settings_theme_dark(), value: 'dark' },
				{ label: m.settings_theme_system(), value: 'system' },
			],
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'settings.themeCollection',
)

const densityCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.settings_density_compact(), value: 'compact' },
				{ label: m.settings_density_comfortable(), value: 'comfortable' },
				{ label: m.settings_density_spacious(), value: 'spacious' },
			],
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'settings.densityCollection',
)

const languageCollection = reatomLoc(
	() =>
		createListCollection({
			items: localeAtom.locales.map((locale) => ({
				label: localeAtom.label(locale)(),
				value: locale,
			})),
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'settings.languageCollection',
)

export const SettingsPage = reatomComponent(({ model }: { model: SettingsPageModel }) => {
	const { profileForm, saveProfile, notificationsForm, saveNotifications, appearanceForm } = model

	return (
		<styled.div p="8" maxW="800px">
			<VisuallyHidden as="h1">{m.settings_title()}</VisuallyHidden>

			<Section
				title={m.settings_profile()}
				footer={
					profileForm.focus().dirty ? (
						<Button size="sm" onClick={wrap(() => saveProfile())}>
							{m.settings_save_changes()}
						</Button>
					) : null
				}
			>
				<FieldRow label={m.settings_display_name()} description={m.settings_display_name_desc()}>
					<Input {...bindField(profileForm.fields.displayName)} size="sm" />
				</FieldRow>
				<FieldRow label={m.settings_email()} description={m.settings_email_desc()}>
					<Input {...bindField(profileForm.fields.email)} size="sm" />
				</FieldRow>
				<FieldRow label={m.settings_role()}>
					<styled.span fontSize="sm" color="muted">
						{m.settings_role_admin()}
					</styled.span>
				</FieldRow>
			</Section>

			<Section
				title={m.settings_notifications()}
				footer={
					notificationsForm.focus().dirty ? (
						<Button size="sm" onClick={wrap(() => saveNotifications())}>
							{m.settings_save_changes()}
						</Button>
					) : null
				}
			>
				<FieldRow
					label={m.settings_email_notifications()}
					description={m.settings_email_notifications_desc()}
				>
					<Select.Root
						collection={emailNotificationsCollection()}
						size="sm"
						w="100%"
						value={[notificationsForm.fields.emailNotif.value()]}
						onValueChange={wrap(({ value }) => {
							notificationsForm.fields.emailNotif.change((value[0] ?? 'all') as EmailNotification)
						})}
						positioning={{ sameWidth: true }}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{emailNotificationsCollection().items.map((item) => (
									<Select.Item key={item.value} item={item}>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</FieldRow>
				<FieldRow
					label={m.settings_desktop_notifications()}
					description={m.settings_desktop_notifications_desc()}
				>
					<Select.Root
						collection={desktopNotificationsCollection()}
						size="sm"
						w="100%"
						value={[notificationsForm.fields.desktopNotif.value()]}
						onValueChange={wrap(({ value }) => {
							notificationsForm.fields.desktopNotif.change(
								(value[0] ?? 'enabled') as DesktopNotification,
							)
						})}
						positioning={{ sameWidth: true }}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{desktopNotificationsCollection().items.map((item) => (
									<Select.Item key={item.value} item={item}>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</FieldRow>
			</Section>

			<Section title={m.settings_top_bar()}>
				<FieldRow
					label={m.settings_show_language_switcher()}
					description={m.settings_show_language_switcher_desc()}
				>
					<Switch.Root
						checked={showLanguageSwitcherInTopBarAtom()}
						onCheckedChange={wrap(({ checked }) => showLanguageSwitcherInTopBarAtom.set(checked))}
					>
						<Switch.HiddenInput />
						<Switch.Control />
					</Switch.Root>
				</FieldRow>
				<FieldRow
					label={m.settings_show_github_link()}
					description={m.settings_show_github_link_desc()}
				>
					<Switch.Root
						checked={showGithubLinkInTopBarAtom()}
						onCheckedChange={wrap(({ checked }) => showGithubLinkInTopBarAtom.set(checked))}
					>
						<Switch.HiddenInput />
						<Switch.Control />
					</Switch.Root>
				</FieldRow>
				<FieldRow
					label={m.settings_show_theme_switcher()}
					description={m.settings_show_theme_switcher_desc()}
				>
					<Switch.Root
						checked={showThemeSwitcherInTopBarAtom()}
						onCheckedChange={wrap(({ checked }) => showThemeSwitcherInTopBarAtom.set(checked))}
					>
						<Switch.HiddenInput />
						<Switch.Control />
					</Switch.Root>
				</FieldRow>
			</Section>

			<Section title={m.settings_appearance()}>
				<FieldRow label={m.settings_theme()} description={m.settings_theme_desc()}>
					<Select.Root
						collection={themeCollection()}
						size="sm"
						w="100%"
						value={[themePreferenceAtom()]}
						onValueChange={wrap(({ value }) => void themePreferenceAtom.set(value[0]))}
						positioning={{ sameWidth: true }}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{themeCollection().items.map((item) => (
									<Select.Item key={item.value} item={item}>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</FieldRow>
				<FieldRow label={m.settings_density()} description={m.settings_density_desc()}>
					<Select.Root
						collection={densityCollection()}
						size="sm"
						w="100%"
						value={[appearanceForm.fields.density.value()]}
						onValueChange={wrap(({ value }) => {
							appearanceForm.fields.density.change((value[0] ?? 'compact') as Density)
						})}
						positioning={{ sameWidth: true }}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{densityCollection().items.map((item) => (
									<Select.Item key={item.value} item={item}>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</FieldRow>
				<FieldRow label={m.settings_language()} description={m.settings_language_desc()}>
					<Select.Root
						collection={languageCollection()}
						size="sm"
						w="100%"
						value={[localeAtom()]}
						onValueChange={wrap((details) => void localeAtom.set(details.value[0]))}
						positioning={{ sameWidth: true }}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Trigger>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{languageCollection().items.map((item) => (
									<Select.Item key={item.value} item={item}>
										<Select.ItemText>{item.label}</Select.ItemText>
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
						<Select.HiddenSelect />
					</Select.Root>
				</FieldRow>
			</Section>
		</styled.div>
	)
}, 'SettingsPage')
