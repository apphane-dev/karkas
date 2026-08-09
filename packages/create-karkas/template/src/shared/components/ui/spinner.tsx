import type { ComponentProps } from 'react'

import { ark } from '@ark-ui/react/factory'

import { styled } from '#styled-system/jsx'
import { spinner } from '#styled-system/recipes'

export type SpinnerProps = ComponentProps<typeof Spinner>
export const Spinner = styled(ark.span, spinner)
