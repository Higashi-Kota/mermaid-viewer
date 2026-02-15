import { IconButton } from "@mermaid-demo/ui"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Edit, Menu, Plus, Settings, Trash2, X } from "lucide-react"

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    pressed: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { icon: <Plus size={16} />, "aria-label": "Default" },
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
          Icons
        </h3>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-3)",
            alignItems: "center",
          }}
        >
          <IconButton icon={<Plus size={16} />} aria-label='Add' />
          <IconButton icon={<Edit size={16} />} aria-label='Edit' />
          <IconButton icon={<Trash2 size={16} />} aria-label='Delete' />
          <IconButton icon={<Settings size={16} />} aria-label='Settings' />
          <IconButton icon={<Menu size={16} />} aria-label='Menu' />
          <IconButton icon={<X size={16} />} aria-label='Close' />
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
            gap: "var(--primitive-space-3)",
            alignItems: "center",
          }}
        >
          <IconButton icon={<Plus size={14} />} aria-label='Add (small)' size='sm' />
          <IconButton icon={<Plus size={16} />} aria-label='Add (medium)' size='md' />
          <IconButton icon={<Plus size={20} />} aria-label='Add (large)' size='lg' />
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
          States
        </h3>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "max-content",
            gap: "var(--primitive-space-3)",
            alignItems: "center",
          }}
        >
          <IconButton icon={<Settings size={16} />} aria-label='Active' pressed />
          <IconButton icon={<Settings size={16} />} aria-label='Disabled' disabled />
        </div>
      </section>
    </div>
  ),
}

export const Medium: Story = {
  args: {
    icon: <Plus size={16} />,
    "aria-label": "Add item",
    size: "md",
  },
}

export const Pressed: Story = {
  args: {
    icon: <Settings size={16} />,
    "aria-label": "Toggle settings",
    pressed: true,
  },
}

export const DisabledState: Story = {
  args: {
    icon: <Trash2 size={16} />,
    "aria-label": "Delete (disabled)",
    disabled: true,
  },
}
