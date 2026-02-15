import { Button } from "@mermaid-demo/ui"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronRight, Plus } from "lucide-react"

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "ghost", "destructive"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--primitive-space-8)" }}>
      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Variants
        </h3>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-4)",
            alignItems: "center",
          }}
        >
          <Button variant='primary'>Primary</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='destructive'>Destructive</Button>
        </div>
      </section>

      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          Sizes
        </h3>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-4)",
            alignItems: "center",
          }}
        >
          <Button size='sm'>Small</Button>
          <Button size='md'>Medium</Button>
          <Button size='lg'>Large</Button>
        </div>
      </section>

      <section>
        <h3
          style={{
            fontSize: "var(--primitive-text-sm)",
            color: "var(--semantic-fg-muted)",
            marginBlockEnd: "var(--primitive-space-4)",
          }}
        >
          With Icons
        </h3>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-4)",
            alignItems: "center",
          }}
        >
          <Button iconBefore={<Plus size={16} />}>Add Item</Button>
          <Button iconAfter={<ChevronRight size={16} />}>Next</Button>
          <Button variant='secondary' iconBefore={<Plus size={16} />}>
            Create
          </Button>
        </div>
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
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-4)",
            alignItems: "center",
          }}
        >
          <Button disabled>Primary</Button>
          <Button variant='secondary' disabled>
            Secondary
          </Button>
          <Button variant='ghost' disabled>
            Ghost
          </Button>
          <Button variant='destructive' disabled>
            Destructive
          </Button>
        </div>
      </section>
    </div>
  ),
}

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
  },
}

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
}

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
}

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
}

export const WithIconBefore: Story = {
  args: {
    children: "Add Item",
    iconBefore: <Plus size={16} />,
  },
}

export const WithIconAfter: Story = {
  args: {
    children: "Next",
    iconAfter: <ChevronRight size={16} />,
  },
}

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
}
