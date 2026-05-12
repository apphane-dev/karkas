import type { ComponentProps } from 'react'

import { ark } from '@ark-ui/react/factory'

import { styled } from '#styled-system/jsx'
import { group } from '#styled-system/recipes'

export type GroupProps = ComponentProps<typeof Group>
export const Group = styled(ark.div, group)
