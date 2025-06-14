export const TrainingSection = () => {
  const trainingOptions = [
    {
      title: "PERSONAL TRAINING",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80", // Personal trainer working with client
    },
    {
      title: "GROUP FITNESS CLASS",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", // Group fitness class with people exercising
    },
    {
      title: "FUNCTIONAL TRAINING",
      image:
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80", // Functional training with equipment
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
