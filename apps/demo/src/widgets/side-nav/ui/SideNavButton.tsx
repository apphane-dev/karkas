import type { ReactNode } from 'react'

import { Button } from '#shared/components'

export function SideNavButton({ active, children }: { active?: boolean; children: ReactNode }) {
	return (
		<Button as="span" variant={active ? 'subtle' : 'plain'} w="full" justifyContent="flex-start">
			{children}
		</Button>
	)
}
