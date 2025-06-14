
export const TrainingSection = () => {
  const trainingOptions = [
    {
      title: "PERSONAL TRAINING",
      image:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=800&q=80", // Coach with client, training
    },
    {
      title: "GROUP FITNESS CLASS",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80", // Group fitness workout class indoors
    },
    {
      title: "FUNCTIONAL TRAINING",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80", // Man doing functional fitness/crossfit
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="font-bebas text-3xl mb-8 text-center">TRAININGS</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {trainingOptions.map((option, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden h-[200px] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />
              <img
                src={option.image}
                alt={option.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-bebas text-2xl">{option.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
