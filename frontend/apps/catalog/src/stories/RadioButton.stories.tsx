import { RadioButton } from "@mermaid-demo/ui"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Components/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    label: {
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof RadioButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: "Default" },
  render: () => (
    <div style={{ display: "grid", gap: "var(--primitive-space-8)", maxWidth: "320px" }}>
      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Radio Group
        </h3>
        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontSize: "var(--primitive-text-sm)",
              fontWeight: "var(--primitive-weight-medium)",
              color: "var(--semantic-fg)",
              marginBlockEnd: "var(--primitive-space-3)",
            }}
          >
            Select a theme
          </legend>
          <div style={{ display: "grid", gap: "var(--primitive-space-1)" }}>
            <RadioButton id='theme-light' name='theme' label='Light' defaultChecked />
            <RadioButton id='theme-dark' name='theme' label='Dark' />
            <RadioButton id='theme-system' name='theme' label='System' />
          </div>
        </fieldset>
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
        <div style={{ display: "grid", gap: "var(--primitive-space-1)" }}>
          <RadioButton id='disabled-a' name='disabled-group' label='Option A' disabled />
          <RadioButton
            id='disabled-b'
            name='disabled-group'
            label='Option B'
            disabled
            defaultChecked
          />
        </div>
      </section>
    </div>
  ),
}

export const Checked: Story = {
  args: {
    label: "Selected option",
    id: "radio-checked",
    name: "radio-checked",
    defaultChecked: true,
  },
}

export const Unchecked: Story = {
  args: {
    label: "Unselected option",
    id: "radio-unchecked",
    name: "radio-unchecked",
  },
}

export const Disabled: Story = {
  args: {
    label: "Disabled option",
    id: "radio-disabled",
    name: "radio-disabled",
    disabled: true,
  },
}
