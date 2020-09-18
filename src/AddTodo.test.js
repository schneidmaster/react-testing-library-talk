import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import AddTodo from "./AddTodo";
import { postJSON } from "./api";

jest.mock("./api");

describe("AddTodo", () => {
  afterEach(() => postJSON.mockClear());

  it("adds a new todo", async () => {
    postJSON.mockImplementation(() => {
      return {
        id: 3,
        title: "Write some tests",
        status: "incomplete",
        userId: 2
      };
    });

    const addTodo = jest.fn();
    const users = [
      {
        id: 1,
        name: "Zach Schneider"
      },
      {
        id: 2,
        name: "Jon Knapp"
      }
    ];

    const { getByText, getByLabelText } = render(
      <AddTodo users={users} addTodo={addTodo} />
    );

    fireEvent.click(getByText("Add todo"));

    fireEvent.change(getByLabelText("Title"), {
      target: { value: "Write some tests" }
    });

    fireEvent.change(getByLabelText("User"), {
      target: { value: 2 }
    });

    fireEvent.click(getByText("Add"));

    await waitFor(() =>
      expect(postJSON).toBeCalledWith("/todos", {
        title: "Write some tests",
        userId: 2,
        status: "incomplete"
      })
    );
  });
});
