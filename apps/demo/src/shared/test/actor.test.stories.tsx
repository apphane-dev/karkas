import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { createActor, heading, role, text } from '.'

const TestComponent = () => (
	<div>
		<h1>Page Title</h1>
		<main role="main">
			<h2>Section Heading</h2>
			<p>Section content</p>
			<article>
				<h3>Article Heading</h3>
				<p>Article content</p>
			</article>
			<ul aria-label="Prices">
				<li>$10</li>
				<li>$20</li>
			</ul>
			<label>
				Username
				<input defaultValue="alex" />
			</label>
		</main>
	</div>
)

const I = createActor()

const meta = preview.meta({
	title: 'Testing/Actor',
	component: TestComponent,
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const ScopeBasic = meta.story({ name: 'scope() basic usage' })

ScopeBasic.test('finds elements within scoped parent', async () => {
	// Without scope - searches from document root
	await I.see(heading('Page Title'))

	// With scope - searches within main element
	await I.scope(role('main'), async () => {
		await I.see(heading('Section Heading'))
		await I.see(text('Section content'))
	})

	const headingText = await I.within(role('main'), () => I.grabTextFrom(heading('Section Heading')))
	expect(headingText).toBe('Section Heading')

	// After scope - searches from root again
	await I.see(heading('Page Title'))
})

export const ScopeNested = meta.story({ name: 'scope() nested scopes' })

ScopeNested.test('nested scopes resolve relative to outer scope', async () => {
	await I.scope(role('main'), async () => {
		// Outer scope: searches within main
		await I.see(heading('Section Heading'))

		await I.scope(role('article'), async () => {
			// Inner scope: searches within article (which is within main)
			await I.see(heading('Article Heading'))
			await I.see(text('Article content'))
			// Should NOT find section content
			await I.dontSee(text('Section content'))
		})

		// Back to outer scope: can see section content again
		await I.see(text('Section content'))
	})
})

export const ScopeErrors = meta.story({ name: 'scope() error handling' })

ScopeErrors.test('restores scope when callback throws', async () => {
	await I.see(heading('Page Title'))

	let errorThrown = false
	try {
		await I.scope(role('main'), async () => {
			// Verify we're in scope first
			await I.see(heading('Section Heading'))
			// This will throw
			await I.see(text('Does not exist'))
		})
	} catch {
		errorThrown = true
		// Scope should be restored - can search from root again
		await I.see(heading('Page Title'))
	}

	expect(errorThrown).toBe(true)
})

ScopeErrors.test('throws immediately if scope locator fails', async () => {
	let callbackExecuted = false
	let errorThrown = false

	try {
		await I.scope(role('nonexistent'), async () => {
			callbackExecuted = true
		})
	} catch {
		errorThrown = true
		// Callback should never execute
		expect(callbackExecuted).toBe(false)
	}

	expect(errorThrown).toBe(true)
})

export const CodeceptBorrowedHelpers = meta.story({ name: 'Codecept-inspired helpers' })

CodeceptBorrowedHelpers.test('grabs text, checks counts, and reads fields', async () => {
	await I.seeNumberOfElements(text(/^\$/).all(), 2)
	await I.seeNumberOfElements(text('Missing price').all(), 0)
	expect(await I.grabTextFromAll(text(/^\$/).all())).toEqual(['$10', '$20'])
	expect(await I.grabValueFrom(role('textbox', 'Username'))).toBe('alex')
	await I.dontSeeInField(role('textbox', 'Username'), 'sam')
})

CodeceptBorrowedHelpers.test('supports tryTo, retryTo, and soft assertions', async () => {
	expect(await I.tryTo(() => I.see(text('Does not exist')))).toBe(false)

	let attempts = 0
	const result = await I.retryTo(
		(tryNumber) => {
			attempts = tryNumber
			if (tryNumber < 2) throw new Error('not yet')
			return 'done'
		},
		2,
		0,
	)
	expect(result).toBe('done')
	expect(attempts).toBe(2)

	expect(await I.hopeThat(() => I.see(text('Still does not exist')))).toBe(false)
	expect(() => I.hopeThat.noErrors()).toThrow(/soft assertion/)
})
