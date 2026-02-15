import { StepListEditor } from "@mermaid-demo/mermaid"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

const sampleNodeIds = ["A", "B", "C"]
const sampleNodeLabels = new Map([
  ["A", "Start"],
  ["B", "Process"],
  ["C", "End"],
])

const meta = {
  title: "Mermaid/StepListEditor",
  component: StepListEditor,
  tags: ["autodocs"],
  args: {
    onDescriptionChange: fn(),
    onStepClick: fn(),
  },
} satisfies Meta<typeof StepListEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    nodeIds: sampleNodeIds,
    nodeLabels: sampleNodeLabels,
    descriptions: { A: "Initial step", B: "", C: "" },
    isActive: true,
    currentIndex: 0,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Renders all step buttons
    const buttons = canvas.getAllByRole("button")
    await expect(buttons.length).toBe(3)

    // Current step has aria-current="step"
    await expect(buttons[0]).toHaveAttribute("aria-current", "step")

    // Non-current steps lack aria-current
    await expect(buttons[1]).not.toHaveAttribute("aria-current")
    await expect(buttons[2]).not.toHaveAttribute("aria-current")

    // Clicking a step button calls onStepClick with index
    await userEvent.click(buttons[1])
    await expect(args.onStepClick).toHaveBeenCalledWith(1)

    // Textarea maxLength
    const textareas = canvas.getAllByRole("textbox")
    await expect(textareas[0]).toHaveAttribute("maxLength", "200")

    // First textarea has existing description
    await expect(textareas[0]).toHaveValue("Initial step")
  },
}

export const NoDescriptions: Story = {
  args: {
    nodeIds: sampleNodeIds,
    nodeLabels: sampleNodeLabels,
    descriptions: {},
    isActive: true,
    currentIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All textareas are empty
    const textareas = canvas.getAllByRole("textbox")
    for (const textarea of textareas) {
      await expect(textarea).toHaveValue("")
    }
  },
}

export const InactiveMode: Story = {
  args: {
    nodeIds: sampleNodeIds,
    nodeLabels: sampleNodeLabels,
    descriptions: {},
    isActive: false,
    currentIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // No buttons have aria-current when inactive
    const buttons = canvas.getAllByRole("button")
    for (const button of buttons) {
      await expect(button).not.toHaveAttribute("aria-current")
    }
  },
}

export const MiddleStepActive: Story = {
  args: {
    nodeIds: sampleNodeIds,
    nodeLabels: sampleNodeLabels,
    descriptions: {},
    isActive: true,
    currentIndex: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Second step has aria-current
    const buttons = canvas.getAllByRole("button")
    await expect(buttons[0]).not.toHaveAttribute("aria-current")
    await expect(buttons[1]).toHaveAttribute("aria-current", "step")
    await expect(buttons[2]).not.toHaveAttribute("aria-current")
  },
}

export const EmptyNodeIds: Story = {
  args: {
    nodeIds: [],
    nodeLabels: new Map(),
    descriptions: {},
    isActive: false,
    currentIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Renders nothing when nodeIds is empty
    const buttons = canvas.queryAllByRole("button")
    await expect(buttons.length).toBe(0)
  },
}
