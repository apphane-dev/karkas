import { reatomComponent } from '@reatom/react'
import { Fragment } from 'react'

import { Breadcrumb, Skeleton } from '#shared/components'
import { breadcrumbsOverrideAtom, headerTrailAtom } from '#shared/model'

export const HeaderBreadcrumbs = reatomComponent(() => {
	const Override = breadcrumbsOverrideAtom()
	if (Override) return <Override />

	const descriptors = headerTrailAtom()
	if (descriptors.size === 0) return null

	const entries = [...descriptors.entries()].sort(([a], [b]) => a - b)

	return (
		<Breadcrumb.Root size="sm">
			<Breadcrumb.List>
				{entries.map(([level, descriptor], index) => {
					const isLast = index === entries.length - 1
					const isLoading = descriptor.isLoading?.()
					return (
						<Fragment key={level}>
							{index > 0 && <Breadcrumb.Separator />}
							{isLast ? (
								<Breadcrumb.Item aria-current="page" fontWeight="semibold" color="fg.default">
									{isLoading ? <Skeleton h="4" w="20" borderRadius="sm" /> : descriptor.label()}
								</Breadcrumb.Item>
							) : (
								<Breadcrumb.Item>
									<Breadcrumb.Link href={descriptor.href} color="fg.muted">
										{descriptor.label()}
									</Breadcrumb.Link>
								</Breadcrumb.Item>
							)}
						</Fragment>
					)
				})}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	)
}, 'HeaderBreadcrumbs')
