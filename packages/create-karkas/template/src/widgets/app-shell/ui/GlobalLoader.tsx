import { isSomeLoaderPending } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Progress } from '#shared/components'

export const GlobalLoader = reatomComponent(() => {
	return (
		<Progress.Root
			value={null}
			variant="subtle"
			size="xs"
			bgColor="white"
			position="fixed"
			top="0"
			left="0"
			right="0"
			pointerEvents="none"
			zIndex="banner"
			hidden={!isSomeLoaderPending()}
		>
			<Progress.Track>
				<Progress.Range />
			</Progress.Track>
		</Progress.Root>
	)
}, 'GlobalLoader')
