import { CardDescription, CardTitle } from "@/components/ui/card";

const WorkoutPlanHeader = () => {
  return (
    <>
      <CardTitle className="font-bebas text-4xl text-primary">Your Workout Plan</CardTitle>
      <CardDescription className="font-poppins text-gray-600">
        Choose your fitness goal and muscle group to see relevant exercises
      </CardDescription>
    </>
  );
};

export default WorkoutPlanHeader;