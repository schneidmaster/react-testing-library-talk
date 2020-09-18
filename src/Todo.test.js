import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Todo from "./Todo";
import { patchJSON } from "./api";

jest.mock("./api");

describe("Todo", () => {
  afterEach(() => patchJSON.mockClear());

  it("checks the box", async () => {
    patchJSON.mockImplementation(() => {
      return {
        id: 1,
        title: "Write more tests",
        status: "complete",
        userId: 1
      };
    });

    const updateTodo = jest.fn();
    const { getByRole } = render(
      <Todo
        todo={{
          id: 1,
          title: "Write more tests",
          status: "incomplete",
          userId: 1
        }}
        users={[{ id: 1, name: "Zach Schneider" }]}
        updateTodo={updateTodo}
      />
    );

    fireEvent.click(getByRole("checkbox"));

    await waitFor(() =>
      expect(patchJSON).toBeCalledWith("/todos/1", { status: "complete" })
    );
  });
});
