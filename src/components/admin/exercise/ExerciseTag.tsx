import React from 'react';

interface ExerciseTagProps {
  label: string;
}

const ExerciseTag = ({ label }: ExerciseTagProps) => {
  return (
    <span className="inline-flex text-xs bg-secondary text-white px-2 py-1 rounded whitespace-nowrap">
      {label}
    </span>
  );
};

export default ExerciseTag;