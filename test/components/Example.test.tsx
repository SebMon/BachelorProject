import { render, cleanup, screen } from "@testing-library/react";
import Example from "../../src/components/Example";
import { it, expect, afterEach } from "vitest";
import React from "react";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  cleanup()
})

it("runs tests", () => {
  expect(2 + 2).toBe(4);
});

it("starts count at 0", () => {
  // Arrange
  render(<Example/>)

  // Assert
  expect(screen.getByRole("button").textContent).toMatch(/0/)
});

it("changes count to 1 when the button is clicked once", async () => {
  // Arrange
  render(<Example/>)

  // Act
  await userEvent.click(screen.getByRole("button"))

  // Assert
  expect(screen.getByRole("button").textContent).not.toMatch(/0/)
  expect(screen.getByRole("button").textContent).toMatch(/1/)
});

it("changes count to 2 when the button is clicked twixe", async () => {
  // Arrange
  render(<Example/>)

  // Act
  await userEvent.click(screen.getByRole("button"))
  await userEvent.click(screen.getByRole("button"))

  // Assert
  expect(screen.getByRole("button").textContent).not.toMatch(/0/)
  expect(screen.getByRole("button").textContent).not.toMatch(/1/)
  expect(screen.getByRole("button").textContent).toMatch(/2/)
});