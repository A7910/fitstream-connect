import { Button } from "@/components/ui/button";
import { Activity, Award, Users } from "lucide-react";

const Hero = () => {
  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Fitness Journey with{" "}
            <span className="text-primary">FitHub</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your all-in-one platform for gym management, fitness tracking, and
            achieving your wellness goals.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
            Start Your Journey
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Activity,
    title: "Track Your Progress",
    description:
      "Monitor your fitness journey with detailed insights and analytics.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Join a community of fitness enthusiasts and share your achievements.",
  },
  {
    icon: Award,
    title: "Achieve Goals",
    description:
      "Set personalized fitness goals and celebrate your milestones.",
  },
];

export default Hero;