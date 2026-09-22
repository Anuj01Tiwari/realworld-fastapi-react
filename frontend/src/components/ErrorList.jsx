import React from 'react';

export const ErrorList = ({ errors }) => {
  if (!errors) return null;

  const errorMessages = [];
  if (typeof errors === 'string') {
    errorMessages.push(errors);
  } else if (typeof errors === 'object') {
    Object.keys(errors).forEach((key) => {
      const val = errors[key];
      if (Array.isArray(val)) {
        val.forEach((msg) => errorMessages.push(`${key} ${msg}`));
      } else if (typeof val === 'string') {
        errorMessages.push(`${key} ${val}`);
      }
    });
  }

  if (errorMessages.length === 0) return null;

  return (
    <ul className="error-messages my-4">
      {errorMessages.map((msg, index) => (
        <li key={index}>{msg}</li>
      ))}
    </ul>
  );
};

export default ErrorList;
