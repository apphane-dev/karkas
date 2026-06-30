import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function SettingsPageLoading() {
	return (
		<styled.div role="status" aria-label={m.settings_loading_page()} p="8" maxW="800px">
			<Skeleton h="8" w="32" mb="8" />
			<Skeleton h="40" w="full" borderRadius="lg" mb="4" />
			<Skeleton h="32" w="full" borderRadius="lg" />
		</styled.div>
	)
}
