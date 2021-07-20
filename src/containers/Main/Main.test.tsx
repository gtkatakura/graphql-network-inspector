import React from "react";
import { render, fireEvent, within } from "@testing-library/react";
import { Main } from "./index";
import { chromeProvider } from "../../services/chromeProvider";
import { mockChrome } from "../../mocks/mock-chrome";
import { act } from "react-dom/test-utils";

jest.mock("../../services/chromeProvider");

const mockChromeProvider = chromeProvider as jest.Mock;

const mockOnNavigated = () => {
  let triggerOnNavigated: () => void;
  mockChromeProvider.mockReturnValue({
    ...mockChrome,
    devtools: {
      ...mockChrome.devtools,
      network: {
        ...mockChrome.devtools.network,
        onNavigated: {
          addListener: (cb: any) => {
            triggerOnNavigated = cb;
          },
          removeListener: () => {},
        },
      },
    },
  });

  return () => {
    triggerOnNavigated();
  };
};

describe("Main", () => {
  beforeEach(() => {
    mockChromeProvider.mockReturnValue(mockChrome);
  });

  it("renders the table only by default", () => {
    const { queryByTestId } = render(<Main />);

    expect(queryByTestId("network-table")).toBeInTheDocument();
    expect(queryByTestId("network-tabs")).not.toBeInTheDocument();
  });

  it("opens the side panel when clicking a table row", () => {
    const { getAllByText, getByTestId } = render(<Main />);

    fireEvent.click(getAllByText(/getMovie/i)[0]);

    expect(getByTestId("network-tabs")).toBeInTheDocument();
  });

  it("closes the side panel when clicking the 'x' button", () => {
    const { queryByTestId, getByTestId, getAllByText } = render(<Main />);

    fireEvent.click(getAllByText(/getMovie/i)[0]);
    fireEvent.click(getByTestId("close-side-panel"));

    expect(queryByTestId("network-tabs")).not.toBeInTheDocument();
  });

  it("renders all network data within the table", () => {
    const { queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    if (!table) {
      throw new Error("Table not found in dom");
    }
    const { queryAllByRole } = within(table);

    expect(queryAllByRole("row")).toHaveLength(51);
  });

  it("renders correct values for each column within the table", () => {
    const { queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    if (!table) {
      throw new Error("Table not found in dom");
    }
    const { queryAllByRole: queryAllByRoleWithinTable } = within(table);
    const row = queryAllByRoleWithinTable("row")[1];
    const { queryByTestId: queryByTestIdWithinRow } = within(row);

    expect(queryByTestIdWithinRow("column-query")).toHaveTextContent(
      "QgetMovie"
    );
    expect(queryByTestIdWithinRow("column-url")).toHaveTextContent(
      "http://graphql-network-monitor.com/graphql"
    );
    expect(queryByTestIdWithinRow("column-time")).toHaveTextContent("1s");
    expect(queryByTestIdWithinRow("column-size")).toHaveTextContent("3.36 kB");
  });

  it("clears the table of all network data when clicking the clear button", () => {
    const { queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    const { getByTestId, queryAllByRole } = within(table!);

    fireEvent.click(getByTestId("clear-network-table"));

    expect(queryAllByRole("row")).toHaveLength(1);
  });

  it("clears the table of all network data when reloading", () => {
    const triggerOnNavigated = mockOnNavigated();

    const { queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    const { queryAllByRole } = within(table!);

    act(() => {
      triggerOnNavigated();
    });

    expect(queryAllByRole("row")).toHaveLength(1);
  });

  it("does not clear the table of all network data when reloading and preserve log checked", () => {
    const triggerOnNavigated = mockOnNavigated();

    const { getByTestId, queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    const { queryAllByRole } = within(table!);

    act(() => {
      fireEvent.click(getByTestId("preserve-log-checkbox"));
    });

    act(() => {
      triggerOnNavigated();
    });

    expect(queryAllByRole("row")).toHaveLength(51);
  });

  it("filters network data with the given search query", () => {
    const { getByTestId, queryByTestId } = render(<Main />);
    const table = queryByTestId("network-table");
    const { queryAllByRole } = within(table!);
    const filterInput = getByTestId("filter-input") as HTMLInputElement;

    act(() => {
      fireEvent.change(filterInput, {
        target: { value: "getmovie" },
      });
    });

    expect(filterInput.value).toBe("getmovie");
    expect(queryAllByRole("row")).toHaveLength(11);
    queryAllByRole("row").forEach((row, i) => {
      // First row is header
      if (i !== 0) {
        expect(row).toHaveTextContent("getMovie");
      }
    });
  });
});
