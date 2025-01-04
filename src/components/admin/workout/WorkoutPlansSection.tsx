import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import WorkoutGoalManager from "../WorkoutGoalManager";
import ExerciseManager from "../ExerciseManager";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 5;

const WorkoutPlansSection = () => {
  const [goalsPage, setGoalsPage] = useState(1);
  const [exercisesPage, setExercisesPage] = useState(1);

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="workout-goals">
          <AccordionTrigger>Workout Goals</AccordionTrigger>
          <AccordionContent>
            <WorkoutGoalManager 
              page={goalsPage} 
              itemsPerPage={ITEMS_PER_PAGE} 
              onPageChange={setGoalsPage}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="exercises">
          <AccordionTrigger>Exercises</AccordionTrigger>
          <AccordionContent>
            <ExerciseManager 
              page={exercisesPage} 
              itemsPerPage={ITEMS_PER_PAGE} 
              onPageChange={setExercisesPage}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default WorkoutPlansSection;