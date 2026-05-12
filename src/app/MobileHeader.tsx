import { reatomComponent } from '@reatom/react'

import { Skeleton } from '#shared/components'
import { headerTrailAtom, mobileHeaderOverrideAtom } from '#shared/model'
import type { HeaderTrailDescriptor } from '#shared/model/headerTrail'
import {
	BackButton,
	MobileHeader as MobileHeaderLayout,
	MobileHeaderTitle,
} from '#widgets/mobile-header'

type HeaderEntry = [number, HeaderTrailDescriptor]

const ParentBackButton = reatomComponent(({ entry }: { entry: HeaderEntry }) => {
	const [, parent] = entry
	if (!parent.href) return null

	return <BackButton href={parent.href} label={parent.backLabel?.() ?? parent.label()} />
}, 'ParentBackButton')

const CurrentHeaderTitle = reatomComponent(({ entry }: { entry: HeaderEntry }) => {
	const [, current] = entry
	if (current.isLoading?.()) return <Skeleton h="5" w="28" borderRadius="sm" />

	return <MobileHeaderTitle label={current.label()} />
}, 'CurrentHeaderTitle')

const ParentMobileHeader = ({
	parentEntry,
	currentEntry,
}: {
	parentEntry: HeaderEntry
	currentEntry: HeaderEntry
}) => (
	<MobileHeaderLayout button={<ParentBackButton entry={parentEntry} />}>
		<CurrentHeaderTitle entry={currentEntry} />
	</MobileHeaderLayout>
)

const RootMobileHeader = reatomComponent(({ entry }: { entry: HeaderEntry | undefined }) => {
	const label = entry?.[1]?.label()
	return (
		<MobileHeaderLayout>{label ? <MobileHeaderTitle label={label} /> : null}</MobileHeaderLayout>
	)
}, 'RootMobileHeader')

const HeaderTrailMobileHeader = ({ entries }: { entries: HeaderEntry[] }) => {
	const parentEntry = entries.at(-2)
	const currentEntry = entries.at(-1)

	return parentEntry && currentEntry ? (
		<ParentMobileHeader parentEntry={parentEntry} currentEntry={currentEntry} />
	) : (
		<RootMobileHeader entry={currentEntry} />
	)
}

export const MobileHeader = reatomComponent(() => {
	const Override = mobileHeaderOverrideAtom()
	if (Override) return <Override />

	const entries = [...headerTrailAtom().entries()].sort(([a], [b]) => a - b)
	return <HeaderTrailMobileHeader entries={entries} />
}, 'MobileHeader')
