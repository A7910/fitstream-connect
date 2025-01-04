import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutGoalManager from "./WorkoutGoalManager";
import ExerciseManager from "./ExerciseManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkoutManagement = () => {
  const [activeTab, setActiveTab] = useState("workout-goals");
  const isMobile = useIsMobile();

  const tabs = [
    { id: "workout-goals", label: "Workout Goals" },
    { id: "exercises", label: "Exercises" },
  ];

  const getActiveTabLabel = () => {
    return tabs.find((tab) => tab.id === activeTab)?.label || tabs[0].label;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                >
                  {getActiveTabLabel()}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                {tabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onSelect={() => setActiveTab(tab.id)}
                    className="cursor-pointer"
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="workout-goals">
            <WorkoutGoalManager />
          </TabsContent>

          <TabsContent value="exercises">
            <ExerciseManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutManagement;