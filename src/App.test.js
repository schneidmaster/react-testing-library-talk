import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { getJSON, postJSON } from "./api";

jest.mock("./api");

describe("App", () => {
  afterEach(() => {
    getJSON.mockClear();
    postJSON.mockClear();
  });

  it("renders", async () => {
    getJSON.mockImplementation((path) => {
      if (path === "/todos") {
        return [
          {
            id: 1,
            title: "Learn about testing React ⚛",
            status: "incomplete",
            userId: 1
          }
        ];
      } else {
        return [
          {
            id: 1,
            name: "Jack User"
          }
        ];
      }
    });

    postJSON.mockImplementation(() => {
      return {
        id: 2,
        title: "Write an integration test",
        status: "incomplete",
        userId: 1
      };
    });

    const { getByText, getByLabelText } = render(<App />);

    await waitFor(() => getByText(/Learn about testing React/));

    fireEvent.click(getByText("Add todo"));

    fireEvent.change(getByLabelText("Title"), {
      target: { value: "Write an integration test" }
    });

    fireEvent.change(getByLabelText("User"), {
      target: { value: 1 }
    });

    fireEvent.click(getByText("Add"));

    await waitFor(() => getByText(/Write an integration test/));
  });
});
