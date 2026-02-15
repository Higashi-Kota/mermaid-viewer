import { StepZoomControls } from "@mermaid-demo/mermaid"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

const meta = {
  title: "Mermaid/StepZoomControls",
  component: StepZoomControls,
  tags: ["autodocs"],
  args: {
    onNext: fn(),
    onPrevious: fn(),
    onExit: fn(),
  },
  argTypes: {
    isActive: { control: { type: "boolean" } },
    currentIndex: { control: { type: "number" } },
    totalSteps: { control: { type: "number" } },
  },
} satisfies Meta<typeof StepZoomControls>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isActive: true,
    currentIndex: 1,
    totalSteps: 5,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Toolbar role
    const toolbar = canvas.getByRole("toolbar")
    await expect(toolbar).toHaveAttribute("aria-label", "Step zoom navigation")

    // Counter shows correct format
    await expect(canvas.getByText("2 / 5")).toBeInTheDocument()

    // Counter has aria-live
    const counter = canvas.getByText("2 / 5")
    await expect(counter).toHaveAttribute("aria-live", "polite")

    // Previous and Next are enabled
    const prevBtn = canvas.getByLabelText("Previous step")
    const nextBtn = canvas.getByLabelText("Next step")
    await expect(prevBtn).toBeEnabled()
    await expect(nextBtn).toBeEnabled()

    // Exit is always enabled
    const exitBtn = canvas.getByLabelText("Exit step zoom")
    await expect(exitBtn).toBeEnabled()

    // Click callbacks
    await userEvent.click(nextBtn)
    await expect(args.onNext).toHaveBeenCalledTimes(1)

    await userEvent.click(prevBtn)
    await expect(args.onPrevious).toHaveBeenCalledTimes(1)

    await userEvent.click(exitBtn)
    await expect(args.onExit).toHaveBeenCalledTimes(1)
  },
}

export const FirstStep: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Previous button is disabled at first step
    const prevBtn = canvas.getByLabelText("Previous step")
    await expect(prevBtn).toBeDisabled()

    // Next is still enabled
    const nextBtn = canvas.getByLabelText("Next step")
    await expect(nextBtn).toBeEnabled()

    // Counter
    await expect(canvas.getByText("1 / 5")).toBeInTheDocument()
  },
}

export const LastStep: Story = {
  args: {
    isActive: true,
    currentIndex: 4,
    totalSteps: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Next button is disabled at last step
    const nextBtn = canvas.getByLabelText("Next step")
    await expect(nextBtn).toBeDisabled()

    // Previous is still enabled
    const prevBtn = canvas.getByLabelText("Previous step")
    await expect(prevBtn).toBeEnabled()

    // Counter
    await expect(canvas.getByText("5 / 5")).toBeInTheDocument()
  },
}

export const SingleStep: Story = {
  args: {
    isActive: true,
    currentIndex: 0,
    totalSteps: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Both prev and next are disabled
    const prevBtn = canvas.getByLabelText("Previous step")
    const nextBtn = canvas.getByLabelText("Next step")
    await expect(prevBtn).toBeDisabled()
    await expect(nextBtn).toBeDisabled()

    // Counter
    await expect(canvas.getByText("1 / 1")).toBeInTheDocument()
  },
}

export const Inactive: Story = {
  args: {
    isActive: false,
    currentIndex: 0,
    totalSteps: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Renders nothing when inactive
    const toolbar = canvas.queryByRole("toolbar")
    await expect(toolbar).toBeNull()
  },
}
