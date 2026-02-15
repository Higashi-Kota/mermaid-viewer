import { TextArea } from "@mermaid-demo/ui"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    placeholder: {
      control: { type: "text" },
    },
    rows: {
      control: { type: "number" },
    },
  },
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--primitive-space-8)", maxWidth: "400px" }}>
      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Default
        </h3>
        <TextArea
          id='textarea-default'
          name='textarea-default'
          placeholder='Enter your text...'
          rows={3}
          aria-label='Default textarea'
        />
      </section>

      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          With Value
        </h3>
        <TextArea
          id='textarea-value'
          name='textarea-value'
          defaultValue='This is some pre-filled content in the textarea.'
          rows={3}
          aria-label='Textarea with value'
        />
      </section>

      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Invalid
        </h3>
        <TextArea
          id='textarea-invalid'
          name='textarea-invalid'
          defaultValue='Invalid content'
          aria-invalid='true'
          rows={3}
          aria-label='Invalid textarea'
        />
      </section>

      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Disabled
        </h3>
        <TextArea
          id='textarea-disabled'
          name='textarea-disabled'
          defaultValue='Cannot edit this'
          disabled
          rows={3}
          aria-label='Disabled textarea'
        />
      </section>
    </div>
  ),
}

export const Placeholder: Story = {
  args: {
    placeholder: "Type something...",
    rows: 4,
    "aria-label": "Example textarea",
    id: "textarea-placeholder",
    name: "textarea-placeholder",
  },
}

export const Invalid: Story = {
  args: {
    defaultValue: "Invalid input",
    "aria-invalid": "true",
    rows: 3,
    "aria-label": "Invalid textarea",
    id: "textarea-invalid-story",
    name: "textarea-invalid-story",
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: "Read-only content",
    disabled: true,
    rows: 3,
    "aria-label": "Disabled textarea",
    id: "textarea-disabled-story",
    name: "textarea-disabled-story",
  },
}
