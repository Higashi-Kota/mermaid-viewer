import { StepZoomCaption } from "@mermaid-demo/mermaid"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

const meta = {
  title: "Mermaid/StepZoomCaption",
  component: StepZoomCaption,
  tags: ["autodocs"],
  argTypes: {
    isActive: { control: { type: "boolean" } },
    currentIndex: { control: { type: "number" } },
    totalSteps: { control: { type: "number" } },
  },
} satisfies Meta<typeof StepZoomCaption>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 3,
    nodeId: "A",
    nodeLabels: new Map([
      ["A", "Start"],
      ["B", "Process"],
      ["C", "End"],
    ]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Displays step number
    await expect(canvas.getByText("Step 1 / 3")).toBeInTheDocument()

    // Displays node label in heading
    const heading = canvas.getByRole("heading", { level: 2 })
    await expect(heading).toHaveTextContent("Start")
  },
}

export const WithDescription: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 3,
    nodeId: "A",
    nodeLabels: new Map([["A", "Start"]]),
    descriptions: { A: "Begin the process here" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Displays description paragraph
    await expect(canvas.getByText("Begin the process here")).toBeInTheDocument()

    // Also displays label
    const heading = canvas.getByRole("heading", { level: 2 })
    await expect(heading).toHaveTextContent("Start")
  },
}

export const NoLabel: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 1,
    nodeId: "X",
    nodeLabels: new Map(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Falls back to nodeId when no label
    const heading = canvas.getByRole("heading", { level: 2 })
    await expect(heading).toHaveTextContent("X")
  },
}

export const Inactive: Story = {
  args: {
    isActive: false,
    currentIndex: 0,
    totalSteps: 3,
    nodeId: "A",
    nodeLabels: new Map([["A", "Start"]]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Renders nothing when inactive
    const heading = canvas.queryByRole("heading")
    await expect(heading).toBeNull()
  },
}

export const NullNodeId: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 3,
    nodeId: null,
    nodeLabels: new Map([["A", "Start"]]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Renders nothing when nodeId is null
    const heading = canvas.queryByRole("heading")
    await expect(heading).toBeNull()
  },
}
