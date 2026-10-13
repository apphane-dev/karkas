'use client'
import type { HTMLStyledProps } from '#styled-system/jsx'
import type { FieldVariantProps } from '#styled-system/recipes'
import type { JSX } from 'react'

import { Field } from '@ark-ui/react/field'

import { createSlotRecipeContext } from '#styled-system/jsx'
import { field } from '#styled-system/recipes'

const { withProvider, withContext } = createSlotRecipeContext(field)

export type RootProps = HTMLStyledProps<typeof Field.Root> & FieldVariantProps
// Keep Ark's public component type instead of expanding its private field IDs.
export const Root: (props: RootProps) => JSX.Element = withProvider(Field.Root, 'root')
export const RootProvider = withProvider(Field.RootProvider, 'root')
export const ErrorText = withContext(Field.ErrorText, 'errorText')
export const HelperText = withContext(Field.HelperText, 'helperText')
export const Label = withContext(Field.Label, 'label')
export const RequiredIndicator = withContext(Field.RequiredIndicator, 'requiredIndicator')

export { FieldContext as Context } from '@ark-ui/react/field'
