import { reatomBoolean, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Switch } from '#shared/components'
import { featureTogglesAtom } from '#shared/model'
import { styled } from '#styled-system/jsx'

const togglePanelExpandedAtom = reatomBoolean(true, 'featureTogglePanel.expanded')

// Hidden entirely when the project declares no toggle names — otherwise the
// panel would offer switches nobody can see a use for.
export const FeatureTogglePanel = reatomComponent(() => {
	const expanded = togglePanelExpandedAtom()
	const toggles = featureTogglesAtom()

	// The names tuple's length type is literal per project, so compare through
	// a widened array type.
	if ((featureTogglesAtom.names as readonly unknown[]).length === 0) return null

	return (
		<styled.aside
			position="fixed"
			bottom="14"
			right="4"
			zIndex="sticky"
			w="240px"
			bg="surface"
			borderWidth="1px"
			borderColor="border.default"
			borderRadius="lg"
			boxShadow="lg"
			p="3"
		>
			<styled.button
				type="button"
				display="flex"
				alignItems="center"
				gap="2"
				w="full"
				color="text.heading"
				textStyle="bodyMed"
				onClick={wrap(togglePanelExpandedAtom.toggle)}
				aria-expanded={expanded}
			>
				<FlaskConical size={16} aria-hidden="true" />
				{m.toggles_title()}
				<styled.span ml="auto">
					{expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
				</styled.span>
			</styled.button>
			{expanded && (
				<styled.div
					display="grid"
					gap="2.5"
					mt="3"
					pt="3"
					borderTopWidth="1px"
					borderColor="border.subtle"
				>
					{featureTogglesAtom.names.map((feature) => (
						<Switch.Root
							key={feature}
							checked={toggles.includes(feature)}
							onCheckedChange={wrap(({ checked }) =>
								featureTogglesAtom.setFeature(feature, checked),
							)}
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							gap="3"
						>
							<Switch.Label textStyle="caption">{feature}</Switch.Label>
							<Switch.Control />
							<Switch.HiddenInput />
						</Switch.Root>
					))}
				</styled.div>
			)}
		</styled.aside>
	)
}, 'FeatureTogglePanel')
