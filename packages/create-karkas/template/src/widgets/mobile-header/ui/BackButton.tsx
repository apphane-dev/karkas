import { ArrowLeft } from 'lucide-react'

import { IconButton } from '#shared/components'
import { css } from '#styled-system/css'

export function BackButton({ href, label }: { href: string; label: string }) {
	return (
		<IconButton asChild variant="plain" size="sm">
			<a href={href} aria-label={label}>
				<ArrowLeft className={css({ w: '5', h: '5' })} />
			</a>
		</IconButton>
	)
}
