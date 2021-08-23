import React from "react";

interface IDotProps {
  title?: string;
}

export const Dot: React.FunctionComponent<IDotProps> = (props) => {
  const { title, children } = props;

  return (
    <div
      title={title}
      data-testid="dot"
      className="h-7 w-7 flex items-center justify-center text-center text-sm font-bold leading-none text-white bg-red-600 rounded-full"
      style={{ transform: "rotate(0.1deg)" }}
    >
      {children}
    </div>
  );
};
