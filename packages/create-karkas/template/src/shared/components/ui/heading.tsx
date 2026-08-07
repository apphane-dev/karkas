import type { StyledComponent } from '#styled-system/types'
import type { ComponentProps } from 'react'

import { styled } from '#styled-system/jsx'
import { type HeadingVariantProps, heading } from '#styled-system/recipes'

type Props = HeadingVariantProps & { as?: React.ElementType }

export type HeadingProps = ComponentProps<typeof Heading>
export const Heading = styled('h2', heading) as StyledComponent<'h2', Props>
