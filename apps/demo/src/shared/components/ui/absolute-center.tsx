import type { ComponentProps } from 'react'

import { ark } from '@ark-ui/react/factory'

import { styled } from '#styled-system/jsx'
import { absoluteCenter } from '#styled-system/recipes'

export type AbsoluteCenterProps = ComponentProps<typeof AbsoluteCenter>
export const AbsoluteCenter = styled(ark.div, absoluteCenter)
