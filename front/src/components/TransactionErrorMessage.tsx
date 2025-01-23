import React from "react";

type TransactionErrorMessageProps = {
  message: string;
  dismiss: React.MouseEventHandler<HTMLButtonElement>;
};

const TransactionErrorMessageProps: React.FunctionComponent<
  TransactionErrorMessageProps
> = ({ message, dismiss }) => {
  return (
    <div>
      TX error: {message}
      <button type="button" onClick={dismiss}>
        <span aria-hidden="true">$times;</span>
      </button>
    </div>
  );
};

export default TransactionErrorMessageProps;
